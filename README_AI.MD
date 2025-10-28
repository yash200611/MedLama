# Medical Symptom Analyzer

## Project Description
The goal is to make an AI-powered text-based Medical Symptom Analyzer. 
The user will share their symptoms, anonymous details etc. about their condition and the AI can prompt them
for more details/clarification, while narrowing down the possible diseases based on its confidence score. 
At the end, after the LLM has finished its analysis, we would like to generate a report that details
the discovery of insights, likeliness of diseases, why we think it could be this specific disease, etc. 

Extra scope feature:
Not to be implemented now: but keep a mongoDB atlas databse of doctors and medical professionals in teh area, tell 
the users which ones are available nearest to them and their insurance will be accepted. 

## System Components

### Core Components
1. **Environment Manager**
   - Handles API key validation and environment setup
   - Manages rate limiting for API calls

2. **LLM Integration**
   - Uses Gemini Pro 1.5 for primary conversation and analysis
   - Custom temperature settings for medical accuracy
   - Integrated with tools via LangChain

3. **Research Component**
   - Perplexity API integration for medical research
   - Configured for high-accuracy medical responses
   - Uses sonar-pro model with specialized medical prompting

### Workflow Nodes
1. **Intake Conversation**
   - Initial symptom gathering
   - Preliminary assessment
   
2. **Research Determination**
   - Analyzes symptoms
   - Queries medical databases
   - Processes research findings

3. **Analysis Generation**
   - Combines research data with symptoms
   - Generates confidence scores
   - Creates differential diagnosis

4. **Final Response**
   - Structures medical reports
   - Adds appropriate disclaimers
   - Formats results for user consumption

### State Management
- Uses TypedDict for strict type checking
- Tracks conversation history
- Manages research results
- Monitors analysis completion
- Stores final reports

### Graph Workflow
The system uses a directed graph structure with:
- Conditional routing based on analysis needs
- Research-driven decision making
- Multiple conversation cycles when needed
- Structured final report generation

## Technical Requirements
1. Python 3.8+
2. OpenAI API key
3. Perplexity API key

## Setup
1. Set environment variables:
   - OPENAI_API_KEY
   - PERPLEXITY_API_KEY
2. Install dependencies:
   ```bash
   pip install langchain-openai requests
   ```

## Implementation Details
- Using Gemini as the main conversation engine
- Perplexity API integration for medical research (as a tool for the gemini APi to use )
- Langchain for tool integration and conversation management

## Visualization
To visualize the agent's workflow:
```python
from IPython.display import Image
# Save graph visualization
graph.get_graph().draw("workflow.png", format="png")
# For Jupyter notebooks
Image("workflow.png")
```
