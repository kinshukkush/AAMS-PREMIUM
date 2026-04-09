# 🎨 AAMS Frontend - Setup Guide

**Quick Setup**: 5 minutes
**Full Setup**: 15 minutes

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (http://localhost:5000)
- Modern web browser

---

## ⚡ Quick Start (5 Minutes)

### Option 1: Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d

# Frontend runs on: http://localhost:3000
# Access logs: docker-compose logs -f frontend
```

### Option 2: Local Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start development server
npm run dev

# Frontend runs on: http://localhost:3000
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

# Edit with your values (usually defaults work for local)
nano .env
```

**Key Environment Variables:**

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=AAMS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_FACE_RECOGNITION=true
VITE_ENABLE_QR_SCANNING=true
VITE_ENABLE_ANALYTICS=true

# Theme
VITE_DEFAULT_THEME=dark

# Debug
VITE_DEBUG=false
```

### Step 3: Start Frontend

**Development:**
```bash
npm run dev

# Output:
# ✓ Your application is running at:
# ✓ http://localhost:5000
```

**Production Build:**
```bash
# Build
npm run build

# Preview production build
npm run preview

# Output on http://localhost:4173
```

---

## 🧪 Verify Installation

### Access Application

```
Frontend: http://localhost:3000
```

### Login Page

**Demo Credentials:**

```
Admin
Email: admin@aams.demo
Password: Admin@123

Faculty
Email: faculty@aams.demo
Password: Faculty@123

Student
Email: student@aams.demo
Password: Student@123
```

### Check Browser Console

Open DevTools (F12) and check for:
- ✓ No CORS errors
- ✓ API connection successful
- ✓ WebSocket connected
- ✓ No 404 errors

---

## 📦 Available NPM Scripts

```bash
npm run dev            # Start development server (hot reload)
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run type-check     # Check TypeScript types
npm run test           # Run tests (if configured)
npm run test:ui        # Run tests with UI
```

---

## 📂 Project Structure

```
aams-frontend/
├── src/
│   ├── pages/         # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Attendance.jsx
│   │   └── ...
│   │
│   ├── components/    # Reusable components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Button/
│   │   └── ...
│   │
│   ├── hooks/         # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useAttendance.js
│   │   ├── useNotifications.js
│   │   └── ...
│   │
│   ├── services/      # API services
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── ...
│   │
│   ├── styles/        # Global styles
│   ├── utils/         # Utilities
│   ├── App.jsx        # Main component
│   └── main.jsx       # Entry point
│
├── public/            # Static files
├── .env.example       # Environment template
├── vite.config.js     # Vite configuration
├── package.json       # Dependencies
└── SETUP.md           # This file
```

---

## 🎨 Features

### Dashboard
- User profile
- Attendance statistics
- Recent activity
- Quick actions

### Attendance
- Mark attendance manually
- QR code scanner
- Face recognition
- Attendance history
- Statistics

### User Management (Admin)
- Create/edit/delete users
- Bulk import
- Role assignment
- Profile management

### Analytics
- Attendance trends
- Heatmaps
- Anomaly detection
- Reports export (PDF/Excel)

### Settings
- Theme toggle (Dark/Light/System)
- Profile settings
- Password change
- Notifications preferences

---

## 🔐 Authentication

### Login Flow

1. User enters email and password
2. Frontend sends to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in localStorage as `aams_token`
5. All subsequent requests include token in `Authorization` header

### Token Storage

```javascript
// Login
localStorage.setItem('aams_token', token);

// Logout
localStorage.removeItem('aams_token');

// Use in requests
fetch(url, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('aams_token')}`
  }
});
```

### Protected Routes

Routes like `/dashboard`, `/attendance` etc. redirect to login if no token.

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
VITE_PORT=3001 npm run dev
```

### API Connection Error

```bash
# Check backend is running
curl http://localhost:5000/health

# Verify VITE_API_URL in .env
# Should be: VITE_API_URL=http://localhost:5000

# Check CORS settings in backend
# Should allow http://localhost:3000
```

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Backend needs CORS configured for http://localhost:3000

```javascript
// In backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Blank Page or 404

```bash
# Clear cache
rm -rf node_modules .vite

# Reinstall
npm install

# Restart
npm run dev
```

### Token Expired

```
Automatically redirects to login when token expires
Click login again with credentials
```

### "Cannot find module" Error

```bash
# Make sure you're in the right directory
pwd  # Should show: .../aams-frontend

# Reinstall dependencies
npm install

# Check Node version
node --version  # Should be 18+
```

---

## 🎨 Customization

### Change App Theme

Edit `.env`:
```env
VITE_DEFAULT_THEME=dark    # Options: dark, light, system
```

Or in app settings after login.

### Change API URL

For production, update `.env`:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

### Add Custom Logo

Replace `public/logo.png` with your logo.

### Change Colors

Edit tailwind config or CSS variables in `src/styles/`.

---

## 📊 Build & Deployment

### Development Build

```bash
npm run dev
# Runs on http://localhost:3000 with hot reload
```

### Production Build

```bash
# Build
npm run build

# Creates dist/ folder with optimized files
# Upload dist/ to your web server
```

### Preview Production Build

```bash
npm run preview
# Runs production build locally on http://localhost:4173
```

### Docker Build

```bash
# Build image
docker build -t aams-frontend:latest .

# Run container
docker run -p 3000:3000 aams-frontend:latest
```

---

## 🚀 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000 |
| VITE_SOCKET_URL | WebSocket URL | http://localhost:5000 |
| VITE_APP_NAME | App name | AAMS |
| VITE_APP_VERSION | App version | 1.0.0 |
| VITE_ENABLE_FACE_RECOGNITION | Enable face features | true |
| VITE_ENABLE_QR_SCANNING | Enable QR features | true |
| VITE_ENABLE_ANALYTICS | Enable analytics | true |
| VITE_DEFAULT_THEME | Default theme | dark |
| VITE_DEBUG | Debug mode | false |

---

## 🔗 Related Documentation

- **[Backend Setup](../aams-backend/SETUP.md)** - Backend setup
- **[AI Service Setup](../aams-ai/SETUP.md)** - AI setup
- **[Mobile Setup](../aams-mobile/SETUP.md)** - Mobile setup
- **[QUICKSTART.md](../QUICKSTART.md)** - Overall quick start
- **[.env.example](./.env.example)** - Environment variables

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed: `npm install`
- [ ] .env file created and configured
- [ ] Backend running on http://localhost:5000
- [ ] Frontend started: `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can login with demo credentials
- [ ] Dashboard displays without errors
- [ ] Can navigate between pages
- [ ] Theme toggle works

---

## 🚀 Next Steps

1. **Login** with demo credentials
2. **Explore** the dashboard
3. **Test** attendance marking
4. **Review** settings and profile
5. **Check** documentation for features

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Ready
