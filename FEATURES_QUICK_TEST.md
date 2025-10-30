# Quick Test Guide - New Features

## 🚀 Test Your New Portfolio Features!

### Prerequisites:
```bash
# Make sure backend is running
python backend/app.py
```

---

## 1️⃣ Test Quiz System (5 minutes)

### Generate a Quiz:
```bash
curl -X POST http://localhost:5002/api/v1/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Cardiology",
    "num_questions": 3,
    "difficulty": "medium"
  }'
```

**Expected:** JSON with quiz_id, questions, and options

### Submit Quiz Answers:
```bash
# Replace quiz_id and questions with actual data from above
curl -X POST http://localhost:5002/api/v1/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "YOUR_QUIZ_ID_HERE",
    "topic": "Cardiology",
    "questions": [
      {
        "question": "Sample question?",
        "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
        "correct_answer": "A",
        "explanation": "Explanation here"
      }
    ],
    "answers": {"1": "A"},
    "time_spent": 60,
    "difficulty": "medium"
  }'
```

**Expected:** Score, percentage, results with explanations, achievements

### Get Quiz History:
```bash
curl http://localhost:5002/api/v1/quiz/history
```

**Expected:** List of all quizzes taken with scores

---

## 2️⃣ Test Streaming Responses (Browser)

### Option A: Using Browser Console

1. Open http://localhost:5002/learn
2. Open browser console (F12)
3. Paste this code:

```javascript
const eventSource = new EventSource('http://localhost:5002/api/v1/stream/chat');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'token') {
    console.log('Token:', data.content);
  } else if (data.type === 'done') {
    console.log('Stream complete!');
    eventSource.close();
  }
};

// Send message via POST first
fetch('http://localhost:5002/api/v1/stream/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'Explain the heart briefly'})
});
```

**Expected:** See tokens streaming in console

### Option B: Using cURL (basic test)

```bash
curl -N -X POST http://localhost:5002/api/v1/stream/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the heart briefly"}'
```

**Expected:** See data streaming line by line

---

## 3️⃣ Test Analytics Dashboard

### Get Analytics Data:
```bash
curl http://localhost:5002/api/v1/chat/analytics
```

**Expected:** Complete user analytics with:
- User stats (lessons, quizzes, scores, streak)
- Conversation count
- Quiz statistics
- Learning progress per topic
- Achievements

### View in Browser:
```bash
open http://localhost:5002/dashboard
```

**Expected:** Beautiful dashboard with:
- Stats cards (lessons, quizzes, visuals, time)
- Learning progress bars per topic
- Achievements section
- Recent activity feed

---

## 4️⃣ Test Complete Flow

### Step 1: Send a Message
```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the cardiac cycle"}'
```

**Check:** Message saved, conversation_id returned

### Step 2: Generate Quiz on Same Topic
```bash
curl -X POST http://localhost:5002/api/v1/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Cardiology", "num_questions": 5}'
```

**Check:** Quiz generated with 5 questions

### Step 3: Submit Quiz
```bash
# Use actual quiz data from step 2
curl -X POST http://localhost:5002/api/v1/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "...",
    "topic": "Cardiology",
    "questions": [...],
    "answers": {"1": "A", "2": "B", "3": "C", "4": "D", "5": "A"},
    "time_spent": 300,
    "difficulty": "medium"
  }'
```

**Check:** Score calculated, achievements unlocked

### Step 4: View Analytics
```bash
curl http://localhost:5002/api/v1/chat/analytics
```

**Check:** 
- total_messages increased
- total_quizzes increased
- Cardiology topic shows progress
- Achievements listed

---

## 5️⃣ Test All Endpoints

### Health Checks:
```bash
# Main health
curl http://localhost:5002/api/health

# Chat service health
curl http://localhost:5002/api/v1/chat/health

# Streaming health
curl http://localhost:5002/api/v1/stream/health
```

### Conversations:
```bash
# List conversations
curl http://localhost:5002/api/v1/chat/conversations

# Get specific conversation (use ID from above)
curl http://localhost:5002/api/v1/chat/conversations/YOUR_CONVERSATION_ID
```

### Quiz Endpoints:
```bash
# Generate quiz
curl -X POST http://localhost:5002/api/v1/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Neurology", "num_questions": 3, "difficulty": "easy"}'

# Get history
curl http://localhost:5002/api/v1/quiz/history

# Get history for specific topic
curl http://localhost:5002/api/v1/quiz/history?topic=Cardiology

# Leaderboard (placeholder)
curl http://localhost:5002/api/v1/quiz/leaderboard
```

---

## ✅ Success Checklist

After testing, you should have:

- [ ] Generated at least one quiz
- [ ] Submitted quiz answers and got score
- [ ] Seen streaming responses (tokens appearing)
- [ ] Viewed analytics dashboard
- [ ] Seen achievements unlocked
- [ ] Confirmed data persists in MongoDB
- [ ] All health checks return "healthy"

---

## 🎯 Demo Flow for Portfolio

**1. Start Backend:**
```bash
python backend/app.py
```

**2. Open Browser:**
```bash
open http://localhost:5002
```

**3. Show Features:**
- Chat with AI (streaming responses)
- Generate a quiz
- Take the quiz
- Show dashboard with analytics
- Highlight achievements

**4. Show Code:**
- Backend: `backend/routes/quiz.py` - Quiz logic
- Backend: `backend/routes/streaming.py` - Streaming
- Frontend: `medLama/app/dashboard/page.tsx` - Dashboard
- API Client: `medLama/lib/api.ts` - Type-safe API

---

## 🐛 Troubleshooting

### Quiz Generation Fails:
- Check GEMINI_API_KEY is set in .env
- Check backend logs for errors
- Try with fewer questions (num_questions: 1)

### Streaming Not Working:
- Use browser console instead of cURL
- Check CORS settings
- Verify endpoint: `/api/v1/stream/chat`

### Analytics Shows No Data:
- Send some messages first
- Take a quiz
- Check MongoDB connection
- Verify database has data

### Dashboard Not Loading:
- Run: `cd medLama && npm run build`
- Check frontend is built
- Verify port 5002 is accessible

---

## 📊 View Data in MongoDB

### MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Click "Database" → "Browse Collections"
3. Select `medlama` database
4. Check collections:
   - `users` - User profiles
   - `conversations` - Chat history
   - `quiz_results` - Quiz scores ⭐ NEW!
   - `learning_progress` - Progress tracking

### MongoDB Compass:
1. Open Compass
2. Connect with your connection string
3. Browse `medlama` database
4. See quiz_results collection with scores

---

## 🎉 You're Ready!

Your project now has:
- ✅ Real-time AI streaming
- ✅ Intelligent quiz system
- ✅ Comprehensive analytics
- ✅ Achievement system
- ✅ Beautiful dashboard
- ✅ Production-ready code

**Perfect for your portfolio!** 🚀

---

## 📚 Documentation

- **ADVANCED_FEATURES_SUMMARY.md** - Detailed feature docs
- **backend/README.md** - API documentation
- **MONGODB_SETUP.md** - Database setup
- **COMPLETE_SETUP_GUIDE.md** - Full setup guide

**Happy testing!** 🎊
