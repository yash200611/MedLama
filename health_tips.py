# Health tips and educational content
HEALTH_TIPS = {
    "chest_pain": [
        "💡 **Tip**: If chest pain worsens with activity, rest immediately",
        "💡 **Tip**: Keep a symptom diary to track patterns",
        "💡 **Tip**: Avoid heavy meals before bedtime to reduce GERD symptoms"
    ],
    "headache": [
        "💡 **Tip**: Stay hydrated - dehydration can trigger headaches",
        "💡 **Tip**: Maintain regular sleep schedule",
        "💡 **Tip**: Limit screen time and take regular breaks"
    ],
    "fever": [
        "💡 **Tip**: Stay hydrated with water, herbal teas, or electrolyte drinks",
        "💡 **Tip**: Rest is crucial for recovery",
        "💡 **Tip**: Monitor temperature every 4-6 hours"
    ],
    "general": [
        "💡 **Tip**: Regular exercise can boost your immune system",
        "💡 **Tip**: Wash hands frequently to prevent illness",
        "💡 **Tip**: Maintain a balanced diet with fruits and vegetables"
    ]
}

def get_health_tip(symptom_type="general"):
    """Get a random health tip based on symptom type"""
    import random
    tips = HEALTH_TIPS.get(symptom_type, HEALTH_TIPS["general"])
    return random.choice(tips)

def get_daily_health_tip():
    """Get a daily health tip"""
    import random
    all_tips = []
    for tips in HEALTH_TIPS.values():
        all_tips.extend(tips)
    return random.choice(all_tips)
