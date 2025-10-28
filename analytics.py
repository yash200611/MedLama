# Enhanced symptom tracking and analytics
import json
from datetime import datetime

def track_symptom_analytics(user_id, symptom, severity="moderate"):
    """Track symptom analytics for insights"""
    analytics_file = "symptom_analytics.json"
    
    try:
        with open(analytics_file, 'r') as f:
            analytics = json.load(f)
    except FileNotFoundError:
        analytics = {"symptoms": {}, "daily_counts": {}}
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Track symptom frequency
    if symptom not in analytics["symptoms"]:
        analytics["symptoms"][symptom] = {"count": 0, "severity_distribution": {}}
    
    analytics["symptoms"][symptom]["count"] += 1
    analytics["symptoms"][symptom]["severity_distribution"][severity] = \
        analytics["symptoms"][symptom]["severity_distribution"].get(severity, 0) + 1
    
    # Track daily counts
    if today not in analytics["daily_counts"]:
        analytics["daily_counts"][today] = 0
    analytics["daily_counts"][today] += 1
    
    with open(analytics_file, 'w') as f:
        json.dump(analytics, f, indent=2)

def get_symptom_insights():
    """Get insights from symptom analytics"""
    try:
        with open("symptom_analytics.json", 'r') as f:
            analytics = json.load(f)
        
        if not analytics["symptoms"]:
            return "No symptom data available yet."
        
        # Find most common symptoms
        most_common = max(analytics["symptoms"].items(), key=lambda x: x[1]["count"])
        
        return f"Most common symptom: {most_common[0]} ({most_common[1]['count']} consultations)"
    except FileNotFoundError:
        return "Analytics not available yet."

# Add analytics endpoint
def add_analytics_endpoint(app):
    @app.route('/api/analytics/insights/')
    def get_insights():
        return jsonify({"insights": get_symptom_insights()})
    
    @app.route('/api/analytics/symptoms/')
    def get_symptom_stats():
        try:
            with open("symptom_analytics.json", 'r') as f:
                analytics = json.load(f)
            return jsonify(analytics)
        except FileNotFoundError:
            return jsonify({"symptoms": {}, "daily_counts": {}})
