# MongoDB Quick Start - Copy & Paste Guide

## 🚀 5-Minute Setup with MongoDB Atlas (Cloud)

### Step 1: Create Account & Cluster (3 min)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up → Verify email
3. Click "Build a Database" → Choose **FREE** (M0)
4. Click "Create"

### Step 2: Create User (1 min)
1. "Database Access" → "Add New Database User"
2. Username: `medlama_user`
3. Password: Click "Autogenerate Secure Password" → **COPY IT!**
4. "Database User Privileges": Read and write to any database
5. "Add User"

### Step 3: Allow Access (30 sec)
1. "Network Access" → "Add IP Address"
2. "Allow Access from Anywhere" → "Confirm"

### Step 4: Get Connection String (30 sec)
1. "Database" → "Connect" → "Connect your application"
2. Copy the connection string
3. Replace `<password>` with your password from Step 2
4. Add `/medlama` before the `?`:
   ```
   mongodb+srv://medlama_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority
   ```

### Step 5: Configure & Run
```bash
# Edit .env file
nano .env

# Add this line (paste your connection string):
MONGODB_URI=mongodb+srv://medlama_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority

# Save and run
python backend/app.py
```

### Step 6: Verify
```bash
curl http://localhost:5002/api/v1/chat/health
```

**Expected:**
```json
{
  "status": "healthy",
  "database": "connected"  ← Should say "connected"!
}
```

---

## ✅ Quick Test

```bash
# Send a message
curl -X POST http://localhost:5002/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the heart"}'

# Get conversations
curl http://localhost:5002/api/v1/chat/conversations

# Get analytics
curl http://localhost:5002/api/v1/chat/analytics
```

---

## 🔍 View Your Data

### Option 1: MongoDB Atlas Web UI
1. Go to "Database" → "Browse Collections"
2. Select `medlama` database
3. See your collections: `users`, `conversations`, etc.

### Option 2: MongoDB Compass (Desktop App)
1. Download: https://www.mongodb.com/try/download/compass
2. Paste your connection string
3. Connect → Browse data

---

## 🐛 Troubleshooting

### "Failed to connect to MongoDB"
```bash
# Check your .env file
cat .env | grep MONGODB_URI

# Make sure:
# 1. Password is correct (no < >)
# 2. /medlama is before the ?
# 3. No extra spaces
```

### "Authentication failed"
- Go to Atlas → "Database Access"
- Check username is `medlama_user`
- Reset password if needed
- Update .env with new password

### "IP not whitelisted"
- Go to Atlas → "Network Access"
- Click "Add IP Address"
- "Allow Access from Anywhere"

---

## 📊 What's Stored

Every message you send creates:
- ✅ A conversation in `conversations` collection
- ✅ User stats in `users` collection
- ✅ Learning progress in `learning_progress` collection

---

## 🎯 New Endpoints You Can Use

```bash
# List conversations
GET /api/v1/chat/conversations

# Get specific conversation
GET /api/v1/chat/conversations/<id>

# Delete conversation
DELETE /api/v1/chat/conversations/<id>

# Get analytics
GET /api/v1/chat/analytics

# Health check (includes DB status)
GET /api/v1/chat/health
```

---

## 📝 Example .env File

```bash
# Required
GEMINI_API_KEY=your_gemini_key_here
MONGODB_URI=mongodb+srv://medlama_user:PASSWORD@cluster0.xxxxx.mongodb.net/medlama?retryWrites=true&w=majority

# Optional
DATABASE_NAME=medlama
FLASK_ENV=development
LOG_LEVEL=INFO
```

---

## ✨ That's It!

Your database is now:
- ✅ Connected
- ✅ Storing conversations
- ✅ Tracking progress
- ✅ Ready for production

**Next:** Check out `MONGODB_SETUP.md` for detailed info or `MONGODB_IMPLEMENTATION_SUMMARY.md` for what was built!
