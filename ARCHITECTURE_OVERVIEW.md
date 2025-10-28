# 🏗️ MedLama Architecture Overview

## 📊 **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React + TypeScript + Tailwind CSS)          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │   Chat UI  │ │  Analysis   │ │   History   │                │
│  │  Interface │ │   Display   │ │  Management │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Flask Backend (Python)                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │   REST API  │ │   CORS     │ │  Static     │                │
│  │  Endpoints  │ │  Handling  │ │  File      │                │
│  │             │ │            │ │  Serving   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI PROCESSING LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │  Gemini AI  │ │ Perplexity  │ │ LangChain   │                │
│  │  Analysis  │ │  Research   │ │ Framework   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ LangGraph   │ │ Medical     │ │ Risk        │                │
│  │ Workflows   │ │ Knowledge   │ │ Assessment  │                │
│  │             │ │ Base        │ │ Algorithm   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │  MongoDB    │ │  Analytics  │ │  Mock Data  │                │
│  │  Database   │ │  Tracking   │ │  Fallback   │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 **Data Flow Architecture**

```
User Input → Frontend → API → AI Processing → Database → Response → UI
    │           │        │         │            │         │        │
    │           │        │         │            │         │        │
    ▼           ▼        ▼         ▼            ▼         ▼        ▼
Symptoms → React → Flask → Gemini → MongoDB → Analysis → Display
    │           │        │         │            │         │        │
    │           │        │         │            │         │        │
    ▼           ▼        ▼         ▼            ▼         ▼        ▼
Context → State → CORS → Research → Analytics → Report → History
```

## 🎯 **Component Breakdown**

### **Frontend Components**
- **Chat Interface**: Real-time conversation with AI
- **Analysis Display**: Medical reports and recommendations
- **History Management**: Past consultations and insights
- **Provider Search**: Doctor and facility recommendations
- **Settings**: Theme, preferences, and account management

### **Backend Services**
- **API Gateway**: RESTful endpoints for all operations
- **AI Service**: Gemini and Perplexity integration
- **Database Service**: MongoDB operations and queries
- **Analytics Service**: Health insights and pattern analysis
- **Security Service**: Authentication and data protection

### **AI Components**
- **Conversation Manager**: Multi-turn dialogue handling
- **Medical Analyzer**: Symptom analysis and risk assessment
- **Research Engine**: Real-time medical information retrieval
- **Knowledge Base**: Medical symptoms, conditions, and treatments
- **Emergency Detector**: Life-threatening symptom identification

## 📱 **User Journey Flow**

```
1. Landing Page
   ↓
2. Chat Interface
   ↓
3. Symptom Collection
   ↓
4. AI Analysis
   ↓
5. Risk Assessment
   ↓
6. Recommendations
   ↓
7. Provider Search
   ↓
8. History Storage
```

## 🔧 **Technical Stack Details**

### **Frontend Stack**
```
Next.js 15 (React Framework)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
├── Radix UI (Components)
├── Lucide React (Icons)
└── Next Themes (Dark/Light Mode)
```

### **Backend Stack**
```
Flask (Python Web Framework)
├── LangChain (AI Framework)
├── LangGraph (Workflow Management)
├── PyMongo (Database Driver)
├── Flask-CORS (Cross-Origin)
└── Python-dotenv (Environment)
```

### **AI Stack**
```
Google Gemini AI
├── Gemini 1.5 Pro (Primary Model)
├── Custom Medical Prompts
├── Temperature Control (0.3)
└── Context Management

Perplexity API
├── Real-time Research
├── Medical Literature
├── Fact Verification
└── Citation Sources
```

### **Database Stack**
```
MongoDB Atlas
├── Healthcare Providers
├── Facility Information
├── User Analytics
├── Conversation History
└── Medical Knowledge Base
```

## 🚀 **Deployment Architecture**

### **Development Environment**
```
Local Development
├── Frontend: localhost:3000 (Next.js)
├── Backend: localhost:5001 (Flask)
├── Database: Mock Data (Development)
└── AI: Test Keys (Development)
```

### **Production Environment**
```
Cloud Deployment
├── Frontend: Vercel/Netlify
├── Backend: Railway/Heroku
├── Database: MongoDB Atlas
├── AI: Production API Keys
└── CDN: Global Content Delivery
```

## 📊 **Performance Metrics**

### **Response Times**
- **Frontend Load**: < 2 seconds
- **API Response**: < 500ms
- **AI Analysis**: < 3 seconds
- **Database Query**: < 100ms

### **Scalability**
- **Concurrent Users**: 1000+
- **API Requests**: 10,000/hour
- **Database Operations**: 50,000/hour
- **AI Processing**: 1,000/hour

## 🔒 **Security Architecture**

### **Data Protection**
```
User Data → Encryption → Processing → Storage → Analytics
    │           │           │          │         │
    │           │           │          │         │
    ▼           ▼           ▼          ▼         ▼
Input → AES-256 → AI → MongoDB → Insights
```

### **Privacy Controls**
- **Anonymous Mode**: No personal data required
- **Data Encryption**: All sensitive data encrypted
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete activity tracking

## 🎯 **Integration Points**

### **External APIs**
- **Google Gemini**: AI analysis and conversation
- **Perplexity**: Medical research and verification
- **MongoDB Atlas**: Cloud database services
- **Healthcare APIs**: Provider information (planned)

### **Future Integrations**
- **Electronic Health Records**: Patient data integration
- **Insurance APIs**: Coverage verification
- **Telemedicine**: Video consultation platforms
- **Wearable Devices**: Health monitoring data

---

**This architecture provides a robust, scalable foundation for MedLama's AI-powered healthcare assistance platform.** 🏥✨
