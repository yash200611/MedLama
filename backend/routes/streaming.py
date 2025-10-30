"""
Streaming API routes for real-time AI responses
"""
from flask import Blueprint, request, Response, stream_with_context
import json
import asyncio
from typing import Generator

from backend.services.ai_service import get_ai_service
from backend.services.database import get_database
from backend.middleware.error_handler import ValidationError, AIServiceError
from backend.utils.logger import setup_logger
from bson import ObjectId

logger = setup_logger(__name__)

streaming_bp = Blueprint('streaming', __name__, url_prefix='/api/v1/stream')


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


@streaming_bp.route('/chat', methods=['POST'])
def stream_chat():
    """
    Stream AI response in real-time
    
    Request Body:
        {
            "message": str,
            "conversation_id": str (optional),
            "learning_level": str (optional)
        }
    
    Returns:
        Server-Sent Events (SSE) stream with:
        - token: Individual response tokens
        - metadata: Response metadata
        - done: Completion signal
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
        
        logger.info(f"Streaming response for message: {message[:50]}...")
        
        def generate() -> Generator[str, None, None]:
            """Generate streaming response"""
            try:
                # Get database and user
                db = get_database()
                user = get_demo_user()
                
                # Get or create conversation
                if conversation_id:
                    try:
                        conversation = db.get_conversation(ObjectId(conversation_id))
                        if not conversation:
                            yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
                            return
                    except Exception:
                        yield f"data: {json.dumps({'error': 'Invalid conversation_id'})}\n\n"
                        return
                else:
                    conversation = db.create_conversation(user._id)
                
                # Add user message
                db.add_message_to_conversation(
                    conversation._id,
                    role="user",
                    content=message
                )
                
                # Send conversation_id first
                yield f"data: {json.dumps({'type': 'conversation_id', 'id': str(conversation._id)})}\n\n"
                
                # Get conversation history
                conversation = db.get_conversation(conversation._id)
                conversation_history = conversation.get_history()[:-1]  # Exclude current message
                
                # Get AI service
                ai_service = get_ai_service()
                
                # Create chain
                chain = ai_service.create_conversation_chain(learning_level)
                
                # Load history
                if conversation_history:
                    for msg in conversation_history:
                        if msg['role'] == 'user':
                            chain.memory.chat_memory.add_user_message(msg['content'])
                        elif msg['role'] == 'assistant':
                            chain.memory.chat_memory.add_ai_message(msg['content'])
                
                # Stream response
                full_response = ""
                
                # Use LangChain's streaming
                for chunk in chain.llm.stream(message):
                    token = chunk.content
                    full_response += token
                    
                    # Send token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                
                # Extract topic
                topic = ai_service._extract_topic(message)
                
                # Save AI response to database
                db.add_message_to_conversation(
                    conversation._id,
                    role="assistant",
                    content=full_response,
                    metadata={
                        'model': ai_service.model_name,
                        'learning_level': learning_level,
                        'topic': topic
                    }
                )
                
                # Update conversation topic
                if topic:
                    db.update_conversation(conversation._id, {'topic': topic})
                
                # Update user stats
                db.update_user_stats(user._id, total_messages=user.stats['total_messages'] + 1)
                
                # Update learning progress
                if topic:
                    progress = db.get_or_create_progress(user._id)
                    current_lessons = progress.topics.get(topic, {}).get('lessons_completed', 0)
                    db.update_topic_progress(
                        user._id,
                        topic,
                        lessons_completed=current_lessons + 1
                    )
                
                # Send metadata
                yield f"data: {json.dumps({'type': 'metadata', 'topic': topic, 'model': ai_service.model_name})}\n\n"
                
                # Send completion
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in streaming: {str(e)}", exc_info=True)
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )
        
    except ValidationError as e:
        return Response(
            f"data: {json.dumps({'type': 'error', 'message': e.message})}\n\n",
            mimetype='text/event-stream'
        )
    except Exception as e:
        logger.error(f"Error in stream_chat: {str(e)}", exc_info=True)
        return Response(
            f"data: {json.dumps({'type': 'error', 'message': 'Internal server error'})}\n\n",
            mimetype='text/event-stream'
        )


@streaming_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for streaming service"""
    return {'status': 'healthy', 'service': 'streaming'}, 200
