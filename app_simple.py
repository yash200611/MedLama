from flask import Flask, request, send_from_directory, jsonify, abort
from flask_cors import CORS
import os

# Enhanced AI response function with conversation memory
conversation_memory = {}

def run_web_prompt(message):
    """
    AI-powered medical learning tutor with enhanced interactive features
    """
    print(f"DEBUG: run_web_prompt called with: {message}")
    print(f"DEBUG: About to process educational response")
    message_lower = message.lower()
    
    # Extract user ID from request (simplified - in real app, use session)
    user_id = "default_user"
    
    # Initialize conversation memory for user
    if user_id not in conversation_memory:
        conversation_memory[user_id] = {
            "topics": [],
            "questions_asked": 0,
            "context": "initial",
            "learning_level": "medical_student",
            "quiz_scores": {},
            "learning_progress": {},
            "completed_modules": [],
            "current_quiz": None
        }
    
    memory = conversation_memory[user_id]
    
    # Track learning topics mentioned
    if any(word in message_lower for word in ['cardiac', 'heart', 'circulation']):
        if 'cardiology' not in memory['topics']:
            memory['topics'].append('cardiology')
    elif any(word in message_lower for word in ['respiratory', 'lung', 'breathing']):
        if 'respiratory' not in memory['topics']:
            memory['topics'].append('respiratory')
    elif any(word in message_lower for word in ['nervous', 'brain', 'neuron']):
        if 'neurology' not in memory['topics']:
            memory['topics'].append('neurology')
    elif any(word in message_lower for word in ['immune', 'antibody', 'infection']):
        if 'immunology' not in memory['topics']:
            memory['topics'].append('immunology')
    
    memory['questions_asked'] += 1
    
    # Enhanced educational response system
    if any(word in message_lower for word in ['explain', 'what is', 'how does', 'tell me about']):
        return generate_enhanced_educational_explanation(message_lower, memory)
    elif any(word in message_lower for word in ['quiz', 'test', 'question']):
        return generate_interactive_quiz(message_lower, memory)
    elif any(word in message_lower for word in ['diagram', 'visual', 'mind map', 'chart']):
        return generate_visual_diagram(message_lower, memory)
    elif any(word in message_lower for word in ['progress', 'score', 'tracking']):
        return generate_progress_report(memory)
    elif any(word in message_lower for word in ['cardiac', 'heart']):
        return generate_cardiology_explanation(message_lower, memory)
    elif any(word in message_lower for word in ['respiratory', 'lung', 'breathing']):
        return generate_respiratory_explanation(message_lower, memory)
    elif any(word in message_lower for word in ['nervous', 'brain']):
        return generate_neurology_explanation(message_lower, memory)
    else:
        return {
            "messages": "I'd be happy to help you learn! I can explain medical concepts, create quizzes, or generate visual diagrams. What would you like to explore? Try asking me to:\n\n• Explain a medical concept\n• Quiz you on a topic\n• Create a visual diagram\n• Show your learning progress\n• Help with anatomy or physiology",
            "analysis_complete": False
        }

def generate_educational_explanation(message_lower, memory):
    """Generate educational explanations for medical concepts"""
    if 'cardiac' in message_lower or 'heart' in message_lower:
        return {
            "messages": """**The Cardiac Cycle Explained** 🫀

The cardiac cycle is the sequence of events that occurs during one complete heartbeat. Here's how it works:

**Phase 1: Diastole (Relaxation)**
• Ventricles relax and fill with blood
• Atrioventricular (AV) valves open
• Blood flows from atria to ventricles
• Duration: ~0.5 seconds

**Phase 2: Systole (Contraction)**
• Atria contract first (atrial systole)
• Then ventricles contract (ventricular systole)
• AV valves close, semilunar valves open
• Blood is ejected into arteries
• Duration: ~0.3 seconds

**Key Components:**
• **Atria**: Upper chambers that receive blood
• **Ventricles**: Lower chambers that pump blood
• **Valves**: Prevent backflow of blood
• **SA Node**: Natural pacemaker of the heart

**Clinical Significance:**
Understanding the cardiac cycle is crucial for diagnosing heart conditions like arrhythmias, valve disorders, and heart failure.

Would you like me to explain any specific part in more detail or create a visual diagram?""",
            "analysis_complete": False
        }
    elif 'respiratory' in message_lower or 'lung' in message_lower:
        return {
            "messages": """**The Respiratory System Explained** 🫁

The respiratory system is responsible for gas exchange between the body and the environment:

**Main Components:**
• **Nose & Mouth**: Air entry points
• **Trachea**: Windpipe that carries air to lungs
• **Bronchi**: Branch into smaller airways
• **Bronchioles**: Smallest airways
• **Alveoli**: Tiny air sacs where gas exchange occurs

**Gas Exchange Process:**
1. **Inhalation**: Diaphragm contracts, chest expands
2. **Air Flow**: Air travels down respiratory tract
3. **Diffusion**: Oxygen diffuses into blood, CO2 diffuses out
4. **Exhalation**: Diaphragm relaxes, air is expelled

**Key Measurements:**
• **Tidal Volume**: Normal breathing volume (~500ml)
• **Vital Capacity**: Maximum air exhaled after deep breath
• **FEV1**: Forced expiratory volume in 1 second

**Clinical Applications:**
Used to diagnose conditions like asthma, COPD, and pneumonia.

Would you like a quiz on respiratory physiology or a visual diagram?""",
            "analysis_complete": False
        }
    else:
        return {
            "messages": "I'd be happy to explain any medical concept! I can provide detailed explanations on topics like:\n\n• **Anatomy**: Heart, lungs, brain, muscles\n• **Physiology**: How organs function\n• **Pathology**: Disease processes\n• **Pharmacology**: Drug mechanisms\n\nWhat specific topic would you like me to explain?",
            "analysis_complete": False
        }

def generate_quiz_question(message_lower, memory):
    """Generate quiz questions for medical topics"""
    if 'cardiac' in message_lower or 'heart' in message_lower:
        return {
            "messages": """**Cardiology Quiz** 🧠

**Question 1:**
What is the normal heart rate range for adults at rest?
A) 60-100 bpm
B) 40-60 bpm  
C) 100-120 bpm
D) 120-140 bpm

**Question 2:**
Which valve separates the left atrium from the left ventricle?
A) Tricuspid valve
B) Mitral valve
C) Aortic valve
D) Pulmonary valve

**Question 3:**
What is the primary pacemaker of the heart?
A) AV node
B) SA node
C) Bundle of His
D) Purkinje fibers

**Question 4:**
During which phase of the cardiac cycle do the ventricles contract?
A) Diastole
B) Systole
C) Atrial systole
D) Isovolumetric relaxation

Take your time to think about each answer! I'll provide explanations after you respond.""",
            "analysis_complete": False
        }
    else:
        return {
            "messages": """**Medical Knowledge Quiz** 🎯

I can create quizzes on various medical topics! Choose a subject:

• **Cardiology**: Heart anatomy, physiology, and diseases
• **Respiratory**: Lungs, breathing, and respiratory conditions  
• **Neurology**: Brain, nervous system, and neurological disorders
• **Immunology**: Immune system, infections, and immunity
• **Anatomy**: Body systems and structures
• **Physiology**: How the body functions

What topic would you like to be quizzed on?""",
            "analysis_complete": False
        }

def generate_visual_explanation(message_lower, memory):
    """Generate visual explanations and diagrams"""
    if 'cardiac' in message_lower or 'heart' in message_lower:
        return {
            "messages": """**Heart Anatomy Visual Guide** 🫀

Here's a visual breakdown of the heart structure:

```
    ┌─────────────┐    ┌─────────────┐
    │   Right     │    │    Left     │
    │   Atrium    │    │   Atrium    │
    └─────────────┘    └─────────────┘
           │                   │
           │                   │
    ┌─────────────┐    ┌─────────────┐
    │   Right     │    │    Left     │
    │ Ventricle   │    │ Ventricle   │
    └─────────────┘    └─────────────┘
```

**Blood Flow Path:**
1. **Deoxygenated blood** → Right Atrium → Right Ventricle → Lungs
2. **Oxygenated blood** → Left Atrium → Left Ventricle → Body

**Key Valves:**
• **Tricuspid**: Right atrium → Right ventricle
• **Mitral**: Left atrium → Left ventricle  
• **Pulmonary**: Right ventricle → Lungs
• **Aortic**: Left ventricle → Body

**Clinical Notes:**
• Left ventricle is thicker (pumps to entire body)
• Valves prevent backflow
• Coronary arteries supply heart muscle

Would you like me to explain the electrical conduction system or create a more detailed diagram?""",
            "analysis_complete": False
        }
    else:
        return {
            "messages": """**Visual Learning Tools** 🎨

I can create visual diagrams and mind maps for:

• **Anatomy Diagrams**: Heart, lungs, brain, muscles
• **Process Flowcharts**: Cardiac cycle, respiratory process
• **Mind Maps**: Disease classifications, drug mechanisms
• **Concept Maps**: Organ system relationships
• **Timeline Diagrams**: Disease progression, treatment protocols

What would you like me to visualize? Try asking:
• "Create a diagram of the respiratory system"
• "Show me a mind map of the nervous system"
• "Draw the cardiac cycle flowchart"
• "Visualize the immune response process"

I'll create detailed, educational diagrams to help you understand complex medical concepts!""",
            "analysis_complete": False
        }

def generate_cardiology_explanation(message_lower, memory):
    """Generate detailed cardiology explanations"""
    return {
        "messages": """**Cardiology Deep Dive** 🫀

**Heart Anatomy & Function:**

The heart is a four-chambered muscular organ that pumps blood throughout the body:

**Chambers:**
• **Right Atrium**: Receives deoxygenated blood from body
• **Right Ventricle**: Pumps blood to lungs for oxygenation
• **Left Atrium**: Receives oxygenated blood from lungs
• **Left Ventricle**: Pumps oxygenated blood to entire body

**Electrical Conduction System:**
• **SA Node**: Natural pacemaker (60-100 bpm)
• **AV Node**: Delays impulse to allow atrial contraction
• **Bundle of His**: Conducts impulse to ventricles
• **Purkinje Fibers**: Distribute impulse throughout ventricles

**Common Conditions:**
• **Arrhythmias**: Irregular heart rhythms
• **Heart Failure**: Inability to pump effectively
• **Coronary Artery Disease**: Blocked heart arteries
• **Valvular Disease**: Malfunctioning heart valves

**Diagnostic Tests:**
• **ECG**: Electrical activity of heart
• **Echocardiogram**: Ultrasound of heart structure
• **Stress Test**: Heart function under exercise
• **Cardiac Catheterization**: Direct visualization of arteries

Would you like me to explain any specific condition or create a quiz on cardiology?""",
        "analysis_complete": False
    }

def generate_respiratory_explanation(message_lower, memory):
    """Generate detailed respiratory explanations"""
    return {
        "messages": """**Respiratory System Deep Dive** 🫁

**Anatomy & Function:**

The respiratory system facilitates gas exchange between the body and environment:

**Upper Respiratory Tract:**
• **Nose**: Filters, warms, and humidifies air
• **Pharynx**: Common passage for air and food
• **Larynx**: Voice box and airway protection

**Lower Respiratory Tract:**
• **Trachea**: Cartilaginous tube to lungs
• **Bronchi**: Main airways to each lung
• **Bronchioles**: Smaller airways
• **Alveoli**: Site of gas exchange (300 million per lung)

**Gas Exchange Process:**
• **Oxygen**: Diffuses from alveoli to blood
• **Carbon Dioxide**: Diffuses from blood to alveoli
• **Hemoglobin**: Transports oxygen in blood
• **Partial Pressures**: Drive gas exchange

**Respiratory Mechanics:**
• **Inspiration**: Diaphragm contracts, chest expands
• **Expiration**: Diaphragm relaxes, chest recoils
• **Compliance**: Lung elasticity
• **Resistance**: Airway resistance to flow

**Common Conditions:**
• **Asthma**: Reversible airway obstruction
• **COPD**: Chronic obstructive pulmonary disease
• **Pneumonia**: Lung infection
• **Pulmonary Embolism**: Blood clot in lungs

Would you like a quiz on respiratory physiology or a visual diagram?""",
        "analysis_complete": False
    }

def generate_neurology_explanation(message_lower, memory):
    """Generate detailed neurology explanations"""
    return {
        "messages": """**Nervous System Deep Dive** 🧠

**Central Nervous System (CNS):**

**Brain Regions:**
• **Cerebrum**: Higher cognitive functions, motor control
• **Cerebellum**: Coordination and balance
• **Brainstem**: Vital functions (breathing, heart rate)
• **Diencephalon**: Thalamus and hypothalamus

**Spinal Cord:**
• **Gray Matter**: Cell bodies and synapses
• **White Matter**: Myelinated nerve fibers
• **Reflex Arcs**: Rapid, involuntary responses

**Peripheral Nervous System (PNS):**
• **Somatic**: Voluntary muscle control
• **Autonomic**: Involuntary functions
  - Sympathetic: "Fight or flight"
  - Parasympathetic: "Rest and digest"

**Neuron Structure:**
• **Cell Body**: Contains nucleus and organelles
• **Dendrites**: Receive signals from other neurons
• **Axon**: Transmits signals to other cells
• **Synapse**: Junction between neurons

**Neurotransmitters:**
• **Acetylcholine**: Muscle contraction, memory
• **Dopamine**: Reward, movement, motivation
• **Serotonin**: Mood, sleep, appetite
• **GABA**: Inhibitory neurotransmitter

**Common Conditions:**
• **Stroke**: Brain blood supply interruption
• **Epilepsy**: Seizure disorders
• **Alzheimer's**: Progressive dementia
• **Parkinson's**: Movement disorder

Would you like me to explain any specific brain region or create a visual diagram?""",
        "analysis_complete": False
    }
    
    # Default educational response
    return {
        "messages": "I'd be happy to help you learn! I can explain medical concepts, create quizzes, or generate visual diagrams. What would you like to explore? Try asking me to:\n\n• Explain a medical concept\n• Quiz you on a topic\n• Create a visual diagram\n• Help with anatomy or physiology",
        "analysis_complete": False
    }

def generate_interactive_quiz(message_lower, memory):
    """Generate interactive quizzes with scoring"""
    if 'cardiac' in message_lower or 'heart' in message_lower:
        # Start a cardiology quiz
        memory['current_quiz'] = {
            'topic': 'cardiology',
            'questions': [
                {
                    'question': 'What is the natural pacemaker of the heart?',
                    'options': ['A) AV Node', 'B) SA Node', 'C) Bundle of His', 'D) Purkinje Fibers'],
                    'correct': 'B',
                    'explanation': 'The SA (Sinoatrial) Node is the natural pacemaker that initiates each heartbeat.'
                },
                {
                    'question': 'During which phase do the ventricles contract?',
                    'options': ['A) Diastole', 'B) Systole', 'C) Atrial systole', 'D) Isovolumetric relaxation'],
                    'correct': 'B',
                    'explanation': 'Ventricular systole is when the ventricles contract and pump blood out.'
                },
                {
                    'question': 'What prevents backflow of blood in the heart?',
                    'options': ['A) Muscles', 'B) Valves', 'C) Arteries', 'D) Veins'],
                    'correct': 'B',
                    'explanation': 'Heart valves prevent backflow of blood between chambers.'
                }
            ],
            'current_question': 0,
            'score': 0,
            'started': True
        }
        
        return {
            "messages": """**Cardiology Quiz** 🧠

**Question 1 of 3:**
What is the natural pacemaker of the heart?

A) AV Node
B) SA Node  
C) Bundle of His
D) Purkinje Fibers

**Instructions:**
• Answer with A, B, C, or D
• I'll provide explanations after each question
• Your score will be tracked!

**Current Progress:**
📊 Topics studied: """ + str(len(memory['topics'])) + """
🎯 Quizzes completed: """ + str(len(memory['quiz_scores'])) + """

Take your time to think about each answer! I'll provide explanations after you respond.""",
            "analysis_complete": False
        }
    else:
        return {
            "messages": """**Medical Knowledge Quiz** 🎯

Choose a topic to be quizzed on:

**Available Quiz Topics:**
• **Cardiology**: Heart anatomy, cardiac cycle, arrhythmias
• **Respiratory**: Lung function, breathing mechanics, gas exchange
• **Neurology**: Brain anatomy, nervous system, reflexes
• **Immunology**: Immune system, antibodies, infections

**Quiz Features:**
🎯 **Multiple Choice**: Interactive questions with explanations
📊 **Scoring**: Track your progress and improvement
🏆 **Achievements**: Unlock badges for completed topics

**Current Progress:**
📚 Topics studied: """ + str(len(memory['topics'])) + """
🎯 Quizzes completed: """ + str(len(memory['quiz_scores'])) + """

What topic would you like to be quizzed on?""",
            "analysis_complete": False
        }

def generate_visual_diagram(message_lower, memory):
    """Generate visual diagrams and mind maps"""
    if 'cardiac' in message_lower or 'heart' in message_lower:
        return {
            "messages": """**Heart Anatomy Visual Guide** 🫀

```
    ┌─────────────────────────────────────┐
    │           HEART ANATOMY              │
    └─────────────────────────────────────┘

    ┌─────────┐    ┌─────────┐
    │  Right  │    │  Left   │
    │  Atrium │    │  Atrium │
    └─────────┘    └─────────┘
         │              │
         │              │
    ┌─────────┐    ┌─────────┐
    │  Right  │    │  Left   │
    │Ventricle│    │Ventricle│
    └─────────┘    └─────────┘
         │              │
         │              │
    ┌─────────┐    ┌─────────┐
    │Pulmonary│    │  Aorta  │
    │ Artery  │    │         │
    └─────────┘    └─────────┘
```

**Key Structures:**
• **Atria**: Upper chambers (receiving)
• **Ventricles**: Lower chambers (pumping)
• **Valves**: Prevent backflow
• **Arteries**: Carry blood away from heart

**Blood Flow:**
1. Right Atrium → Right Ventricle → Pulmonary Artery
2. Left Atrium → Left Ventricle → Aorta

**Interactive Features:**
🎨 **3D View**: Would you like a 3D heart model?
🔍 **Detailed**: Focus on specific chambers?
📊 **Animation**: See the cardiac cycle in action?

Would you like me to explain the electrical conduction system or create a more detailed diagram?""",
            "analysis_complete": False
        }
    else:
        return {
            "messages": """**Visual Learning Tools** 🎨

I can create detailed diagrams for any medical concept:

**Available Visual Types:**
• **Anatomical Diagrams**: Heart, lungs, brain, muscles
• **Process Flowcharts**: Cardiac cycle, breathing, digestion
• **Mind Maps**: Disease classifications, drug mechanisms
• **3D Models**: Organ structures and relationships

**Example Diagrams:**
🫀 **Heart**: Complete anatomy with blood flow
🫁 **Lungs**: Respiratory system with gas exchange
🧠 **Brain**: Nervous system with neural pathways
🩸 **Circulation**: Cardiovascular system overview

**Interactive Features:**
🔍 **Zoom**: Focus on specific areas
📊 **Layers**: Show different anatomical layers
🎯 **Labels**: Highlight key structures
📱 **Mobile**: Optimized for all devices

**Current Progress:**
📚 Topics studied: """ + str(len(memory['topics'])) + """
🎨 Diagrams created: """ + str(memory['learning_progress'].get('diagrams_created', 0)) + """

I'll create detailed, educational diagrams to help you understand complex medical concepts!""",
            "analysis_complete": False
        }

def generate_progress_report(memory):
    """Generate learning progress and analytics"""
    total_lessons = sum(module.get('lessons_completed', 0) for module in memory['learning_progress'].values())
    total_quizzes = len(memory['quiz_scores'])
    topics_studied = len(memory['topics'])
    
    return {
        "messages": f"""**Your Learning Progress** 📊

**Overall Statistics:**
📚 **Topics Studied**: {topics_studied}
🎓 **Lessons Completed**: {total_lessons}
🎯 **Quizzes Taken**: {total_quizzes}
🏆 **Modules Completed**: {len(memory['completed_modules'])}

**Topic Breakdown:**
{chr(10).join([f"• **{topic.title()}**: {memory['learning_progress'].get(topic, {}).get('lessons_completed', 0)} lessons" for topic in memory['topics']])}

**Recent Activity:**
• Last lesson: {memory['learning_progress'].get('cardiology', {}).get('last_lesson', 'None')}
• Questions asked: {memory['questions_asked']}
• Learning level: {memory['learning_level']}

**Achievements Unlocked:**
{'🏆 First Lesson' if total_lessons > 0 else '🔒 Complete your first lesson'}
{'🎯 Quiz Master' if total_quizzes > 2 else '🔒 Take 3 quizzes'}
{'📚 Knowledge Seeker' if topics_studied > 3 else '🔒 Study 4 topics'}

**Next Steps:**
• Continue learning about {memory['topics'][-1] if memory['topics'] else 'medical concepts'}
• Take a quiz to test your knowledge
• Explore visual diagrams for better understanding

Keep up the great work! 🚀""",
        "analysis_complete": False
    }

class HooHacksApp:
    def __init__(self):
        self.app = Flask(__name__, static_folder="medLama/out", static_url_path="/")
        CORS(self.app)
        self.setup_routes()

    def setup_routes(self):
        @self.app.route('/')
        def index():
            index_path = os.path.join(self.app.static_folder, "index.html")
            return send_from_directory(self.app.static_folder, "index.html") if os.path.exists(index_path) else abort(404)

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

    def run(self, host="0.0.0.0", port=5002, debug=False):
        self.app.run(host="127.0.0.1" if debug else host, port=port, debug=debug)


app = HooHacksApp().app

if __name__ == "__main__":
    HooHacksApp().run()
