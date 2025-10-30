# MedLama Setup Guide

Complete guide to set up and run MedLama with real AI integration.

## 🎯 Prerequisites

- Python 3.11+
- Node.js 18+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- MongoDB (optional - for database features)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yash200611/MedLama.git
cd MedLama
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your API keys
nano .env  # or use your preferred editor
```

**Required configuration in `.env`:**
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Optional configuration:**
```bash
MONGODB_URI=mongodb://localhost:27017/
DATABASE_NAME=medlama
LOG_LEVEL=INFO
```

### 3. Frontend Setup

```bash
cd medLama
npm install
npm run build
cd ..
```

## 🚀 Running the Application

### Option 1: Run Backend Only (Recommended for Development)

```bash
# Make sure you're in the project root directory
# and virtual environment is activated

python backend/app.py
```

The application will be available at: **http://localhost:5002**

### Option 2: Run Frontend Development Server Separately

**Terminal 1 - Backend:**
```bash
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd medLama
npm run dev
```

- Backend: http://localhost:5002
- Frontend: http://localhost:3000

## ✅ Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:5002/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "medlama-api",
  "version": "1.0.0"
}
```

### 2. Test AI Integration

```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the heart briefly"}'
```

You should get a detailed AI response about the heart.

### 3. Open in Browser

Navigate to http://localhost:5002 and try the chat interface.

## 🔧 Troubleshooting

### Issue: "GEMINI_API_KEY is required"

**Solution:** Make sure you've:
1. Created a `.env` file in the project root
2. Added your Gemini API key: `GEMINI_API_KEY=your_key_here`
3. Restarted the backend server

### Issue: "Module not found" errors

**Solution:**
```bash
# Make sure you're in the project root
pip install -r requirements.txt

# If still having issues, try:
pip install --upgrade -r requirements.txt
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Make sure backend is running on port 5002
2. Check CORS settings in `backend/config.py`
3. Verify `NEXT_PUBLIC_API_URL` in frontend (if set)

### Issue: "No module named 'backend'"

**Solution:**
```bash
# Run from project root, not from backend directory
cd /path/to/MedLama
python backend/app.py
```

### Issue: Import errors with LangChain

**Solution:**
```bash
# Update LangChain packages
pip install --upgrade langchain langchain-core langchain-google-genai
```

## 📊 API Testing

### Using cURL

**Send a message:**
```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain the cardiac cycle",
    "learning_level": "medical_student"
  }'
```

**Generate a quiz:**
```bash
curl -X POST http://localhost:5002/api/v1/chat/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Cardiology",
    "num_questions": 3,
    "difficulty": "medium"
  }'
```

**Generate a visual:**
```bash
curl -X POST http://localhost:5002/api/v1/chat/visual \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Heart anatomy"
  }'
```

### Using Postman

1. Import the API endpoints from `backend/README.md`
2. Set base URL to `http://localhost:5002`
3. Add `Content-Type: application/json` header
4. Test each endpoint

## 🧪 Running Tests (Optional)

```bash
# Install test dependencies (already in requirements.txt)
pip install pytest pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html
```

## 🌐 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes | - |
| `FLASK_ENV` | Environment (development/production) | No | development |
| `MONGODB_URI` | MongoDB connection string | No | mongodb://localhost:27017/ |
| `DATABASE_NAME` | Database name | No | medlama |
| `LOG_LEVEL` | Logging level | No | INFO |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | localhost:3000,localhost:5002 |
| `AI_MODEL` | Gemini model to use | No | gemini-1.5-flash |
| `AI_TEMPERATURE` | AI temperature (0.0-1.0) | No | 0.7 |

## 📝 Development Workflow

### 1. Start Development

```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run backend
python backend/app.py
```

### 2. Make Changes

- Backend code is in `backend/`
- Frontend code is in `medLama/`
- Backend auto-reloads in development mode

### 3. Test Changes

```bash
# Test backend
pytest

# Test frontend
cd medLama
npm test
```

### 4. Format Code

```bash
# Format Python code
black backend/
isort backend/

# Format TypeScript code
cd medLama
npm run lint:fix
```

## 🚀 Production Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `FLASK_ENV=production`
   - `MONGODB_URI` (if using database)
4. Deploy with: `python backend/app.py`

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set build settings:
   - Build command: `cd medLama && npm run build`
   - Output directory: `medLama/out`
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
5. Deploy

## 📚 Next Steps

1. **Add Database**: Set up MongoDB for data persistence
2. **Add Authentication**: Implement user login/registration
3. **Add Tests**: Write comprehensive tests
4. **Add Monitoring**: Set up error tracking with Sentry
5. **Optimize Performance**: Add caching and rate limiting

## 🆘 Getting Help

- Check the [IMPROVEMENT_PLAN.md](./IMPROVEMENT_PLAN.md) for detailed feature roadmap
- Review [backend/README.md](./backend/README.md) for API documentation
- Open an issue on GitHub
- Check logs for error messages

## ✅ Quick Checklist

Before running the app, make sure:

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created with `GEMINI_API_KEY`
- [ ] Frontend built (`cd medLama && npm run build`)
- [ ] Backend running (`python backend/app.py`)
- [ ] Browser opened to http://localhost:5002

---

**Happy coding! 🚀**
