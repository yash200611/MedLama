# Complete Setup Guide - MedLama

Your one-stop guide to get MedLama running in **15 minutes**!

---

## 🎯 What You'll Need

1. **Google Gemini API Key** - Free, takes 2 minutes
2. **MongoDB Atlas Account** - Free forever, takes 5 minutes
3. **Python 3.11+** and **Node.js 18+**

---

## 📋 Step-by-Step Setup

### Part 1: Get Your API Keys (7 minutes)

#### A. Google Gemini API (2 minutes)
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key - you'll need it soon!

#### B. MongoDB Atlas (5 minutes)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Click "Build a Database" → Choose **FREE** (M0 Sandbox)
4. Click "Create"
5. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `medlama_user`
   - Password: Click "Autogenerate" → **COPY THIS PASSWORD!**
   - Privileges: "Read and write to any database"
   - Click "Add User"
6. **Whitelist IP:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Click "Confirm"
7. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password from step 5
   - Add `/medlama` before the `?`:
   ```
   mongodb+srv://medlama_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority
   ```

---

### Part 2: Install MedLama (8 minutes)

#### 1. Clone the Repository (1 min)
```bash
git clone https://github.com/yash200611/MedLama.git
cd MedLama
```

#### 2. Install Python Dependencies (2 min)
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

#### 3. Configure Environment (1 min)
```bash
# Copy template
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

Add these values to your `.env` file:
```env
# Required
GEMINI_API_KEY=paste_your_gemini_key_here
MONGODB_URI=paste_your_mongodb_connection_string_here
DATABASE_NAME=medlama

# Optional
FLASK_ENV=development
LOG_LEVEL=INFO
```

**Save the file!**

#### 4. Build Frontend (3 min)
```bash
cd medLama
npm install
npm run build
cd ..
```

#### 5. Run the Application (1 min)
```bash
python backend/app.py
```

You should see:
```
Successfully connected to MongoDB
Database initialized successfully
 * Running on http://127.0.0.1:5002
```

---

## ✅ Verify It Works

### Test 1: Health Check
```bash
curl http://localhost:5002/api/v1/chat/health
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "chat",
  "ai_service": "available",
  "database": "connected"  ← Should say "connected"!
}
```

### Test 2: Send a Message
```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the heart briefly"}'
```

**Expected:** You should get a detailed AI response about the heart!

### Test 3: Open in Browser
1. Open: http://localhost:5002
2. Type a message like "Explain the cardiac cycle"
3. You should get a real AI response!

---

## 🎉 You're Done!

Your MedLama is now running with:
- ✅ Real AI (Google Gemini)
- ✅ Database (MongoDB Atlas)
- ✅ Conversation persistence
- ✅ Learning progress tracking

---

## 🔍 View Your Data

### MongoDB Atlas Dashboard
1. Go to: https://cloud.mongodb.com
2. Click "Database" → "Browse Collections"
3. Select `medlama` database
4. See your data in:
   - `users` - User profiles
   - `conversations` - All your chats
   - `quiz_results` - Quiz scores
   - `learning_progress` - Your progress

### MongoDB Compass (Optional Desktop App)
1. Download: https://www.mongodb.com/try/download/compass
2. Paste your MongoDB connection string
3. Connect and browse your data visually

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is required"
- Check your `.env` file exists in project root
- Make sure the key is on one line with no spaces
- Restart the backend: `python backend/app.py`

### "Failed to connect to MongoDB"
- Verify your connection string in `.env`
- Make sure password doesn't have `<` or `>` symbols
- Check `/medlama` is in the string before the `?`
- Verify IP is whitelisted in MongoDB Atlas

### "Module not found"
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Port 5002 already in use
```bash
# Find and kill the process
lsof -ti:5002 | xargs kill -9  # macOS/Linux

# Or change port in backend/app.py
```

---

## 📚 Next Steps

### Explore the Features
- Send messages and see them saved
- Check your conversation history
- View analytics: `curl http://localhost:5002/api/v1/chat/analytics`

### Build More Features
See `IMPROVEMENT_PLAN.md` for:
- Authentication system
- Dashboard with charts
- Quiz system
- Testing infrastructure
- CI/CD pipeline

### Deploy to Production
- Backend: Railway or Render
- Frontend: Vercel
- Database: Already on MongoDB Atlas!

---

## 📖 Documentation

- **MONGODB_QUICK_START.md** - Quick MongoDB setup
- **MONGODB_SETUP.md** - Detailed MongoDB guide
- **SETUP_GUIDE.md** - General setup guide
- **IMPROVEMENT_PLAN.md** - Feature roadmap
- **backend/README.md** - API documentation

---

## 🆘 Need Help?

1. Check the error message in the terminal
2. Look at the troubleshooting section above
3. Review the documentation files
4. Check MongoDB Atlas dashboard for connection issues
5. Verify all environment variables are set correctly

---

## ✨ Summary

You now have a **production-ready AI medical education platform** with:
- Real AI responses (not hardcoded!)
- Database persistence
- Conversation history
- User tracking
- Learning analytics
- Professional architecture

**Congratulations! 🎉**

---

## 🚀 Quick Commands Reference

```bash
# Start backend
python backend/app.py

# Health check
curl http://localhost:5002/api/v1/chat/health

# Send message
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Your question here"}'

# Get conversations
curl http://localhost:5002/api/v1/chat/conversations

# Get analytics
curl http://localhost:5002/api/v1/chat/analytics
```

---

**Ready to build something amazing! 🚀**
