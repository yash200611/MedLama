# MedLama Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

```bash
# 1. Setup
git clone https://github.com/yash200611/MedLama.git
cd MedLama
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Configure
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here

# 3. Build & Run
cd medLama && npm install && npm run build && cd ..
python backend/app.py

# 4. Test
curl http://localhost:5002/api/health
```

## 📁 Project Structure

```
MedLama/
├── backend/              # Flask backend (NEW!)
│   ├── app.py           # Main app
│   ├── config.py        # Config
│   ├── services/        # AI service
│   ├── routes/          # API endpoints
│   ├── middleware/      # Error handling
│   └── utils/           # Logging
├── medLama/             # Next.js frontend
│   └── lib/api.ts       # API client (NEW!)
└── docs/
    ├── SETUP_GUIDE.md
    ├── IMPROVEMENT_PLAN.md
    └── IMPLEMENTATION_SUMMARY.md
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/app.py` | Main Flask application |
| `backend/services/ai_service.py` | Real AI integration |
| `backend/routes/chat.py` | API endpoints |
| `medLama/lib/api.ts` | Frontend API client |
| `.env` | Configuration (create from .env.example) |

## 📡 API Endpoints

### Send Message
```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain the heart",
    "learning_level": "medical_student"
  }'
```

### Generate Quiz
```bash
curl -X POST http://localhost:5002/api/v1/chat/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Cardiology",
    "num_questions": 5,
    "difficulty": "medium"
  }'
```

### Health Check
```bash
curl http://localhost:5002/api/health
```

## 🔧 Common Commands

```bash
# Start backend
python backend/app.py

# Start frontend dev server
cd medLama && npm run dev

# Run tests
pytest

# Format code
black backend/
cd medLama && npm run lint:fix

# Check logs
tail -f backend.log
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "GEMINI_API_KEY is required" | Add key to `.env` file |
| "Module not found" | `pip install -r requirements.txt` |
| "Port already in use" | Kill process on port 5002 |
| "No module named 'backend'" | Run from project root |

## 📊 What's New vs Old Code

| Feature | Old (app_simple.py) | New (backend/) |
|---------|---------------------|----------------|
| AI | ❌ Hardcoded | ✅ Real Gemini |
| Memory | ❌ None | ✅ LangChain |
| Errors | ❌ Basic | ✅ Professional |
| API | ❌ GET /api/llm/response | ✅ POST /api/v1/chat/message |
| Config | ❌ Hardcoded | ✅ Environment-based |
| Logging | ❌ print() | ✅ Structured logger |

## 🎯 Portfolio Highlights

**What to emphasize:**
1. ✅ Real AI integration (not hardcoded)
2. ✅ Professional backend architecture
3. ✅ RESTful API design
4. ✅ Error handling & validation
5. ✅ Type-safe frontend client
6. ✅ Production-ready code

**Demo flow:**
1. Show the chat working with real AI
2. Explain the backend architecture
3. Show the API documentation
4. Demonstrate error handling
5. Walk through the code structure

## 📚 Documentation

- **Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **API Docs:** [backend/README.md](./backend/README.md)
- **Roadmap:** [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md)
- **Summary:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 🚀 Next Steps (Priority Order)

1. **Test it works** ✅
   ```bash
   python backend/app.py
   # Visit http://localhost:5002
   ```

2. **Add MongoDB** (Day 2-3)
   - User profiles
   - Conversation history
   - Quiz results

3. **Add Authentication** (Day 3-4)
   - JWT tokens
   - Login/Register
   - Protected routes

4. **Add Tests** (Day 4-5)
   - pytest for backend
   - Vitest for frontend
   - 80%+ coverage

5. **Deploy** (Day 5-6)
   - Backend: Railway/Render
   - Frontend: Vercel
   - MongoDB: Atlas

## 💡 Tips

- **Always run from project root:** `python backend/app.py`
- **Keep .env file secret:** Never commit it
- **Check logs for errors:** They're detailed now
- **Use the API client:** Don't make raw fetch calls
- **Read error messages:** They're descriptive now

## 🎓 Interview Talking Points

**"Tell me about this project"**
> "I built an AI-powered medical education platform. I recently refactored it from hardcoded responses to real AI integration using Google Gemini and LangChain. I implemented a professional Flask backend with proper error handling, RESTful API design, and a type-safe TypeScript frontend client."

**"What challenges did you face?"**
> "The main challenge was integrating LangChain for conversation memory while maintaining good performance. I solved this by implementing a singleton pattern for the AI service and using async/await for non-blocking operations."

**"How did you ensure code quality?"**
> "I implemented comprehensive error handling, structured logging, type hints throughout, and created extensive documentation. The code is production-ready with environment-based configuration and proper separation of concerns."

## ✅ Pre-Demo Checklist

- [ ] Backend runs without errors
- [ ] Frontend displays correctly
- [ ] AI responses are real (not hardcoded)
- [ ] Error handling works
- [ ] API documentation is clear
- [ ] Code is well-commented
- [ ] .env file configured
- [ ] All dependencies installed

## 🆘 Get Help

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
- Review [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) for next steps
- Read error messages - they're descriptive now!
- Check logs in console

---

**You're ready to showcase this project! 🚀**
