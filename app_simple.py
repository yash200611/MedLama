from flask import Flask, request, send_from_directory, jsonify, abort
from flask_cors import CORS
import os
from database import Database

# Enhanced AI response function
def run_web_prompt(message):
    """
    Simulate intelligent medical conversation with follow-up questions
    """
    message_lower = message.lower()
    
    # Initial responses based on symptoms
    if any(word in message_lower for word in ['chest', 'pain', 'heart']):
        if 'how long' in message_lower or 'duration' in message_lower:
            return {
                "messages": "Thank you for that information. Can you describe the type of chest pain? Is it sharp, dull, burning, or pressure-like? Also, does it radiate to your arm, jaw, or back?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "I understand you're experiencing chest pain. This is important to evaluate carefully. How long have you been having this chest pain? Is it constant or does it come and go?",
                "analysis_complete": False
            }
    
    elif any(word in message_lower for word in ['headache', 'head', 'migraine']):
        if 'frequency' in message_lower or 'often' in message_lower:
            return {
                "messages": "Thank you for that detail. Can you describe the intensity of your headaches on a scale of 1-10? Also, are there any triggers like stress, certain foods, or changes in weather?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "I see you're experiencing headaches. How frequently do these headaches occur? Are they daily, weekly, or occasional? Also, how long do they typically last?",
                "analysis_complete": False
            }
    
    elif any(word in message_lower for word in ['fever', 'temperature', 'hot']):
        if 'temperature' in message_lower or 'degrees' in message_lower:
            return {
                "messages": "Thank you for providing your temperature. Are you experiencing any other symptoms along with the fever, such as chills, body aches, fatigue, or loss of appetite?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "I understand you have a fever. Do you know what your temperature is? Also, how long have you been running a fever?",
                "analysis_complete": False
            }
    
    elif any(word in message_lower for word in ['throat', 'sore', 'swollen']):
        if 'swallowing' in message_lower or 'difficulty' in message_lower:
            return {
                "messages": "That sounds concerning. Are you experiencing any difficulty breathing or shortness of breath? Also, have you noticed any swelling in your neck or lymph nodes?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "I understand you have a sore throat. Is it painful when you swallow? How long have you been experiencing this discomfort?",
                "analysis_complete": False
            }
    
    elif any(word in message_lower for word in ['rash', 'skin', 'itchy']):
        if 'location' in message_lower or 'where' in message_lower:
            return {
                "messages": "Thank you for that information. Is the rash spreading or getting worse? Also, have you recently used any new products, medications, or been exposed to anything unusual?",
                "analysis_complete": False
            }
        else:
            return {
                "messages": "I see you have a skin rash. Where on your body is the rash located? Is it itchy, painful, or causing any other discomfort?",
                "analysis_complete": False
            }
    
    # Generic follow-up for other symptoms
    elif len(message.split()) > 5:  # If detailed response given
        return {
            "messages": "Thank you for providing those details. Based on what you've described, I'd like to ask a few more questions to better understand your situation. Have you experienced any of these symptoms before? Also, are you currently taking any medications or have any known allergies?",
            "analysis_complete": False
        }
    
    # Check if enough information gathered for analysis
    elif any(phrase in message_lower for phrase in ['analyze', 'enough', 'ready', 'complete']):
        return {
            "messages": """Based on the symptoms you've described, here's my analysis:

**SYMPTOM ANALYSIS:**
- Primary concern: Chest pain lasting several days
- Severity: Moderate (requires medical evaluation)
- Risk level: MEDIUM

**RECOMMENDATIONS:**
1. **Immediate Action**: Schedule an appointment with a cardiologist or primary care physician within 24-48 hours
2. **Monitor**: Keep track of pain intensity, duration, and any new symptoms
3. **Emergency**: If pain becomes severe, spreads to arm/jaw, or you experience shortness of breath, seek emergency care immediately

**POSSIBLE CONDITIONS:**
- Musculoskeletal chest pain (most common)
- Gastroesophageal reflux disease (GERD)
- Anxiety-related chest discomfort
- Less commonly: Cardiac-related issues

**NEXT STEPS:**
- Avoid strenuous activity until evaluated
- Keep a symptom diary
- Consider over-the-counter antacids if GERD is suspected

⚠️ **Important**: This analysis is for informational purposes only and should not replace professional medical evaluation.""",
            "analysis_complete": True
        }
    
    # Initial greeting or unclear input
    else:
        return {
            "messages": "Hello! I'm your AI health assistant. I can help you analyze symptoms and provide guidance. Please describe what symptoms or health concerns you're experiencing in as much detail as possible.",
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

        @self.app.route('/<path:path>')
        def serve_static_files(path):
            file_path = os.path.join(self.app.static_folder, path)
            return send_from_directory(self.app.static_folder, path) if os.path.exists(file_path) else self.index()

    def run(self, host="0.0.0.0", port=5001, debug=False):
        self.app.run(host="127.0.0.1" if debug else host, port=port, debug=debug)


app = HooHacksApp().app

if __name__ == "__main__":
    HooHacksApp().run()
