# MedLama - AI-Powered Health Assistant 🏥

![MedLama Logo](https://img.shields.io/badge/MedLama-AI%20Health%20Assistant-blue?style=for-the-badge&logo=medical-bag)

MedLama is an intelligent health assistant that combines the power of AI with medical expertise to provide personalized symptom analysis, doctor recommendations, and emergency facility locations.

## 🌟 Features

- **🤖 AI-Powered Symptom Analysis**: Multi-turn conversation system using Google Gemini and Perplexity AI
- **👨‍⚕️ Doctor Recommendations**: Find nearby specialists based on your symptoms
- **🏥 Emergency Facilities**: Locate nearby hospitals and health centers
- **💬 Interactive Chat Interface**: Modern, responsive chat UI built with Next.js
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🌙 Dark/Light Mode**: Toggle between themes for comfortable usage
- **📊 Severity Assessment**: AI-powered risk assessment for symptoms

## 🚀 Live Demo

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-green?style=for-the-badge)](https://medlama.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### Backend
- **Flask** - Python web framework
- **LangChain** - AI application framework
- **Google Gemini AI** - Advanced language model
- **Perplexity AI** - Medical research API
- **MongoDB** - NoSQL database
- **PyMongo** - MongoDB driver

### AI & ML
- **LangGraph** - Multi-agent AI workflows
- **Google Generative AI** - Medical analysis
- **Perplexity API** - Real-time medical research

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (optional - uses mock data if not available)

### 1. Clone the Repository
```bash
git clone https://github.com/yash200611/MedLama.git
cd MedLama
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp env.template .env

# Edit .env file with your API keys
# GEMINI_API_KEY=your_gemini_api_key_here
# PERPLEXITY_API_KEY=your_perplexity_api_key_here
# database-connection-string=test
```

### 3. Frontend Setup
```bash
cd medLama
npm install
npm run build
cd ..
```

### 4. Run the Application
```bash
# Start the Flask backend
python app.py

# The app will be available at http://localhost:5001
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required API Keys
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Database (optional)
database-connection-string=mongodb://localhost:27017/
```

### Getting API Keys

1. **Google Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Perplexity API**: Sign up at [Perplexity AI](https://www.perplexity.ai/settings/api)

## 🏗️ Project Structure

```
MedLama/
├── app.py                 # Main Flask application
├── app_simple.py         # Simplified version for development
├── database.py           # MongoDB database operations
├── multiturn.py          # AI conversation logic
├── llm.py               # Language model configuration
├── requirements.txt      # Python dependencies
├── env.template         # Environment variables template
├── README.md            # This file
└── medLama/            # Next.js frontend
    ├── app/            # Next.js app directory
    ├── components/     # React components
    ├── lib/           # Utility functions
    ├── hooks/         # Custom React hooks
    └── package.json   # Node.js dependencies
```

## 🎯 Usage

1. **Start a Conversation**: Describe your symptoms in the chat interface
2. **AI Analysis**: The system will ask follow-up questions to gather more details
3. **Get Recommendations**: Receive AI-powered analysis with severity assessment
4. **Find Help**: Get recommendations for nearby doctors and emergency facilities

## 🔒 Privacy & Security

- All conversations are processed locally
- No personal health data is stored permanently
- API calls are made securely with proper authentication
- Mock data is used for development to protect privacy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

**Yash** - [@yash200611](https://github.com/yash200611)
Brendan Muller
Saksham Gupta

## 🙏 Acknowledgments

- Google Gemini AI for advanced language processing
- Perplexity AI for medical research capabilities
- The open-source community for amazing tools and libraries

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact me at [your-email@example.com](mailto:your-email@example.com).

---

⭐ **Star this repository if you found it helpful!**
