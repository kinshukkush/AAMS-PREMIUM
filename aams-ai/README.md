# 🎓 AAMS — Automated Attendance Management System
### Lovely Professional University, Phagwara

A full-stack, AI-powered attendance tracking system with face recognition, QR code scanning, real-time dashboards, and analytics — built for colleges using **React**, **Node.js**, **MongoDB**, and **Python (Flask + OpenCV)**.

---

## 🗂️ Project Structure

```
aams/
├── aams-frontend/      ← React (Vite) frontend
├── aams-backend/       ← Node.js + Express + MongoDB backend
└── aams-ai/            ← Python Flask face recognition service
```

---

## ⚙️ Tech Stack

| Layer        | Technology                         |
|--------------|-------------------------------------|
| Frontend     | React 18, Vite, Recharts, Socket.io |
| Backend      | Node.js, Express 4, MongoDB (Mongoose) |
| AI Service   | Python 3.10+, Flask, OpenCV, face_recognition (dlib) |
| Auth         | JWT (Access + Refresh tokens)       |
| Realtime     | Socket.io                           |
| Reports      | PDFKit, ExcelJS                     |
| Email        | Nodemailer                          |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- CMake (required for dlib/face_recognition)

---

### 1️⃣ Clone & Setup

```bash
# Extract the zip, then cd into the project
cd aams
```

---

### 2️⃣ Backend Setup

```bash
cd aams-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, EMAIL credentials

# Seed the database with sample data
npm run seed

# Start the backend
npm run dev
# → Running at http://localhost:5000
```

**Demo credentials after seeding:**
| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Admin   | admin@lpu.edu        | Admin@123    |
| Faculty | priya@lpu.edu        | Faculty@123  |
| Student | sid@lpu.edu          | Student@123  |
| Parent  | ramesh@gmail.com     | Parent@123   |

---

### 3️⃣ Frontend Setup

```bash
cd aams-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
# VITE_AI_URL=http://localhost:8000/api

# Start frontend
npm run dev
# → Running at http://localhost:3000
```

---

### 4️⃣ Python AI Service Setup

```bash
cd aams-ai

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Linux/Mac
# OR: venv\Scripts\activate    # Windows

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install -y cmake build-essential libopenblas-dev liblapack-dev

# Install Python packages
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start the AI service
python run.py
# → Running at http://localhost:8000
```

> ⚠️ **Note:** `face_recognition` requires `dlib` which needs CMake. On Windows, install Visual Studio Build Tools first.

---

## 📡 API Reference

### Backend (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | List all users (Admin) |
| POST | `/api/users` | Create user (Admin) |
| POST | `/api/attendance/sessions/start` | Start session (Faculty) |
| PUT | `/api/attendance/sessions/:id/end` | End session |
| POST | `/api/attendance/mark` | Mark attendance manually |
| POST | `/api/attendance/bulk-mark` | Bulk mark |
| POST | `/api/attendance/qr-scan` | Student QR scan |
| GET | `/api/attendance/student/:id/summary` | Student summary |
| GET | `/api/attendance/analytics/at-risk` | At-risk students |
| GET | `/api/reports/student/:id/pdf` | Export PDF |
| GET | `/api/reports/excel` | Export Excel |
| GET | `/api/departments` | List departments |
| GET | `/api/courses` | List courses |
| GET | `/api/timetable` | Get timetable |
| GET | `/api/devices` | List devices (Admin) |

### AI Service (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health |
| POST | `/api/register/:student_id` | Register face |
| DELETE | `/api/register/:student_id` | Delete face data |
| POST | `/api/recognize` | Recognize faces in frame |
| POST | `/api/recognize/stream` | Optimized stream recognition |
| POST | `/api/liveness` | Liveness detection |
| GET | `/api/status` | Get registered students count |
| POST | `/api/reload-cache` | Reload encoding cache |

---

## 🔄 How Face Recognition Works

```
1. Admin registers student face (3 photos captured)
   → Face encoding extracted via face_recognition library
   → Saved as .pkl file + cached in memory

2. Faculty starts attendance session (mode: face)
   → Frontend activates camera
   → Frames sent to Python AI service every few seconds

3. Python service:
   → Detects faces in frame (OpenCV/dlib HOG model)
   → Compares against cached encodings (Euclidean distance)
   → Performs liveness check (LBP + Laplacian variance)
   → Returns recognized student IDs + confidence

4. AI service calls Node.js backend (/api/attendance/face-result)
   → Backend creates AttendanceRecord in MongoDB
   → Socket.io broadcasts update to faculty dashboard

5. Faculty sees real-time attendance list updating
   → Session ends → PDF/Excel report available
```

---

## 🗃️ Database Schema (MongoDB)

```
users              ← All users (admin/faculty/student/parent)
departments        ← Academic departments
courses            ← Subjects/courses
timetable          ← Class schedule slots
attendancesessions ← Each class session
attendancerecords  ← Individual attendance per student per session
devices            ← Cameras/IoT devices
notifications      ← In-app alerts
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_session_room` | Client → Server | Join a session's real-time room |
| `face_frame` | Client → Server | Send video frame for recognition |
| `attendance_marked` | Server → Client | Student marked present |
| `face_recognized` | Server → Client | Face recognized in frame |
| `session_started` | Server → Client | New session started |

---

## 🎯 Features Summary

### 👨‍💼 Admin Portal
- Dashboard with college-wide analytics and charts
- User management (create/edit/delete students, faculty, parents)
- Department and course management
- Timetable builder (weekly grid view)
- Device management (register cameras)
- Attendance reports (PDF + Excel export)
- Bulk notification sending
- Face registration management

### 👨‍🏫 Faculty Portal
- Dashboard with today's schedule
- Start attendance session (3 modes: Face / QR / Manual)
- Real-time attendance list during session
- Class reports with filters
- Student analytics (radar chart, subject breakdown)
- At-risk student alerts

### 🎓 Student Portal
- Personal attendance dashboard with charts
- Subject-wise breakdown with progress bars
- Attendance history (table + calendar view)
- QR code scan to mark attendance
- Low attendance warnings
- Notifications

### 👨‍👧 Parent Portal
- Child's attendance overview
- Subject-wise details
- Weekly trend charts
- Low attendance alerts

---

## 🚀 Production Deployment

```bash
# Backend
NODE_ENV=production node src/server.js
# OR with PM2:
pm2 start src/server.js --name aams-backend

# Frontend (build)
npm run build
# Serve with nginx or deploy to Vercel/Netlify

# AI Service
gunicorn -w 2 -b 0.0.0.0:8000 run:app
# OR with supervisor for process management
```

---

## 📦 Environment Variables

See `.env.example` files in each service directory.

---

*Built for Capstone Project — School of Computer Science and Engineering, LPU*
*Team: Siddharth Malik, Kinshuk, Sanchi, Naman, Prachi, Khushi*
