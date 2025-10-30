"""
AI Service for medical education using Google Gemini and LangChain
"""
import os
from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_core.messages import HumanMessage, AIMessage
import google.generativeai as genai

from backend.utils.logger import setup_logger

logger = setup_logger(__name__)


class MedicalAIService:
    """Service for AI-powered medical education"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash", temperature: float = 0.7):
        """
        Initialize AI service
        
        Args:
            api_key: Google Gemini API key
            model: Model name to use
            temperature: Temperature for response generation (0.0-1.0)
        """
        self.api_key = api_key
        self.model_name = model
        self.temperature = temperature
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Initialize LangChain model
        self.llm = ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            temperature=temperature,
            convert_system_message_to_human=True
        )
        
        # System prompt for medical education
        self.system_prompt = """You are MedLama, an expert AI medical tutor specializing in medical education. Your role is to:

1. **Explain Medical Concepts**: Provide clear, accurate explanations of medical topics at the appropriate level
2. **Interactive Learning**: Ask follow-up questions to assess understanding
3. **Visual Descriptions**: Describe anatomical structures and processes in detail
4. **Quiz Generation**: Create educational quiz questions with explanations
5. **Adaptive Teaching**: Adjust complexity based on the learner's level

**Guidelines:**
- Use clear, professional medical terminology with explanations
- Provide structured responses with headings and bullet points
- Include clinical relevance and real-world applications
- Be encouraging and supportive
- Cite key facts and statistics when relevant
- Use emojis sparingly for visual appeal (🫀 🫁 🧠 etc.)

**Important:** You are an educational tool, not a diagnostic tool. Always remind users to consult healthcare professionals for medical advice.

**Learning Levels:**
- Beginner: Simple explanations, basic terminology
- High School: More detail, introduce medical terms
- Medical Student: Professional terminology, clinical context
- Doctor: Advanced concepts, latest research

Current conversation context will be provided below."""

        logger.info(f"Initialized MedicalAIService with model: {model}")
    
    def create_conversation_chain(self, learning_level: str = "medical_student") -> ConversationChain:
        """
        Create a conversation chain with memory
        
        Args:
            learning_level: User's learning level
            
        Returns:
            ConversationChain instance
        """
        # Create memory
        memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="chat_history"
        )
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt + f"\n\nLearning Level: {learning_level}"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
        
        # Create conversation chain
        chain = ConversationChain(
            llm=self.llm,
            memory=memory,
            prompt=prompt,
            verbose=True
        )
        
        return chain
    
    async def generate_response(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        learning_level: str = "medical_student"
    ) -> Dict[str, any]:
        """
        Generate AI response for a medical education query
        
        Args:
            message: User's message
            conversation_history: Previous conversation messages
            learning_level: User's learning level
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            logger.info(f"Generating response for message: {message[:50]}...")
            
            # Create chain
            chain = self.create_conversation_chain(learning_level)
            
            # Load conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    if msg['role'] == 'user':
                        chain.memory.chat_memory.add_user_message(msg['content'])
                    elif msg['role'] == 'assistant':
                        chain.memory.chat_memory.add_ai_message(msg['content'])
            
            # Generate response
            response = chain.predict(input=message)
            
            logger.info("Successfully generated AI response")
            
            return {
                "messages": response,
                "analysis_complete": self._is_analysis_complete(message, response),
                "topic": self._extract_topic(message),
                "metadata": {
                    "model": self.model_name,
                    "learning_level": learning_level
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            raise
    
    def generate_quiz(
        self,
        topic: str,
        num_questions: int = 5,
        difficulty: str = "medium"
    ) -> Dict[str, any]:
        """
        Generate a quiz on a medical topic
        
        Args:
            topic: Medical topic for the quiz
            num_questions: Number of questions to generate
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            Dictionary with quiz questions
        """
        try:
            logger.info(f"Generating quiz on topic: {topic}")
            
            prompt = f"""Generate a medical education quiz on the topic: {topic}

Requirements:
- Create {num_questions} multiple choice questions
- Difficulty level: {difficulty}
- Each question should have 4 options (A, B, C, D)
- Include the correct answer
- Provide a detailed explanation for each answer
- Focus on understanding, not just memorization

Format your response as a structured quiz with clear questions, options, correct answers, and explanations."""

            response = self.llm.invoke(prompt)
            
            return {
                "quiz": response.content,
                "topic": topic,
                "num_questions": num_questions,
                "difficulty": difficulty
            }
            
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}", exc_info=True)
            raise
    
    def generate_visual_description(self, topic: str) -> Dict[str, str]:
        """
        Generate a detailed visual description or ASCII diagram
        
        Args:
            topic: Medical topic to visualize
            
        Returns:
            Dictionary with visual description
        """
        try:
            logger.info(f"Generating visual description for: {topic}")
            
            prompt = f"""Create a detailed visual description and ASCII diagram for: {topic}

Include:
1. A text-based diagram or flowchart using ASCII characters
2. Detailed labels and annotations
3. Step-by-step explanation of the visual
4. Key structures and their relationships
5. Clinical significance

Make it educational and easy to understand."""

            response = self.llm.invoke(prompt)
            
            return {
                "visual_description": response.content,
                "topic": topic
            }
            
        except Exception as e:
            logger.error(f"Error generating visual: {str(e)}", exc_info=True)
            raise
    
    def _is_analysis_complete(self, message: str, response: str) -> bool:
        """
        Determine if the analysis is complete or needs follow-up
        
        Args:
            message: User's message
            response: AI's response
            
        Returns:
            Boolean indicating if analysis is complete
        """
        # Check if response contains questions or prompts for more info
        follow_up_indicators = [
            "would you like",
            "can you provide",
            "tell me more",
            "any specific",
            "which aspect",
            "?",
        ]
        
        response_lower = response.lower()
        return not any(indicator in response_lower for indicator in follow_up_indicators)
    
    def _extract_topic(self, message: str) -> str:
        """
        Extract the main medical topic from the message
        
        Args:
            message: User's message
            
        Returns:
            Extracted topic
        """
        # Common medical topics
        topics = {
            'cardiac': 'Cardiology',
            'heart': 'Cardiology',
            'respiratory': 'Respiratory System',
            'lung': 'Respiratory System',
            'brain': 'Neurology',
            'nervous': 'Neurology',
            'immune': 'Immunology',
            'antibody': 'Immunology',
            'muscle': 'Musculoskeletal',
            'bone': 'Musculoskeletal',
            'digestive': 'Gastroenterology',
            'kidney': 'Nephrology',
            'liver': 'Hepatology',
        }
        
        message_lower = message.lower()
        for keyword, topic in topics.items():
            if keyword in message_lower:
                return topic
        
        return "General Medicine"


# Singleton instance
_ai_service_instance: Optional[MedicalAIService] = None


def get_ai_service(api_key: Optional[str] = None) -> MedicalAIService:
    """
    Get or create AI service instance
    
    Args:
        api_key: Google Gemini API key
        
    Returns:
        MedicalAIService instance
    """
    global _ai_service_instance
    
    if _ai_service_instance is None:
        if api_key is None:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("GEMINI_API_KEY not provided and not found in environment")
        
        _ai_service_instance = MedicalAIService(api_key)
    
    return _ai_service_instance
