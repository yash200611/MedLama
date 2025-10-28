from flask import Flask, request, send_from_directory, jsonify, abort
from flask_cors import CORS
import os
from database import Database
from analytics import track_symptom_analytics, get_symptom_insights, add_analytics_endpoint
from health_tips import get_health_tip, get_daily_health_tip

# Enhanced AI response function with conversation memory
conversation_memory = {}

def run_web_prompt(message):
    """
    Enhanced intelligent medical conversation with memory and context
    """
    message_lower = message.lower()
    
    # Extract user ID from request (simplified - in real app, use session)
    user_id = "default_user"
    
    # Initialize conversation memory for user
    if user_id not in conversation_memory:
        conversation_memory[user_id] = {
            "symptoms": [],
            "questions_asked": 0,
            "context": "initial"
        }
    
    memory = conversation_memory[user_id]
    
    # Track symptoms mentioned
    if any(word in message_lower for word in ['chest', 'pain', 'heart']):
        if 'chest pain' not in memory['symptoms']:
            memory['symptoms'].append('chest pain')
    elif any(word in message_lower for word in ['headache', 'head', 'migraine']):
        if 'headache' not in memory['symptoms']:
            memory['symptoms'].append('headache')
    elif any(word in message_lower for word in ['fever', 'temperature', 'hot']):
        if 'fever' not in memory['symptoms']:
            memory['symptoms'].append('fever')
    
    memory['questions_asked'] += 1
    
    # Smart conversation flow based on memory
    if memory['context'] == "initial":
        if any(word in message_lower for word in ['chest', 'pain', 'heart']):
            memory['context'] = "chest_pain"
            return {
                "messages": "I understand you're experiencing chest pain. This is important to evaluate carefully. How long have you been having this chest pain? Is it constant or does it come and go?",
                "analysis_complete": False
            }
        elif any(word in message_lower for word in ['headache', 'head', 'migraine']):
            memory['context'] = "headache"
            return {
                "messages": "I see you're experiencing headaches. How frequently do these headaches occur? Are they daily, weekly, or occasional? Also, how long do they typically last?",
                "analysis_complete": False
            }
        elif any(word in message_lower for word in ['fever', 'temperature', 'hot']):
            memory['context'] = "fever"
            return {
                "messages": "I understand you have a fever. Do you know what your temperature is? Also, how long have you been running a fever?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "Hello! I'm your AI health assistant. I can help you analyze symptoms and provide guidance. Please describe what symptoms or health concerns you're experiencing in as much detail as possible.",
                "analysis_complete": False
            }
    
    # Chest pain conversation flow
    elif memory['context'] == "chest_pain":
        if memory['questions_asked'] == 1:
            return {
                "messages": "Thank you for that information. Can you describe the type of chest pain? Is it sharp, dull, burning, or pressure-like? Also, does it radiate to your arm, jaw, or back?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] == 2:
            return {
                "messages": "I appreciate those details. Are you experiencing any other symptoms along with the chest pain, such as shortness of breath, nausea, sweating, or dizziness?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] >= 3:
            return {
                "messages": "Based on the symptoms you've described, I have enough information to provide an analysis. Would you like me to analyze your symptoms now?",
                "analysis_complete": False
            }
    
    # Headache conversation flow
    elif memory['context'] == "headache":
        if memory['questions_asked'] == 1:
            return {
                "messages": "Thank you for that detail. Can you describe the intensity of your headaches on a scale of 1-10? Also, are there any triggers like stress, certain foods, or changes in weather?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] == 2:
            return {
                "messages": "That's helpful information. Are you experiencing any other symptoms with your headaches, such as nausea, sensitivity to light or sound, or visual changes?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] >= 3:
            return {
                "messages": "I have enough information about your headaches. Would you like me to provide an analysis and recommendations?",
                "analysis_complete": False
            }
    
    # Fever conversation flow
    elif memory['context'] == "fever":
        if memory['questions_asked'] == 1:
            return {
                "messages": "Thank you for providing your temperature. Are you experiencing any other symptoms along with the fever, such as chills, body aches, fatigue, or loss of appetite?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] == 2:
            return {
                "messages": "That's important information. Have you been exposed to anyone who's been sick recently? Also, are you taking any medications for the fever?",
                "analysis_complete": False
            }
        elif memory['questions_asked'] >= 3:
            return {
                "messages": "I have sufficient information about your fever. Would you like me to analyze your symptoms and provide recommendations?",
                "analysis_complete": False
            }
    
    # Analysis trigger
    if any(phrase in message_lower for phrase in ['analyze', 'enough', 'ready', 'complete', 'yes', 'please']):
        # Generate comprehensive analysis based on symptoms
        symptoms_text = ", ".join(memory['symptoms']) if memory['symptoms'] else "the symptoms you've described"
        
        return {
            "messages": f"""Based on {symptoms_text}, here's my comprehensive analysis:

**SYMPTOM ANALYSIS:**
- Primary concerns: {', '.join(memory['symptoms']) if memory['symptoms'] else 'General symptoms'}
- Severity: Moderate (requires medical evaluation)
- Risk level: MEDIUM

**RECOMMENDATIONS:**
1. **Immediate Action**: Schedule an appointment with a healthcare provider within 24-48 hours
2. **Monitor**: Keep track of symptom intensity, duration, and any new symptoms
3. **Emergency**: If symptoms worsen or you experience severe pain, seek emergency care immediately

**POSSIBLE CONDITIONS:**
- Based on your symptoms, several conditions could be considered
- Further evaluation by a healthcare professional is recommended
- Diagnostic tests may be needed for accurate assessment

**NEXT STEPS:**
- Document your symptoms in detail
- Prepare questions for your healthcare provider
- Consider bringing a symptom diary to your appointment

⚠️ **Important**: This analysis is for informational purposes only and should not replace professional medical evaluation.""",
            "analysis_complete": True
        }
    
    # Default response
    return {
        "messages": "Thank you for that information. Can you provide more details about your symptoms?",
        "analysis_complete": False
    }

class HooHacksApp:
    def __init__(self):
        self.app = Flask(__name__, static_folder="medLama/out", static_url_path="/")
        CORS(self.app)
        self.database = Database()
        self.setup_routes()

    def setup_routes(self):
        @self.app.route('/')
        def index():
            index_path = os.path.join(self.app.static_folder, "index.html")
            return send_from_directory(self.app.static_folder, "index.html") if os.path.exists(index_path) else abort(404)

        @self.app.route('/api/doctors/')
        def get_doctors():
            specialty = request.args.get('specialty', type=str, default=None)
            latitude = request.args.get('latitude', type=float)
            longitude = request.args.get('longitude', type=float)

            if latitude is None or longitude is None:
                return "Request must contain latitude and longitude", 400

            return jsonify(self.database.get_doctors(latitude, longitude, specialty))

        @self.app.route('/api/health-centers/')
        def get_health_centers():
            latitude = request.args.get('latitude', type=float)
            longitude = request.args.get('longitude', type=float)

            if latitude is None or longitude is None:
                return "Request must contain latitude and longitude", 400

            return jsonify(self.database.get_health_centers(latitude, longitude))

        @self.app.route('/api/llm/response/')
        def prompt():
            message = request.args.get("message", type=str, default="")
            return jsonify(run_web_prompt(message))

        @self.app.route('/api/llm/delete/')
        def delete_conversation():
            return jsonify(run_web_prompt("exit"))

        @self.app.route('/api/health-tips/')
        def get_health_tips():
            symptom_type = request.args.get('type', 'general')
            return jsonify({"tip": get_health_tip(symptom_type)})

        @self.app.route('/api/health-tips/daily/')
        def get_daily_tip():
            return jsonify({"tip": get_daily_health_tip()})

        @self.app.route('/api/analytics/insights/')
        def get_insights():
            return jsonify({"insights": get_symptom_insights()})

        @self.app.route('/api/symptoms/suggestions/')
        def get_symptom_suggestions():
            suggestions = [
                {"id": "1", "name": "Chest Pain", "category": "Cardiovascular", "bodyPart": "Chest"},
                {"id": "2", "name": "Headache", "category": "Neurological", "bodyPart": "Head"},
                {"id": "3", "name": "Fever", "category": "General", "bodyPart": "Whole Body"},
                {"id": "4", "name": "Sore Throat", "category": "Respiratory", "bodyPart": "Throat"},
                {"id": "5", "name": "Nausea", "category": "Digestive", "bodyPart": "Stomach"},
                {"id": "6", "name": "Fatigue", "category": "General", "bodyPart": "Whole Body"},
                {"id": "7", "name": "Dizziness", "category": "Neurological", "bodyPart": "Head"},
                {"id": "8", "name": "Shortness of Breath", "category": "Respiratory", "bodyPart": "Chest"}
            ]
            return jsonify(suggestions)

        @self.app.route('/<path:path>')
        def serve_static_files(path):
            file_path = os.path.join(self.app.static_folder, path)
            return send_from_directory(self.app.static_folder, path) if os.path.exists(file_path) else self.index()

    def run(self, host="0.0.0.0", port=5001, debug=False):
        self.app.run(host="127.0.0.1" if debug else host, port=port, debug=debug)


app = HooHacksApp().app

if __name__ == "__main__":
    HooHacksApp().run()
