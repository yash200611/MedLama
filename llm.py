import os
import sys
import time
import requests
from functools import wraps
from typing import List, Dict, Any
from typing_extensions import Annotated, TypedDict
from dotenv import load_dotenv
from operator import itemgetter

import google.api_core.exceptions
from google.generativeai import configure, list_models
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

# Environment Initialization
# Validates and loads required API keys from .env file
def init_environment():
    """Initialize environment variables and validate API keys"""
    load_dotenv()
    
    required_vars = {
        'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY').strip(),
        'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY').strip()
    }
    
    missing_vars = [key for key, value in required_vars.items() if not value]
    if missing_vars:
        print("Error: Missing required environment variables:", ", ".join(missing_vars))
        print("Please check your .env file and ensure all required variables are set.")
        sys.exit(1)
    
    return required_vars

# Initialize environment before proceeding
env_vars = init_environment()
GEMINI_API_KEY = env_vars['GEMINI_API_KEY']
PERPLEXITY_API_KEY = env_vars['PERPLEXITY_API_KEY']

# Rate Limiting Decorator
# Prevents API rate limit issues by adding delays between calls
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
# Queries Perplexity API for medical information with specific parameters
# Important: Switch order of decorators - @tool must be the innermost decorator
@tool
@api_rate_limit(1)
def perplexity_research(query: str) -> str:
    """Research medical conditions using Perplexity API."""
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
    }
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", 
            "content": "You are a medical research assistant. Provide precise and well-sourced responses."},
            {"role": "user", "content": query}
        ],
        "temperature": 0.2,  # Lower randomness for factual consistency
        "max_tokens": 2048,  # Allow more detailed responses
        "top_p": 0.8,  # Nucleus sampling for high-confidence outputs
        "frequency_penalty": 0.0,  # Reduce repetitive phrasing
    }

    try:
        print("DEBUG: Sending request to Perplexity API...")
        response = requests.post("https://api.perplexity.ai/chat/completions", json=payload, headers=headers)
        response.raise_for_status()

        # Debugging API response
        json_response = response.json()
        print(f"DEBUG: API Response JSON: {json_response}")

        # Adjust parsing based on actual response structure
        return json_response["choices"][0].get("message", {}).get("content", "No content found.")

    except requests.RequestException as e:
        print(f"DEBUG: API Error Details: {str(e)}")
        return f"Error researching topic: {str(e)}"

# LLM Configuration
# Sets up Gemini Pro model with specific temperature for consistent responses
# Initialize Gemini with API key only
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",  # Updated model name
    google_api_key=GEMINI_API_KEY,
    temperature=0.3 # Lower randomness for factual consistency
)

# Define a simple prompt template
template = "What is the answer to {question}?"
prompt = PromptTemplate(template=template, input_variables=["question"])

# Configure tools
tools = [perplexity_research]
llm_with_tools = llm.bind_tools(tools=tools)

# State Management
# Defines the structure for managing conversation state and analysis progress
class State(TypedDict):
    messages: Annotated[List[Dict[str, Any]], "Chat messages"]
    research_results: Annotated[Dict[str, Any], "Medical research data"]
    analysis_complete: Annotated[bool, "Whether analysis is complete"]
    report: Annotated[Dict[str, Any], "Final medical analysis report"]

# Conversation Flow Nodes

# Initial Conversation Handler
# Processes user input and generates initial response
@api_rate_limit(1)
def intake_conversation(state: State):
    """Initial conversation to gather symptom information"""
    current_messages = state["messages"]
    
    # Format the conversation history with the system prompt
    conversation = f"{SYSTEM_PROMPT}\n\nUser: {current_messages[-1]['content']}"
    
    # Get response from LLM
    response = llm.invoke(conversation)
    
    # Create a new message dictionary and append it to the existing messages
    new_message = {"role": "assistant", "content": response.content}
    return {"messages": current_messages + [new_message]}

# Research Determination
# Analyzes symptoms and queries medical research
# Modify the determine_research_needs function to explicitly use the tool:
@api_rate_limit(1)
@api_rate_limit(1)
def determine_research_needs(state: State):
    """Determine what medical conditions to research and fetch data."""
    messages = state["messages"]
    symptoms = messages[-1]["content"]
    
    print("DEBUG: Starting Perplexity research...")
    research_prompt = f"""
    You are a trusted medical AI assistant with access to peer-reviewed research and 
    authoritative medical sources (e.g., NIH, Mayo Clinic, PubMed). Given the following symptoms:
    Symptoms: {symptoms}
        1. List the most probable medical conditions associated with these symptoms, ranked by likelihood.
        2. Provide a brief explanation for each condition, including common causes and risk factors.
        3. Cite relevant sources (e.g., medical journals, research papers, or trusted websites) for each finding.
        4. If necessary, suggest further diagnostic steps a doctor might take to differentiate between conditions."
    
    """
    results = perplexity_research(research_prompt) 
    print("DEBUG: Perplexity results:", results)
    return {"research_results": {"medical_research": results}}

# Analysis Generation
# Processes research data and generates medical analysis
@api_rate_limit(1)
def generate_analysis(state: State):
    """Generate medical condition analysis with confidence scores"""
    research_data = state.get('research_results', {}).get('medical_research', 'No research data available')
    print("DEBUG: Using research data:", research_data)
    
    analysis_prompt = (
        "Based on the following research and symptoms, generate a detailed analysis:\n\n"
        f"Research findings: {research_data}\n\n"
        f"Conversation history: {state['messages']}\n\n"
        "Please incorporate the research findings into your analysis."
    )
    
    analysis = llm.invoke(analysis_prompt)
    return {"analysis_complete": True, "report": analysis}

# Final Response Formation
# Creates structured medical report with disclaimers
@api_rate_limit(1)
def final_response(state: State):
    """Formulate final response with analysis and disclaimer"""
    summary_prompt = (
        "Create a clear, structured medical report with analysis and appropriate disclaimers.\n\n"
        f"Analysis: {state['report']}\n"
        f"Conversation history: {state['messages']}"
    )
    
    final_message = llm.invoke(summary_prompt)
    updated_messages = state["messages"] + [{"role": "assistant", "content": final_message.content}]
    return {"messages": updated_messages}

# Flow Control Functions

# Research Decision Logic
# Determines if additional research is needed
def should_research(state: State) -> str:
    """Determine if research is needed based on message content"""
    messages = state["messages"]
    last_message = messages[-1]["content"]
    
    # Always do research for medical queries
    if any(term in last_message.lower() for term in ["symptoms", "pain", "feeling", "medical", "health"]):
        return "research"
    return "generate_analysis"

# Analysis Completion Check
# Verifies if the medical analysis is complete
def is_analysis_complete(state: State) -> str:
    """Check if analysis is complete or if further conversation is needed."""
    # Simplified logic without LLM call
    return "complete" if state.get("analysis_complete") else "intake_conversation"

# Graph Construction
# Builds the conversation flow graph with defined nodes and edges
# Build the improved graph
graph_builder = StateGraph(State)

graph_builder.add_node("intake_conversation", intake_conversation)
graph_builder.add_node("determine_research_needs", determine_research_needs)
graph_builder.add_node("generate_analysis", generate_analysis)
graph_builder.add_node("final_response", final_response)

# Starting edge
graph_builder.add_edge(START, "intake_conversation")

# Conditional edges
graph_builder.add_conditional_edges(
    "intake_conversation",
    should_research,
    {
        "generate_analysis": "generate_analysis",  # Skip research if not needed
        "research": "determine_research_needs"
    }
)

graph_builder.add_edge("determine_research_needs", "generate_analysis")

graph_builder.add_conditional_edges(
    "generate_analysis",
    is_analysis_complete,
    {
        "intake_conversation": "intake_conversation",  # Loop back if needed
        "complete": "final_response"
    }
)

graph_builder.add_edge("final_response", END)

graph = graph_builder.compile()

# System Prompt
# Defines AI's role and responsibilities in medical analysis
SYSTEM_PROMPT = """You are an advanced AI medical assistant with access to up-to-date medical literature, expert guidelines, and peer-reviewed studies. Your role is to:
1. Conduct a structured diagnostic evaluation, mimicking a board-certified physician’s approach.
2. Use differential diagnosis methods, listing probable conditions with confidence scores.
3. Prioritize high-accuracy, medically reviewed sources (such as but not limited to PubMed, Mayo Clinic, NIH, UpToDate).
4. Clearly communicate **when emergency medical care is required**.
5. Provide structured medical reports with citations, risk assessments, and next steps.
"""


from IPython.display import display, Image
try:
  display(Image(graph.get_graph().draw_mermaid_png()))
except Exception:
  pass

# Execution Function
# Main function to run the medical analysis workflow
def run_medical_analysis(initial_message: str):
    """Runs the medical analysis graph with the given initial message."""
    initial_state = {
        "messages": [{"role": "user", "content": initial_message}],
        "research_results": {},
        "analysis_complete": False,
        "report": {}
    }
    
    results = graph.invoke(initial_state)
    return results["messages"]


# Example Usage
# Test case with cardiac symptoms
sample_input = "Hi, I've been feeling really off lately. " \
"For the past few hours, I’ve had some chest discomfort, " \
"but it’s not exactly pain. It’s more of a pressure, kind of like " \
"something heavy is on my chest. I also feel really short of breath, " \
"especially when I try to move around or even just stand up. Sometimes, it " \
"feels like my left arm is a little sore, and I've noticed some dizziness as well. " \
"I’m also feeling unusually nauseous, which isn’t something I usually deal with. " \
"I’m 45, not very active, and have had some family members with heart issues. " \
"I’m not sure if this is something I should be concerned about or if I’m just " \
"overthinking it. Can you help?"

results = run_medical_analysis(sample_input)

for response in results:
    print(f"\nAI Response: {response}")

