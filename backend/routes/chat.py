"""
Chat API routes for medical education conversations
"""
from flask import Blueprint, request, jsonify
from typing import Dict, List
from bson import ObjectId

from backend.services.ai_service import get_ai_service
from backend.services.database import get_database
from backend.middleware.error_handler import ValidationError, AIServiceError, NotFoundError
from backend.utils.logger import setup_logger

logger = setup_logger(__name__)

chat_bp = Blueprint('chat', __name__, url_prefix='/api/v1/chat')


# Helper function to get or create demo user
def get_demo_user():
    """Get or create a demo user for testing without authentication"""
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


@chat_bp.route('/message', methods=['POST'])
def send_message():
    """
    Send a message and get AI response
    
    Request Body:
        {
            "message": str,
            "conversation_id": str (optional),
            "learning_level": str (optional)
        }
    
    Returns:
        {
            "response": str,
            "topic": str,
            "analysis_complete": bool,
            "conversation_id": str,
            "metadata": dict
        }
    """
    try:
        # Validate request
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        message = data.get('message')
        if not message or not message.strip():
            raise ValidationError("Message is required", {'field': 'message'})
        
        conversation_id = data.get('conversation_id')
        learning_level = data.get('learning_level', 'medical_student')
        
        # Validate learning level
        valid_levels = ['beginner', 'high_school', 'medical_student', 'doctor']
        if learning_level not in valid_levels:
            raise ValidationError(
                f"Invalid learning level. Must be one of: {', '.join(valid_levels)}",
                {'field': 'learning_level', 'valid_values': valid_levels}
            )
        
        logger.info(f"Processing message: {message[:50]}... (level: {learning_level})")
        
        # Get database and user
        db = get_database()
        user = get_demo_user()
        
        # Get or create conversation
        if conversation_id:
            try:
                conversation = db.get_conversation(ObjectId(conversation_id))
                if not conversation:
                    raise NotFoundError("Conversation not found")
            except Exception:
                raise ValidationError("Invalid conversation_id")
        else:
            # Create new conversation
            conversation = db.create_conversation(user._id)
        
        # Add user message to conversation
        db.add_message_to_conversation(
            conversation._id,
            role="user",
            content=message
        )
        
        # Get conversation history
        conversation = db.get_conversation(conversation._id)
        conversation_history = conversation.get_history()
        
        # Get AI service and generate response
        ai_service = get_ai_service()
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            ai_service.generate_response(
                message=message,
                conversation_history=conversation_history[:-1],  # Exclude current message
                learning_level=learning_level
            )
        )
        loop.close()
        
        # Add AI response to conversation
        db.add_message_to_conversation(
            conversation._id,
            role="assistant",
            content=result['messages'],
            metadata=result.get('metadata', {})
        )
        
        # Update conversation topic if detected
        if result.get('topic'):
            db.update_conversation(conversation._id, {'topic': result['topic']})
        
        # Update user stats
        db.update_user_stats(user._id, total_messages=user.stats['total_messages'] + 1)
        
        # Update learning progress
        if result.get('topic'):
            db.update_topic_progress(
                user._id,
                result['topic'],
                lessons_completed=db.get_or_create_progress(user._id).topics.get(
                    result['topic'], {}
                ).get('lessons_completed', 0) + 1
            )
        
        return jsonify({
            'response': result['messages'],
            'topic': result['topic'],
            'analysis_complete': result['analysis_complete'],
            'conversation_id': str(conversation._id),
            'metadata': result['metadata']
        }), 200
        
    except (ValidationError, NotFoundError) as e:
        raise
    except Exception as e:
        logger.error(f"Error in send_message: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to generate response: {str(e)}")


@chat_bp.route('/quiz', methods=['POST'])
def generate_quiz():
    """
    Generate a quiz on a medical topic
    
    Request Body:
        {
            "topic": str,
            "num_questions": int (optional, default: 5),
            "difficulty": str (optional, default: "medium")
        }
    
    Returns:
        {
            "quiz": str,
            "topic": str,
            "num_questions": int,
            "difficulty": str
        }
    """
    try:
        # Validate request
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
        
        # Generate quiz
        result = ai_service.generate_quiz(
            topic=topic,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        return jsonify(result), 200
        
    except ValidationError as e:
        raise
    except Exception as e:
        logger.error(f"Error in generate_quiz: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to generate quiz: {str(e)}")


@chat_bp.route('/visual', methods=['POST'])
def generate_visual():
    """
    Generate a visual description or diagram
    
    Request Body:
        {
            "topic": str
        }
    
    Returns:
        {
            "visual_description": str,
            "topic": str
        }
    """
    try:
        # Validate request
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        topic = data.get('topic')
        if not topic or not topic.strip():
            raise ValidationError("Topic is required", {'field': 'topic'})
        
        logger.info(f"Generating visual for topic: {topic}")
        
        # Get AI service
        ai_service = get_ai_service()
        
        # Generate visual
        result = ai_service.generate_visual_description(topic)
        
        return jsonify(result), 200
        
    except ValidationError as e:
        raise
    except Exception as e:
        logger.error(f"Error in generate_visual: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to generate visual: {str(e)}")


@chat_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """
    Get all conversations for the current user
    
    Query Parameters:
        limit: int (optional, default: 50)
        skip: int (optional, default: 0)
    
    Returns:
        {
            "conversations": [
                {
                    "id": str,
                    "title": str,
                    "topic": str,
                    "message_count": int,
                    "created_at": str,
                    "updated_at": str
                }
            ],
            "total": int
        }
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)
        
        db = get_database()
        user = get_demo_user()
        
        conversations = db.get_user_conversations(user._id, limit=limit, skip=skip)
        
        return jsonify({
            'conversations': [
                {
                    'id': str(conv._id),
                    'title': conv.title,
                    'topic': conv.topic,
                    'message_count': len(conv.messages),
                    'created_at': conv.created_at.isoformat(),
                    'updated_at': conv.updated_at.isoformat()
                }
                for conv in conversations
            ],
            'total': len(conversations)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting conversations: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to get conversations: {str(e)}")


@chat_bp.route('/conversations/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id: str):
    """
    Get a specific conversation with all messages
    
    Returns:
        {
            "id": str,
            "title": str,
            "topic": str,
            "messages": [
                {
                    "role": str,
                    "content": str,
                    "timestamp": str
                }
            ],
            "created_at": str,
            "updated_at": str
        }
    """
    try:
        db = get_database()
        
        try:
            conversation = db.get_conversation(ObjectId(conversation_id))
        except Exception:
            raise ValidationError("Invalid conversation_id")
        
        if not conversation:
            raise NotFoundError("Conversation not found")
        
        return jsonify({
            'id': str(conversation._id),
            'title': conversation.title,
            'topic': conversation.topic,
            'messages': [
                {
                    'role': msg.role,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat()
                }
                for msg in conversation.messages
            ],
            'created_at': conversation.created_at.isoformat(),
            'updated_at': conversation.updated_at.isoformat()
        }), 200
        
    except (ValidationError, NotFoundError) as e:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to get conversation: {str(e)}")


@chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id: str):
    """
    Delete a conversation
    
    Returns:
        {
            "message": "Conversation deleted successfully"
        }
    """
    try:
        db = get_database()
        
        try:
            obj_id = ObjectId(conversation_id)
        except Exception:
            raise ValidationError("Invalid conversation_id")
        
        deleted = db.delete_conversation(obj_id)
        
        if not deleted:
            raise NotFoundError("Conversation not found")
        
        return jsonify({
            'message': 'Conversation deleted successfully'
        }), 200
        
    except (ValidationError, NotFoundError) as e:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to delete conversation: {str(e)}")


@chat_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """
    Get user analytics and progress
    
    Returns:
        {
            "user": {...},
            "conversations": {...},
            "quizzes": {...},
            "progress": {...}
        }
    """
    try:
        db = get_database()
        user = get_demo_user()
        
        analytics = db.get_user_analytics(user._id)
        
        # Convert ObjectIds to strings for JSON serialization
        if analytics['user']:
            analytics['user']['_id'] = str(analytics['user']['_id'])
        
        return jsonify(analytics), 200
        
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}", exc_info=True)
        raise AIServiceError(f"Failed to get analytics: {str(e)}")


@chat_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns:
        {
            "status": "healthy",
            "service": "chat",
            "ai_service": "available",
            "database": "connected"
        }
    """
    try:
        # Check if AI service is available
        ai_service = get_ai_service()
        ai_status = "available" if ai_service else "unavailable"
        
        # Check database connection
        try:
            db = get_database()
            db.client.admin.command('ping')
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
        
        return jsonify({
            'status': 'healthy',
            'service': 'chat',
            'ai_service': ai_status,
            'database': db_status
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'service': 'chat',
            'error': str(e)
        }), 503
