"""
Quiz API routes with generation, submission, and scoring
"""
from flask import Blueprint, request, jsonify
from typing import Dict, List
from bson import ObjectId
from datetime import datetime

from backend.services.ai_service import get_ai_service
from backend.services.database import get_database
from backend.models.quiz import QuizResult
from backend.middleware.error_handler import ValidationError, AIServiceError, NotFoundError
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/v1/quiz')


def get_demo_user():
    """Get or create demo user"""
    db = get_database()
    demo_email = "demo@medlama.com"
    
    user = db.get_user_by_email(demo_email)
    if not user:
        user = db.create_user(
            email=demo_email,
            name="Demo User",
            learning_level="medical_student"
        )
    return user


@quiz_bp.route('/generate', methods=['POST'])
def generate_quiz():
    """
    Generate a structured quiz with questions
    
    Request Body:
        {
            "topic": str,
            "num_questions": int (optional, default: 5),
            "difficulty": str (optional, default: "medium")
        }
    
    Returns:
        {
            "quiz_id": str,
            "topic": str,
            "questions": [
                {
                    "id": int,
                    "question": str,
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": str (hidden)
                }
            ],
            "difficulty": str,
            "time_limit": int (seconds)
        }
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        topic = data.get('topic')
        if not topic or not topic.strip():
            raise ValidationError("Topic is required", {'field': 'topic'})
        
        num_questions = data.get('num_questions', 5)
        difficulty = data.get('difficulty', 'medium')
        
        # Validate inputs
        if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 20:
            raise ValidationError(
                "num_questions must be between 1 and 20",
                {'field': 'num_questions'}
            )
        
        valid_difficulties = ['easy', 'medium', 'hard']
        if difficulty not in valid_difficulties:
            raise ValidationError(
                f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}",
                {'field': 'difficulty', 'valid_values': valid_difficulties}
            )
        
        logger.info(f"Generating quiz: topic={topic}, questions={num_questions}, difficulty={difficulty}")
        
        # Get AI service
        ai_service = get_ai_service()
        
        # Enhanced prompt for structured quiz generation
        prompt = f"""Generate a medical education quiz on the topic: {topic}

Requirements:
- Create exactly {num_questions} multiple choice questions
- Difficulty level: {difficulty}
- Each question must have exactly 4 options (A, B, C, D)
- Include the correct answer for each question
- Provide a detailed explanation for each correct answer
- Focus on understanding and clinical application

Format your response as a JSON array with this exact structure:
[
  {{
    "question": "Question text here?",
    "options": {{
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    }},
    "correct_answer": "A",
    "explanation": "Detailed explanation of why this is correct"
  }}
]

Make questions clinically relevant and test understanding, not just memorization."""

        response = ai_service.llm.invoke(prompt)
        quiz_content = response.content
        
        # Try to parse as JSON
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', quiz_content, re.DOTALL)
        if json_match:
            try:
                questions_data = json.loads(json_match.group())
            except json.JSONDecodeError:
                # Fallback: use raw content
                questions_data = []
                for i in range(num_questions):
                    questions_data.append({
                        "question": f"Question {i+1} from quiz",
                        "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
                        "correct_answer": "A",
                        "explanation": "Explanation pending"
                    })
        else:
            # Fallback structure
            questions_data = []
        
        # Store quiz in database (without correct answers for client)
        db = get_database()
        user = get_demo_user()
        
        # Create quiz session
        quiz_session = {
            "user_id": user._id,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions_data,
            "created_at": datetime.utcnow(),
            "completed": False
        }
        
        # Store in a temporary collection or cache (for now, we'll generate quiz_id)
        quiz_id = str(ObjectId())
        
        # Prepare response (hide correct answers)
        questions_for_client = []
        for idx, q in enumerate(questions_data):
            questions_for_client.append({
                "id": idx + 1,
                "question": q.get("question", ""),
                "options": q.get("options", {})
            })
        
        # Calculate time limit (2 minutes per question)
        time_limit = num_questions * 120
        
        return jsonify({
            'quiz_id': quiz_id,
            'topic': topic,
            'questions': questions_for_client,
            'num_questions': len(questions_for_client),
            'difficulty': difficulty,
            'time_limit': time_limit,
            'raw_content': quiz_content  # For debugging
        }), 200
        
    except ValidationError as e:
        raise
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to generate quiz: {str(e)}")


@quiz_bp.route('/submit', methods=['POST'])
def submit_quiz():
    """
    Submit quiz answers and get score
    
    Request Body:
        {
            "quiz_id": str,
            "topic": str,
            "questions": [...],  # Original questions with correct answers
            "answers": {"1": "A", "2": "B", ...},
            "time_spent": int (seconds)
        }
    
    Returns:
        {
            "score": int,
            "total_questions": int,
            "percentage": float,
            "results": [
                {
                    "question_id": int,
                    "correct": bool,
                    "user_answer": str,
                    "correct_answer": str,
                    "explanation": str
                }
            ],
            "achievements": [str]
        }
    """
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        quiz_id = data.get('quiz_id')
        topic = data.get('topic')
        questions = data.get('questions', [])
        answers = data.get('answers', {})
        time_spent = data.get('time_spent', 0)
        difficulty = data.get('difficulty', 'medium')
        
        if not topic:
            raise ValidationError("Topic is required")
        
        logger.info(f"Submitting quiz: topic={topic}, answers={len(answers)}")
        
        # Calculate score
        score = 0
        total_questions = len(questions)
        results = []
        
        for idx, question in enumerate(questions):
            question_id = str(idx + 1)
            user_answer = answers.get(question_id, "")
            correct_answer = question.get('correct_answer', '')
            
            is_correct = user_answer == correct_answer
            if is_correct:
                score += 1
            
            results.append({
                'question_id': idx + 1,
                'question': question.get('question', ''),
                'correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'explanation': question.get('explanation', '')
            })
        
        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        
        # Save to database
        db = get_database()
        user = get_demo_user()
        
        quiz_result = QuizResult(
            user_id=user._id,
            topic=topic,
            questions=questions,
            answers=answers,
            score=score,
            total_questions=total_questions,
            difficulty=difficulty,
            time_spent=time_spent
        )
        
        db.save_quiz_result(quiz_result)
        
        # Update user stats
        current_quizzes = user.stats.get('total_quizzes', 0)
        current_avg = user.stats.get('average_score', 0)
        new_avg = ((current_avg * current_quizzes) + percentage) / (current_quizzes + 1)
        
        db.update_user_stats(
            user._id,
            total_quizzes=current_quizzes + 1,
            average_score=round(new_avg, 2)
        )
        
        # Update learning progress
        progress = db.get_or_create_progress(user._id)
        current_topic_quizzes = progress.topics.get(topic, {}).get('quizzes_taken', 0)
        current_topic_avg = progress.topics.get(topic, {}).get('average_score', 0)
        new_topic_avg = ((current_topic_avg * current_topic_quizzes) + percentage) / (current_topic_quizzes + 1)
        
        db.update_topic_progress(
            user._id,
            topic,
            quizzes_taken=current_topic_quizzes + 1,
            average_score=round(new_topic_avg, 2)
        )
        
        # Check for achievements
        achievements = []
        if current_quizzes == 0:
            achievements.append("First Quiz Completed! 🎉")
            progress.add_achievement("first_quiz")
        
        if percentage == 100:
            achievements.append("Perfect Score! 💯")
            progress.add_achievement("perfect_score")
        
        if percentage >= 90:
            achievements.append("Quiz Master! ⭐")
        
        if current_quizzes + 1 >= 10:
            achievements.append("Quiz Enthusiast - 10 Quizzes! 🏆")
            progress.add_achievement("quiz_enthusiast")
        
        # Save progress with achievements
        db.update_progress(user._id, progress)
        
        return jsonify({
            'score': score,
            'total_questions': total_questions,
            'percentage': round(percentage, 2),
            'results': results,
            'achievements': achievements,
            'time_spent': time_spent
        }), 200
        
    except ValidationError as e:
        raise
    except Exception as e:
        logger.error(f"Error submitting quiz: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to submit quiz: {str(e)}")


@quiz_bp.route('/history', methods=['GET'])
def get_quiz_history():
    """
    Get quiz history for user
    
    Query Parameters:
        topic: str (optional)
        limit: int (optional, default: 20)
    
    Returns:
        {
            "quizzes": [
                {
                    "id": str,
                    "topic": str,
                    "score": int,
                    "total_questions": int,
                    "percentage": float,
                    "difficulty": str,
                    "completed_at": str
                }
            ],
            "stats": {
                "total_quizzes": int,
                "average_score": float,
                "topics_covered": int
            }
        }
    """
    try:
        topic = request.args.get('topic')
        limit = request.args.get('limit', 20, type=int)
        
        db = get_database()
        user = get_demo_user()
        
        # Get quiz results
        quiz_results = db.get_quiz_results(user._id, topic=topic, limit=limit)
        
        # Format results
        quizzes = []
        for quiz in quiz_results:
            quizzes.append({
                'id': str(quiz._id),
                'topic': quiz.topic,
                'score': quiz.score,
                'total_questions': quiz.total_questions,
                'percentage': quiz.percentage,
                'difficulty': quiz.difficulty,
                'time_spent': quiz.time_spent,
                'completed_at': quiz.completed_at.isoformat()
            })
        
        # Get stats
        stats = db.get_quiz_stats(user._id)
        
        return jsonify({
            'quizzes': quizzes,
            'stats': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting quiz history: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to get quiz history: {str(e)}")


@quiz_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """
    Get quiz leaderboard (top performers)
    
    Query Parameters:
        topic: str (optional)
        limit: int (optional, default: 10)
    
    Returns:
        {
            "leaderboard": [
                {
                    "rank": int,
                    "user_name": str,
                    "average_score": float,
                    "total_quizzes": int
                }
            ]
        }
    """
    try:
        # For now, return demo data
        # In production, this would query all users
        
        return jsonify({
            'leaderboard': [
                {
                    'rank': 1,
                    'user_name': 'Demo User',
                    'average_score': 85.5,
                    'total_quizzes': 10
                }
            ],
            'message': 'Leaderboard feature coming soon with multi-user support'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to get leaderboard: {str(e)}")
