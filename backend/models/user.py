"""
User model for MongoDB
"""
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId


class User:
    """User model"""
    
    def __init__(
        self,
        email: str,
        name: str,
        learning_level: str = "medical_student",
        _id: Optional[ObjectId] = None,
        created_at: Optional[datetime] = None,
        preferences: Optional[Dict] = None,
        stats: Optional[Dict] = None
    ):
        self._id = _id or ObjectId()
        self.email = email
        self.name = name
        self.learning_level = learning_level
        self.created_at = created_at or datetime.utcnow()
        self.preferences = preferences or {
            "theme": "light",
            "notifications": True
        }
        self.stats = stats or {
            "total_lessons": 0,
            "total_quizzes": 0,
            "average_score": 0.0,
            "streak": 0,
            "total_messages": 0
        }
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB"""
        return {
            "_id": self._id,
            "email": self.email,
            "name": self.name,
            "learning_level": self.learning_level,
            "created_at": self.created_at,
            "preferences": self.preferences,
            "stats": self.stats
        }
    
    @staticmethod
    def from_dict(data: Dict) -> 'User':
        """Create User from MongoDB document"""
        return User(
            _id=data.get("_id"),
            email=data["email"],
            name=data["name"],
            learning_level=data.get("learning_level", "medical_student"),
            created_at=data.get("created_at"),
            preferences=data.get("preferences"),
            stats=data.get("stats")
        )
    
    def update_stats(self, **kwargs):
        """Update user statistics"""
        for key, value in kwargs.items():
            if key in self.stats:
                self.stats[key] = value
