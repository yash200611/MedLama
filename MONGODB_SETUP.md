# MongoDB Setup Guide for MedLama

Complete step-by-step guide to set up MongoDB Atlas (Cloud Database) for MedLama.

## 🎯 Why MongoDB Atlas?

- ✅ **Free Forever** - M0 tier is completely free
- ✅ **No Installation** - Works immediately, no local setup
- ✅ **Accessible Anywhere** - Cloud-based, access from any device
- ✅ **Production-Ready** - Same setup for development and production
- ✅ **Easy Scaling** - Upgrade when needed
- ✅ **Built-in Monitoring** - Dashboard with metrics

---

## 📦 MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### Step 2: Create a Free Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `medlama_user`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist Your IP Address

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP for better security
4. Click "Confirm"

### Step 5: Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Python, Version: 3.12 or later
5. Copy the connection string:
   ```
   mongodb+srv://medlama_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before the `?`:
   ```
   mongodb+srv://medlama_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority
   ```

### Step 6: Update .env File

```bash
# Edit your .env file
MONGODB_URI=mongodb+srv://medlama_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority
DATABASE_NAME=medlama
```

### Step 7: Test Connection

```bash
python backend/app.py
```

Look for this log message:
```
Successfully connected to MongoDB
Database initialized successfully
```

### Step 8: Verify in Atlas

1. Go to "Database" → "Browse Collections"
2. You should see the `medlama` database
3. After using the app, you'll see collections:
   - `users`
   - `conversations`
   - `quiz_results`
   - `learning_progress`

---

## 🧪 Testing the Database

### Test 1: Send a Message

```bash
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the heart"}'
```

**Expected:** You should get a `conversation_id` in the response.

### Test 2: Get Conversations

```bash
curl http://localhost:5002/api/v1/chat/conversations
```

**Expected:** List of conversations with the one you just created.

### Test 3: Get Analytics

```bash
curl http://localhost:5002/api/v1/chat/analytics
```

**Expected:** User stats, conversation count, quiz stats, and progress.

### Test 4: Health Check

```bash
curl http://localhost:5002/api/v1/chat/health
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "chat",
  "ai_service": "available",
  "database": "connected"
}
```

---

## 📊 Database Schema

### Collections Created:

#### 1. **users**
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  learning_level: String,
  created_at: Date,
  preferences: {
    theme: String,
    notifications: Boolean
  },
  stats: {
    total_lessons: Number,
    total_quizzes: Number,
    average_score: Number,
    streak: Number,
    total_messages: Number
  }
}
```

#### 2. **conversations**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  messages: [{
    role: String,  // 'user' or 'assistant'
    content: String,
    timestamp: Date,
    metadata: Object
  }],
  topic: String,
  created_at: Date,
  updated_at: Date
}
```

#### 3. **quiz_results**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  topic: String,
  questions: Array,
  answers: Object,
  score: Number,
  total_questions: Number,
  percentage: Number,
  difficulty: String,
  time_spent: Number,
  completed_at: Date
}
```

#### 4. **learning_progress**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  topics: {
    "Cardiology": {
      lessons_completed: Number,
      quizzes_taken: Number,
      average_score: Number,
      last_accessed: Date
    }
  },
  achievements: Array,
  current_streak: Number,
  longest_streak: Number,
  last_activity: Date
}
```

---

## 🔧 Troubleshooting

### Issue: "Failed to connect to MongoDB"

**Solution:**
- Check your connection string is correct
- Verify password doesn't have special characters (or URL-encode them)
- Ensure IP address is whitelisted in Atlas
- Check internet connection
- Make sure `/medlama` is in the connection string before the `?`

### Issue: "Authentication failed"

**Solution:**
- Double-check username and password
- Ensure password is URL-encoded if it contains special characters
- Verify user has correct permissions in Atlas

### Issue: "Database not created"

**Solution:**
- MongoDB creates databases on first write
- Send a message through the API
- Check again in Atlas/Compass

### Issue: "Connection timeout"

**Solution:**
- Check firewall settings
- Verify network access settings in Atlas
- Try "Allow Access from Anywhere" temporarily
- Ensure you're connected to the internet
- Try a different network if on corporate/school WiFi

---

## 🎯 New API Endpoints

With MongoDB, you now have these endpoints:

### Conversations
- `GET /api/v1/chat/conversations` - List all conversations
- `GET /api/v1/chat/conversations/<id>` - Get specific conversation
- `DELETE /api/v1/chat/conversations/<id>` - Delete conversation

### Analytics
- `GET /api/v1/chat/analytics` - Get user analytics and progress

### Updated Endpoints
- `POST /api/v1/chat/message` - Now saves to database and returns `conversation_id`

---

## 📈 What's Stored

### Every Message You Send:
- ✅ Saved to conversation
- ✅ User stats updated
- ✅ Learning progress tracked
- ✅ Topic detected and stored

### Every Quiz You Take:
- ✅ Results saved
- ✅ Score calculated
- ✅ Progress updated
- ✅ Achievements unlocked

### Your Progress:
- ✅ Topics studied
- ✅ Lessons completed
- ✅ Average scores
- ✅ Learning streaks
- ✅ Achievements earned

---

## 🚀 Next Steps

1. **Test the database** - Send messages and check they're saved
2. **View your data** - Use MongoDB Compass or Atlas UI
3. **Build features** - Now you can add user profiles, history, etc.
4. **Add authentication** - Next step in IMPROVEMENT_PLAN.md

---

## 📚 Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas account created (or local MongoDB installed)
- [ ] Cluster created and running
- [ ] Database user created with password
- [ ] IP address whitelisted
- [ ] Connection string added to `.env`
- [ ] Backend starts without errors
- [ ] Health check shows "database": "connected"
- [ ] Messages are saved (check in Atlas/Compass)
- [ ] Conversations can be retrieved
- [ ] Analytics endpoint works

**You're all set! 🎉**
