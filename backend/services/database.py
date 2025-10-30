"""
MongoDB database service
"""
from typing import Optional, List, Dict
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from bson import ObjectId
from datetime import datetime

from backend.utils.logger import setup_logger
from backend.models import User, Conversation, QuizResult, LearningProgress

logger = setup_logger(__name__)


class DatabaseService:
    """MongoDB database service"""
    
    def __init__(self, uri: str, database_name: str):
        """
        Initialize database connection
        
        Args:
            uri: MongoDB connection URI
            database_name: Database name
        """
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.uri = uri
        self.database_name = database_name
        
        # Collections
        self.users: Optional[Collection] = None
        self.conversations: Optional[Collection] = None
        self.quiz_results: Optional[Collection] = None
        self.learning_progress: Optional[Collection] = None
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            logger.info(f"Connecting to MongoDB: {self.database_name}")
            self.client = MongoClient(self.uri)
            self.db = self.client[self.database_name]
            
            # Initialize collections
            self.users = self.db['users']
            self.conversations = self.db['conversations']
            self.quiz_results = self.db['quiz_results']
            self.learning_progress = self.db['learning_progress']
            
            # Create indexes
            self._create_indexes()
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Users indexes
            self.users.create_index([("email", ASCENDING)], unique=True)
            self.users.create_index([("created_at", DESCENDING)])
            
            # Conversations indexes
            self.conversations.create_index([("user_id", ASCENDING)])
            self.conversations.create_index([("created_at", DESCENDING)])
            self.conversations.create_index([("updated_at", DESCENDING)])
            
            # Quiz results indexes
            self.quiz_results.create_index([("user_id", ASCENDING)])
            self.quiz_results.create_index([("topic", ASCENDING)])
            self.quiz_results.create_index([("completed_at", DESCENDING)])
            
            # Learning progress indexes
            self.learning_progress.create_index([("user_id", ASCENDING)], unique=True)
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Error creating indexes: {str(e)}")
    
    # ==================== User Operations ====================
    
    def create_user(self, email: str, name: str, learning_level: str = "medical_student") -> User:
        """
        Create a new user
        
        Args:
            email: User email
            name: User name
            learning_level: Learning level
            
        Returns:
            Created User object
        """
        user = User(email=email, name=name, learning_level=learning_level)
        result = self.users.insert_one(user.to_dict())
        user._id = result.inserted_id
        logger.info(f"Created user: {email}")
        return user
    
    def get_user_by_id(self, user_id: ObjectId) -> Optional[User]:
        """Get user by ID"""
        data = self.users.find_one({"_id": user_id})
        return User.from_dict(data) if data else None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        data = self.users.find_one({"email": email})
        return User.from_dict(data) if data else None
    
    def update_user(self, user_id: ObjectId, updates: Dict) -> bool:
        """Update user"""
        result = self.users.update_one(
            {"_id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    def update_user_stats(self, user_id: ObjectId, **stats) -> bool:
        """Update user statistics"""
        updates = {f"stats.{key}": value for key, value in stats.items()}
        return self.update_user(user_id, updates)
    
    # ==================== Conversation Operations ====================
    
    def create_conversation(self, user_id: ObjectId, title: str = "New Conversation") -> Conversation:
        """Create a new conversation"""
        conversation = Conversation(user_id=user_id, title=title)
        result = self.conversations.insert_one(conversation.to_dict())
        conversation._id = result.inserted_id
        logger.info(f"Created conversation for user: {user_id}")
        return conversation
    
    def get_conversation(self, conversation_id: ObjectId) -> Optional[Conversation]:
        """Get conversation by ID"""
        data = self.conversations.find_one({"_id": conversation_id})
        return Conversation.from_dict(data) if data else None
    
    def get_user_conversations(
        self,
        user_id: ObjectId,
        limit: int = 50,
        skip: int = 0
    ) -> List[Conversation]:
        """Get all conversations for a user"""
        cursor = self.conversations.find(
            {"user_id": user_id}
        ).sort("updated_at", DESCENDING).skip(skip).limit(limit)
        
        return [Conversation.from_dict(data) for data in cursor]
    
    def add_message_to_conversation(
        self,
        conversation_id: ObjectId,
        role: str,
        content: str,
        metadata: Optional[Dict] = None
    ) -> bool:
        """Add a message to a conversation"""
        from backend.models.conversation import Message
        
        message = Message(role=role, content=content, metadata=metadata)
        
        result = self.conversations.update_one(
            {"_id": conversation_id},
            {
                "$push": {"messages": message.to_dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return result.modified_count > 0
    
    def update_conversation(self, conversation_id: ObjectId, updates: Dict) -> bool:
        """Update conversation"""
        updates["updated_at"] = datetime.utcnow()
        result = self.conversations.update_one(
            {"_id": conversation_id},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    def delete_conversation(self, conversation_id: ObjectId) -> bool:
        """Delete a conversation"""
        result = self.conversations.delete_one({"_id": conversation_id})
        return result.deleted_count > 0
    
    # ==================== Quiz Operations ====================
    
    def save_quiz_result(self, quiz_result: QuizResult) -> QuizResult:
        """Save quiz result"""
        result = self.quiz_results.insert_one(quiz_result.to_dict())
        quiz_result._id = result.inserted_id
        logger.info(f"Saved quiz result for user: {quiz_result.user_id}")
        return quiz_result
    
    def get_quiz_results(
        self,
        user_id: ObjectId,
        topic: Optional[str] = None,
        limit: int = 50
    ) -> List[QuizResult]:
        """Get quiz results for a user"""
        query = {"user_id": user_id}
        if topic:
            query["topic"] = topic
        
        cursor = self.quiz_results.find(query).sort("completed_at", DESCENDING).limit(limit)
        return [QuizResult.from_dict(data) for data in cursor]
    
    def get_quiz_stats(self, user_id: ObjectId) -> Dict:
        """Get quiz statistics for a user"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": None,
                "total_quizzes": {"$sum": 1},
                "average_score": {"$avg": "$percentage"},
                "topics": {"$addToSet": "$topic"}
            }}
        ]
        
        result = list(self.quiz_results.aggregate(pipeline))
        if result:
            return {
                "total_quizzes": result[0]["total_quizzes"],
                "average_score": round(result[0]["average_score"], 2),
                "topics_covered": len(result[0]["topics"])
            }
        return {"total_quizzes": 0, "average_score": 0.0, "topics_covered": 0}
    
    # ==================== Learning Progress Operations ====================
    
    def get_or_create_progress(self, user_id: ObjectId) -> LearningProgress:
        """Get or create learning progress for a user"""
        data = self.learning_progress.find_one({"user_id": user_id})
        
        if data:
            return LearningProgress.from_dict(data)
        
        # Create new progress
        progress = LearningProgress(user_id=user_id)
        self.learning_progress.insert_one(progress.to_dict())
        logger.info(f"Created learning progress for user: {user_id}")
        return progress
    
    def update_progress(self, user_id: ObjectId, progress: LearningProgress) -> bool:
        """Update learning progress"""
        result = self.learning_progress.update_one(
            {"user_id": user_id},
            {"$set": progress.to_dict()},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
    
    def update_topic_progress(self, user_id: ObjectId, topic: str, **kwargs) -> bool:
        """Update progress for a specific topic"""
        progress = self.get_or_create_progress(user_id)
        progress.update_topic_progress(topic, **kwargs)
        return self.update_progress(user_id, progress)
    
    # ==================== Analytics ====================
    
    def get_user_analytics(self, user_id: ObjectId) -> Dict:
        """Get comprehensive analytics for a user"""
        user = self.get_user_by_id(user_id)
        progress = self.get_or_create_progress(user_id)
        quiz_stats = self.get_quiz_stats(user_id)
        
        conversation_count = self.conversations.count_documents({"user_id": user_id})
        
        return {
            "user": user.to_dict() if user else None,
            "conversations": {
                "total": conversation_count
            },
            "quizzes": quiz_stats,
            "progress": {
                "topics": progress.topics,
                "achievements": progress.achievements,
                "current_streak": progress.current_streak,
                "longest_streak": progress.longest_streak
            }
        }


# Singleton instance
_db_service: Optional[DatabaseService] = None


def get_database() -> DatabaseService:
    """
    Get database service instance
    
    Returns:
        DatabaseService instance
    """
    global _db_service
    
    if _db_service is None:
        from backend.config import get_config
        config = get_config()
        
        _db_service = DatabaseService(
            uri=config.MONGODB_URI,
            database_name=config.DATABASE_NAME
        )
        _db_service.connect()
    
    return _db_service


def init_database(uri: str, database_name: str) -> DatabaseService:
    """
    Initialize database service
    
    Args:
        uri: MongoDB connection URI
        database_name: Database name
        
    Returns:
        DatabaseService instance
    """
    global _db_service
    
    _db_service = DatabaseService(uri, database_name)
    _db_service.connect()
    
    return _db_service
