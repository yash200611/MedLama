"""
Conversation model for MongoDB
"""
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId


class Message:
    """Individual message in a conversation"""
    
    def __init__(
        self,
        role: str,
        content: str,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict] = None
    ):
        self.role = role  # 'user' or 'assistant'
        self.content = content
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }
    
    @staticmethod
    def from_dict(data: Dict) -> 'Message':
        """Create Message from dictionary"""
        return Message(
            role=data["role"],
            content=data["content"],
            timestamp=data.get("timestamp"),
            metadata=data.get("metadata", {})
        )


class Conversation:
    """Conversation model"""
    
    def __init__(
        self,
        user_id: ObjectId,
        title: str = "New Conversation",
        messages: Optional[List[Message]] = None,
        topic: Optional[str] = None,
        _id: Optional[ObjectId] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.title = title
        self.messages = messages or []
        self.topic = topic
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to the conversation"""
        message = Message(role=role, content=content, metadata=metadata)
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        
        # Auto-generate title from first user message if still "New Conversation"
        if self.title == "New Conversation" and role == "user" and len(self.messages) <= 2:
            self.title = content[:50] + ("..." if len(content) > 50 else "")
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB"""
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "title": self.title,
            "messages": [msg.to_dict() for msg in self.messages],
            "topic": self.topic,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @staticmethod
    def from_dict(data: Dict) -> 'Conversation':
        """Create Conversation from MongoDB document"""
        messages = [Message.from_dict(msg) for msg in data.get("messages", [])]
        return Conversation(
            _id=data.get("_id"),
            user_id=data["user_id"],
            title=data.get("title", "New Conversation"),
            messages=messages,
            topic=data.get("topic"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        )
    
    def get_history(self) -> List[Dict]:
        """Get conversation history in API format"""
        return [
            {"role": msg.role, "content": msg.content}
            for msg in self.messages
        ]
