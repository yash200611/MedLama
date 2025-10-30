"""
Quiz model for MongoDB
"""
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId


class QuizResult:
    """Quiz result model"""
    
    def __init__(
        self,
        user_id: ObjectId,
        topic: str,
        questions: List[Dict],
        answers: Dict[str, str],
        score: int,
        total_questions: int,
        difficulty: str = "medium",
        time_spent: Optional[int] = None,
        _id: Optional[ObjectId] = None,
        completed_at: Optional[datetime] = None
    ):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.topic = topic
        self.questions = questions
        self.answers = answers
        self.score = score
        self.total_questions = total_questions
        self.difficulty = difficulty
        self.time_spent = time_spent  # in seconds
        self.completed_at = completed_at or datetime.utcnow()
    
    @property
    def percentage(self) -> float:
        """Calculate percentage score"""
        if self.total_questions == 0:
            return 0.0
        return (self.score / self.total_questions) * 100
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB"""
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "topic": self.topic,
            "questions": self.questions,
            "answers": self.answers,
            "score": self.score,
            "total_questions": self.total_questions,
            "percentage": self.percentage,
            "difficulty": self.difficulty,
            "time_spent": self.time_spent,
            "completed_at": self.completed_at
        }
    
    @staticmethod
    def from_dict(data: Dict) -> 'QuizResult':
        """Create QuizResult from MongoDB document"""
        return QuizResult(
            _id=data.get("_id"),
            user_id=data["user_id"],
            topic=data["topic"],
            questions=data["questions"],
            answers=data["answers"],
            score=data["score"],
            total_questions=data["total_questions"],
            difficulty=data.get("difficulty", "medium"),
            time_spent=data.get("time_spent"),
            completed_at=data.get("completed_at")
        )


class LearningProgress:
    """Learning progress tracking model"""
    
    def __init__(
        self,
        user_id: ObjectId,
        topics: Optional[Dict[str, Dict]] = None,
        achievements: Optional[List[str]] = None,
        current_streak: int = 0,
        longest_streak: int = 0,
        last_activity: Optional[datetime] = None,
        _id: Optional[ObjectId] = None
    ):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.topics = topics or {}
        self.achievements = achievements or []
        self.current_streak = current_streak
        self.longest_streak = longest_streak
        self.last_activity = last_activity or datetime.utcnow()
    
    def update_topic_progress(self, topic: str, **kwargs):
        """Update progress for a specific topic"""
        if topic not in self.topics:
            self.topics[topic] = {
                "lessons_completed": 0,
                "quizzes_taken": 0,
                "average_score": 0.0,
                "last_accessed": datetime.utcnow()
            }
        
        for key, value in kwargs.items():
            if key in self.topics[topic]:
                self.topics[topic][key] = value
        
        self.topics[topic]["last_accessed"] = datetime.utcnow()
        self.last_activity = datetime.utcnow()
    
    def add_achievement(self, achievement: str):
        """Add an achievement"""
        if achievement not in self.achievements:
            self.achievements.append(achievement)
    
    def update_streak(self):
        """Update learning streak"""
        now = datetime.utcnow()
        if self.last_activity:
            days_diff = (now - self.last_activity).days
            if days_diff == 1:
                # Consecutive day
                self.current_streak += 1
                if self.current_streak > self.longest_streak:
                    self.longest_streak = self.current_streak
            elif days_diff > 1:
                # Streak broken
                self.current_streak = 1
        else:
            self.current_streak = 1
        
        self.last_activity = now
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB"""
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "topics": self.topics,
            "achievements": self.achievements,
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "last_activity": self.last_activity
        }
    
    @staticmethod
    def from_dict(data: Dict) -> 'LearningProgress':
        """Create LearningProgress from MongoDB document"""
        return LearningProgress(
            _id=data.get("_id"),
            user_id=data["user_id"],
            topics=data.get("topics", {}),
            achievements=data.get("achievements", []),
            current_streak=data.get("current_streak", 0),
            longest_streak=data.get("longest_streak", 0),
            last_activity=data.get("last_activity")
        )
