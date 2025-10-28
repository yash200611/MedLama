import os
import time
import requests
from functools import wraps
from typing import List, Dict, Any
from typing_extensions import Annotated, TypedDict
from dotenv import load_dotenv
from langgraph.errors import GraphRecursionError
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph, START, END
import markdown
import re
import textwrap


def beautify_text(text, width=80):
    # Remove ** from the text
    text = re.sub(r'\*\*', '', text)

    # Ensure numbered sections (1., 2., etc.) start on a new line
    text = re.sub(r'(\d+\.)', r'\n\1', text)

    # Ensure bullet points (*) start on a new line and replace them with "-"
    text = re.sub(r'\n?\s*\*', '\n- ', text)

    # Wrap text for better readability
    wrapped_lines = []
    for line in text.split("\n"):
        wrapped_lines.append(textwrap.fill(line, width) if line.strip() else line)

    return "\n".join(wrapped_lines)

# Environment Initialization
def init_environment():
    """Initialize environment variables and validate API keys"""
    load_dotenv()

    required_vars = {
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY', '').strip(),
        'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY', '').strip()
    }

    missing_vars = [key for key, value in required_vars.items() if not value]
    if missing_vars:
        print("Error: Missing required environment variables:", ", ".join(missing_vars))
        print("Please check your .env file and ensure all required variables are set.")
        return False

    return required_vars

# Rate Limiting Decorator
def api_rate_limit(seconds: int = 2):
    """Decorator to add sleep time between API calls"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            time.sleep(seconds)  # Wait before making the API call
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Medical Research Tool
@tool
@api_rate_limit(2)
def perplexity_research(query: str) -> str:
    """Research medical conditions using Perplexity API."""
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}"
    }
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system",
             "content": "You are a medical research assistant. Provide precise and well-sourced responses."},
            {"role": "user", "content": query}
        ],
        "temperature": 0.2,
        "max_tokens": 2048,
        "top_p": 0.8,
        "frequency_penalty": 0.0,
    }

    try:
        print("DEBUG: Sending request to Perplexity API...")
        response = requests.post("https://api.perplexity.ai/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        json_response = response.json()
        return json_response["choices"][0].get("message", {}).get("content", "No content found.")
    except requests.RequestException as e:
        print(f"DEBUG: API Error Details: {str(e)}")
        return f"Error researching topic: {str(e)}"

# System Prompt
SYSTEM_PROMPT = """You are an advanced AI medical assistant with access to up-to-date medical literature, expert guidelines, and peer-reviewed studies. Your role is to:
1. Conduct a structured diagnostic evaluation, mimicking a board-certified physician's approach.
2. Use differential diagnosis methods, listing probable conditions with confidence scores.
3. Prioritize high-accuracy, medically reviewed sources (such as but not limited to PubMed, Mayo Clinic, NIH, UpToDate).
4. Clearly communicate **when emergency medical care is required**.
5. Provide structured medical reports with citations, risk assessments, and next steps.

IMPORTANT: If a user describes symptoms that suggest a medical emergency (such as signs of heart attack, stroke, severe bleeding, difficulty breathing, or severe allergic reaction), immediately advise them to seek emergency medical care.
"""

# Initialize environment and LLM
env_vars = init_environment()
if not env_vars:
    raise ValueError("Environment initialization failed")

GEMINI_API_KEY = env_vars['GEMINI_API_KEY']
PERPLEXITY_API_KEY = env_vars['PERPLEXITY_API_KEY']

# LLM Configuration
llm = ChatGoogleGenerativeAI(
    model="learnlm-1.5-pro-experimental",
    google_api_key=GEMINI_API_KEY,
    temperature=0.3
)

# Configure tools
tools = [perplexity_research]
llm_with_tools = llm.bind_tools(tools=tools)

# State Management
class State(TypedDict):
    messages: Annotated[List[Dict[str, Any]], "Chat messages"]
    research_results: Annotated[Dict[str, Any], "Medical research data"]
    analysis_complete: Annotated[bool, "Whether analysis is complete"]
    report: Annotated[Dict[str, Any], "Final medical analysis report"]
    conversation_stage: Annotated[str, "Current stage of the conversation"]
    symptom_details: Annotated[Dict[str, Any], "Collected symptom information"]
    question_count: Annotated[int, "Number of questions asked so far"]
    risk_assessment: Annotated[str, "Risk assessment as LOW, MEDIUM, or HIGH"]

# Helper Functions
def format_conversation_history(messages):
    """Format the conversation history for the LLM prompt"""
    formatted = ""
    for msg in messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        formatted += f"{role}: {msg['content']}\n\n"
    return formatted

def extract_symptom_details(messages):
    """Extract symptom information from user messages to update the symptom_details"""
    # Combine all user messages to analyze
    all_user_input = " ".join([msg["content"] for msg in messages if msg["role"] == "user"])

    # Use the LLM to extract structured symptom information
    extract_prompt = f"""
    Based on the following user messages, extract key symptom information:

    {all_user_input}

    Extract and organize these details into a structured format:
    - Primary symptoms (list each with severity and duration)
    - Secondary/associated symptoms
    - Timing and patterns
    - Aggravating or relieving factors
    - Relevant medical history mentioned

    Return as a concise, structured JSON-like format.
    """

    try:
        response = llm.invoke(extract_prompt)
        # This won't be perfect JSON but will be a structured text representation of symptoms
        return {"extracted_data": response.content, "last_updated": len(messages)}
    except Exception as e:
        print(f"Error extracting symptom details: {str(e)}")
        return {"extracted_data": "Error processing symptoms", "last_updated": len(messages)}

@api_rate_limit(2)
def interactive_conversation(state: State):
    """Handle multi-turn conversation to gather detailed symptom information"""
    current_messages = state["messages"]
    question_count = state.get("question_count", 0)
    symptom_details = state.get("symptom_details", {})

    # Update symptom details after receiving user input
    if len(current_messages) > 0 and current_messages[-1]["role"] == "user":
        # Only extract details if we have new user messages since last extraction
        last_updated = symptom_details.get("last_updated", 0)
        if len(current_messages) > last_updated:
            symptom_details = extract_symptom_details(current_messages)

    # Format prompt based on conversation stage
    if question_count == 0:
        # Initial response and first question
        prompt = f"""
        {SYSTEM_PROMPT}

        You are in the information gathering stage. The user has shared some symptoms.
        First, acknowledge what they've shared, showing empathy and understanding.
        Then, ask ONE specific follow-up question to gather more details about their symptoms.
        Focus on symptom duration, severity, triggers, or associated symptoms.

        User input: {current_messages[-1]["content"]}
        """
    else:
        # Follow-up questions based on previous responses
        prompt = f"""
        {SYSTEM_PROMPT}

        You are in the information gathering stage. Here's the conversation so far:
        {format_conversation_history(current_messages)}

        Based on this information, ask ONE specific follow-up question to gather more details.
        Focus on any missing critical information about:
        - Symptom duration and progression
        - Aggravating or alleviating factors
        - Associated symptoms
        - Medical history relevance
        - Only ask questions relevant to the symptoms already mentioned

        If you have enough information (at least 3-4 detailed symptom descriptions) OR have asked 4+ questions,
        instead of asking a question, say "I have enough information to analyze your symptoms now."
        """

    response = llm.invoke(prompt)

    # Check if the response indicates we have enough information
    has_enough_info = "enough information" in response.content.lower()

    # Update state
    new_message = {"role": "assistant", "content": response.content}
    updated_messages = current_messages + [new_message]

    new_stage = "research" if has_enough_info or question_count >= 4 else "conversation"

    return {
        "messages": updated_messages,
        "question_count": question_count + 1,
        "conversation_stage": new_stage,
        "symptom_details": symptom_details
    }

def wait_for_user_response(state: State):
    """A node that simply passes the state through, used when waiting for user input"""
    # This is essentially a no-op node
    return state

@api_rate_limit(2)
def determine_research_needs(state: State):
    """Determine what medical conditions to research based on the entire conversation"""
    messages = state["messages"]
    symptom_details = state.get("symptom_details", {})

    # Extract all user messages to create a comprehensive symptom profile
    all_user_input = "\n".join([msg["content"] for msg in messages if msg["role"] == "user"])

    # Include extracted symptom details if available
    extracted_data = symptom_details.get("extracted_data", "No structured symptom data available")

    research_prompt = f"""
    Based on the following user inputs describing symptoms and medical context:

    USER MESSAGES:
    {all_user_input}

    EXTRACTED SYMPTOM DETAILS:
    {extracted_data}

    Perform medical research on the most probable conditions, including:
    1. List of likely conditions ranked by probability
    2. Brief explanation for each condition
    3. Relevant medical sources
    4. Suggested diagnostic steps
    """

    print("DEBUG: Starting Perplexity research...")
    results = perplexity_research.invoke({"query": research_prompt})
    print("DEBUG: Perplexity research complete")

    return {"research_results": {"medical_research": results}}

@api_rate_limit(2)
def generate_analysis(state: State):
    """Generate medical condition analysis with confidence scores"""
    research_data = state.get('research_results', {}).get('medical_research', 'No research data available')
    messages = state["messages"]
    symptom_details = state.get("symptom_details", {})

    # Extract all user messages
    all_user_input = "\n".join([msg["content"] for msg in messages if msg["role"] == "user"])

    # Include extracted symptom details if available
    extracted_data = symptom_details.get("extracted_data", "No structured symptom data available")

    analysis_prompt = f"""
    Based on the following user symptoms and research findings, generate a detailed medical analysis:

    USER SYMPTOMS:
    {all_user_input}

    EXTRACTED SYMPTOM DETAILS:
    {extracted_data}

    RESEARCH FINDINGS:
    {research_data}

    RISK ASSESSMENT (TO GENERATE OUTPUT):
    {"LOW", "MEDIUM", "HIGH"} risk of serious conditions based on the symptoms and research findings. It must match this exact format.
    Your analysis should include:
    1. A summary of the key symptoms and risk factors.
    2. A differential diagnosis with conditions ranked by likelihood (include confidence levels as percentages)
    3. Explanation of each potential condition
    4. Recommended next steps (diagnostics, specialists to consult, lifestyle recommendations)
    5. Clear indication if any symptoms suggest urgent/emergency care is needed
    """

    analysis = llm.invoke(analysis_prompt)
    return {"analysis_complete": True, "report": {"content": analysis.content}}

@api_rate_limit(2)
def final_response(state: State):
    # Add termination marker
    report_content = state.get("report", {}).get("content", "")
    final_message = {
        "role": "assistant",
        "content": f"{report_content}\n\n[SYSTEM: ANALYSIS COMPLETE]"
    }

    return {
        "messages": state["messages"] + [final_message],
        "conversation_stage": "complete",
        "analysis_complete": True,
        "risk": state.get("risk_assessment", "UNKNOWN"),
        "report": state["report"],
    }


# Flow Control Functions
def determine_next_stage(state: State) -> str:
    """Determine the next stage based on the conversation state"""
    if state.get("analysis_complete", False):
        return "final_response"

    # Get conversation stage
    current_stage = state.get("conversation_stage", "conversation")

    # If the most recent message is from a user and we're in conversation mode
    messages = state["messages"]
    if messages and messages[-1]["role"] == "user" and current_stage == "conversation":
        return "continue_conversation"

    # If we're ready to research
    if current_stage == "research":
        return "start_research"

    # If we've completed the conversation but the user asks a new question
    if current_stage == "complete" and messages and messages[-1]["role"] == "user":
        # Check if it's a completely new conversation/topic
        last_user_message = messages[-1]["content"].lower()
        if any(phrase in last_user_message for phrase in ["new symptom", "different issue", "another problem", "different question"]):
            # Reset the conversation for a new topic
            return "restart_conversation"
        else:
            # Just continue the existing conversation
            return "continue_conversation"

    # If we've completed the conversation
    if current_stage == "complete":
        return "final_response" if "new symptom" in last_user_message else "end"

    # Default: wait for user input
    return "wait_for_user"

def reset_conversation(state: State):
    """Reset the conversation to handle a new medical topic"""
    # Keep only the most recent user message
    last_message = state["messages"][-1] if state["messages"] and state["messages"][-1]["role"] == "user" else None

    # Create a new message acknowledging the topic change
    acknowledgment = {
        "role": "assistant",
        "content": "I understand you'd like to discuss a new medical topic. Let's start fresh with this new concern."
    }

    # Create new messages list with just the acknowledgment and last user message
    new_messages = [last_message, acknowledgment] if last_message else [acknowledgment]

    # Reset the state for a new conversation
    return {
        "messages": new_messages,
        "research_results": {},
        "analysis_complete": False,
        "report": {},
        "conversation_stage": "conversation",
        "symptom_details": {},
        "question_count": 0
    }

# Build the graph
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node("interactive_conversation", interactive_conversation)
graph_builder.add_node("wait_for_user", wait_for_user_response)
graph_builder.add_node("determine_research_needs", determine_research_needs)
graph_builder.add_node("generate_analysis", generate_analysis)
graph_builder.add_node("final_response", final_response)
graph_builder.add_node("reset_conversation", reset_conversation)

# Starting edge
graph_builder.add_edge(START, "interactive_conversation")

# Add conditional edges for the conversation flow
graph_builder.add_conditional_edges(
    "interactive_conversation",
    determine_next_stage,
    {
        "continue_conversation": "interactive_conversation",
        "wait_for_user": "wait_for_user",
        "start_research": "determine_research_needs",
        "restart_conversation": "reset_conversation",
        "end": END
    }
)

# Connect research flow
graph_builder.add_edge("determine_research_needs", "generate_analysis")
graph_builder.add_edge("generate_analysis", "final_response")
# Modify the edge connections:
graph_builder.add_edge("final_response", END)  # Instead of looping back
graph_builder.add_edge("reset_conversation", "interactive_conversation")


# Compile the graph
graph = graph_builder.compile()

# Functions to run the conversation
def start_medical_chat(initial_message):
    """Start a new medical chat session with an initial message"""
    initial_state = {
        "messages": [{"role": "user", "content": initial_message}],
        "research_results": {},
        "analysis_complete": False,
        "report": {},
        "conversation_stage": "conversation",
        "symptom_details": {},
        "question_count": 0
    }
    try:
        result_state = graph.invoke(initial_state, {"recursion_limit": 8})
    except GraphRecursionError:
        return handle_recursion_limit(initial_state)
    return result_state

def continue_medical_chat(current_state, user_message):
    """Continue an existing medical chat with a new user message"""
    # Add the new user message to the state
    current_messages = current_state["messages"]
    updated_messages = current_messages + [{"role": "user", "content": user_message}]

    # Update the state with the new message
    updated_state = {**current_state, "messages": updated_messages}

    # Run the graph with the updated state
    try:
        new_state = graph.invoke(updated_state, {"recursion_limit": 8})
    except GraphRecursionError:
        return handle_recursion_limit(updated_state)
    return new_state

def handle_recursion_limit(state):
    """Force final report generation"""
    warning = "[SYSTEM] Generating final analysis report..."
    # Force full analysis pipeline
    analyzed_state = generate_analysis(state)
    reported_state = final_response(analyzed_state)
    return {
        **reported_state,
        "messages": state["messages"] + [
            {"role": "assistant", "content": warning},
            reported_state["messages"][-1]
        ]
    }

state = None

def run_command_line():
    """Run an interactive demo of the medical chatbot"""
    print("Medical Symptom Analysis Chatbot")
    print("--------------------------------")
    print("Describe your symptoms, and I'll ask follow-up questions to help analyze them.")
    print("Type 'exit' to end the conversation.")
    print("Type 'new symptom' or 'different issue' to start a new medical topic.\n")

    initial_input = input("What symptoms are you experiencing? ")
    if initial_input.lower() == 'exit':
        return

    # Start the conversation
    state = start_medical_chat(initial_input)

    # Show the assistant's response
    messages = state["messages"]
    print(f"\nAssistant: {messages[-1]['content']}\n")

    # Continue the conversation
    while True:
        user_input = input("Your response: ")
        if user_input.lower() == 'exit':
            break

        # Continue the conversation
        state = continue_medical_chat(state, user_input)

        # Show the assistant's response
        messages = state["messages"]
        print(f"\nAssistant: {messages[-1]['content']}\n")

        # Check if the conversation is complete
        if state.get("conversation_stage") == "complete":
            print("\nAnalysis complete. You can start a new topic by typing 'new symptom' or 'different issue'.")
            print("Or you can continue discussing the current condition with follow-up questions.")


def run_web_prompt(input: str):
    global state

    if not state:
        state = start_medical_chat(input)
    elif input.lower() == 'exit':
        state = None  # Reset state to None
        return {
            "messages": "Chat session ended. You can start a new conversation.",
            "analysis_complete": False
        }
    else:
        state = continue_medical_chat(state, input)

    additional_message = ""
    if state.get("conversation_stage") == "complete":
        # Store the final response
        final_response = state["messages"][-1]["content"] + additional_message
        # Reset the state
        state = None
        # Add reset notification to the message
        additional_message += "\nAnalysis complete. Starting fresh conversation. Type your new symptoms or concerns.\n"
        return {
            "messages": final_response + additional_message,
            "analysis_complete": True
        }

    messages = state["messages"]
    response = messages[-1]["content"] + additional_message

    return {
        "messages": response,
        "analysis_complete": state.get("analysis_complete", False),
    }

if __name__ == "__main__":
    # To run the interactive demo
    run_command_line()
