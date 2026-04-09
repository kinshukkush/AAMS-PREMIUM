# 🚀 AAMS Backend - Setup Guide

**Quick Setup**: 5 minutes
**Full Setup**: 15 minutes

---

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB 7.0+ running (local or Docker)
- Redis 7.0+ running (local or Docker)
- npm or yarn package manager

---

## ⚡ Quick Start (5 Minutes)

### Option 1: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d

# Backend runs on: http://localhost:5000
# Access logs: docker-compose logs -f backend
```

### Option 2: Local Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start MongoDB (if not running)
mongod --dbpath /data/db &

# 4. Start Redis (if not running)
redis-server &

# 5. Start backend
npm run dev

# Backend runs on: http://localhost:5000
```

---

## 🔧 Full Setup (15 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Key Environment Variables:**

```env
# Database
MONGODB_URI=mongodb://aams_user:secure_password@localhost:27017/aams?authSource=admin
DB_USER=aams_user
DB_PASS=secure_password

# Cache
REDIS_URL=redis://localhost:6379
REDIS_PASS=redis_password

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-generated-secret-key
JWT_REFRESH_SECRET=your-generated-refresh-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000
AI_SERVICE_URL=http://localhost:5001
```

### Step 3: Start Database Services

**MongoDB:**
```bash
# Option 1: Docker
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=aams_user \
  -e MONGO_INITDB_ROOT_PASSWORD=secure_password \
  mongo:7

# Option 2: Local (macOS)
brew services start mongodb-community

# Option 3: Local (Linux)
sudo systemctl start mongod
```

**Redis:**
```bash
# Option 1: Docker
docker run -d -p 6379:6379 redis:7

# Option 2: Local (macOS)
brew services start redis

# Option 3: Local (Linux)
sudo systemctl start redis
```

### Step 4: Initialize Database

```bash
# Seed demo data (first time only)
npm run seed

# Or migrate database
npm run migrate
```

### Step 5: Start Backend

```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

**Output:**
```
✓ Server running on http://localhost:5000
✓ MongoDB connected
✓ Redis connected
✓ Socket.IO ready
```

---

## 🧪 Verify Installation

### Test API Endpoint

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00Z"}
```

### Test Login

```bash
# Demo credentials
EMAIL: admin@aams.demo
PASSWORD: Admin@123

# Login API call
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aams.demo",
    "password": "Admin@123"
  }'

# Expected response:
# {
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIs...",
#     "user": {...}
#   }
# }
```

### Test Database Connection

```bash
# MongoDB
mongo -u aams_user -p
> use aams
> db.users.find().pretty()

# Redis
redis-cli
> PING
> GET aams:token:*
```

---

## 🔐 Demo Credentials

These credentials are pre-loaded in the database:

### Admin Account
```
Email: admin@aams.demo
Password: Admin@123
```

### Faculty Account
```
Email: faculty@aams.demo
Password: Faculty@123
```

### Student Account
```
Email: student@aams.demo
Password: Student@123
```

---

## 📦 Available NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start development with nodemon
npm test               # Run all tests (225+)
npm run test:auth      # Authentication tests only
npm run test:coverage  # Generate coverage report
npm run seed           # Seed database with demo data
npm run migrate        # Run database migrations
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

---

## 📂 Project Structure

```
aams-backend/
├── src/
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   ├── models/        # MongoDB schemas
│   ├── middleware/    # Auth, validation, logging
│   ├── services/      # Business services
│   ├── utils/         # Helpers
│   └── server.js      # Express app setup
│
├── tests/
│   ├── auth.test.js
│   ├── attendance.test.js
│   ├── premium.test.js
│   ├── validation.test.js
│   ├── integration.test.js
│   ├── security-audit.test.js
│   └── factories/     # Mock data
│
├── Dockerfile         # Production image
├── jest.config.js     # Test configuration
├── package.json       # Dependencies
├── .env.example       # Environment template
└── SETUP.md           # This file
```

---

## 🐛 Troubleshooting

### Port 5000 Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Error

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB
# Docker: docker run -d -p 27017:27017 mongo:7
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Redis Connection Error

```bash
# Check Redis status
redis-cli ping

# Start Redis
# Docker: docker run -d -p 6379:6379 redis:7
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### Tests Failing

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test
npm test auth.test.js

# Debug mode
NODE_DEBUG=* npm test
```

### Environment Variables Not Loading

```bash
# Verify .env file exists
ls -la .env

# Verify variables are set
node -e "console.log(process.env.MONGODB_URI)"

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 Security Setup

### Generate JWT Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env file
JWT_SECRET=<generated-value>
JWT_REFRESH_SECRET=<generated-value>
```

### Email Configuration

```bash
# For Gmail (2FA enabled):
# 1. Enable 2-Step Verification
# 2. Create App Password
# 3. Use app password in EMAIL_PASS

# For SendGrid:
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=SG.your-api-key
```

### Rate Limiting Configuration

```env
RATE_LIMIT_LOGIN_MAX=5           # 5 attempts
RATE_LIMIT_LOGIN_WINDOW=15       # per 15 minutes
RATE_LIMIT_REGISTER_MAX=5        # 5 attempts
RATE_LIMIT_REGISTER_WINDOW=15    # per 15 minutes
RATE_LIMIT_API_MAX=100           # 100 requests
RATE_LIMIT_API_WINDOW=1          # per 1 minute
```

---

## 📊 API Documentation

### Authentication Endpoints

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@aams.demo",
  "password": "Admin@123"
}

Response:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

**Get Current User**
```bash
GET /api/auth/me
Authorization: Bearer <TOKEN>

Response:
{
  "data": {
    "user": { ... }
  }
}
```

**Logout**
```bash
POST /api/auth/logout
Authorization: Bearer <TOKEN>

Response:
{
  "message": "Logged out successfully"
}
```

### Attendance Endpoints

**Mark Attendance**
```bash
POST /api/attendance/mark
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "courseId": "507f1f77bcf86cd799439011",
  "type": "manual",      # manual, qr, face
  "status": "present"    # present, absent, leave
}

Response:
{
  "data": {
    "attendance": { ... }
  }
}
```

### Health Check

```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "cache": "connected"
}
```

---

## 🔗 Related Documentation

- **[QUICKSTART.md](../QUICKSTART.md)** - Overall project quick start
- **[DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)** - Production deployment
- **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - How to run tests
- **[.env.example](./.env.example)** - All environment variables

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running
- [ ] Redis running
- [ ] Dependencies installed: `npm install`
- [ ] .env file created and configured
- [ ] Database seeded: `npm run seed`
- [ ] Backend started: `npm run dev`
- [ ] Health check passing: `curl http://localhost:5000/health`
- [ ] Can login with demo credentials
- [ ] Tests passing: `npm test`

---

## 🚀 Next Steps

1. **Frontend**: See `../aams-frontend/SETUP.md`
2. **AI Service**: See `../aams-ai/SETUP.md`
3. **Mobile**: See `../aams-mobile/SETUP.md`
4. **Run Tests**: `npm test`
5. **Deployment**: See `../DEPLOYMENT_GUIDE.md`

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Ready
