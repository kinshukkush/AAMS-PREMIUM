# 📱 AAMS Mobile - Setup Guide

**Quick Setup**: 10 minutes
**Full Setup**: 20 minutes

---

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI installed: `npm install -g expo-cli`
- npm or yarn package manager
- iOS simulator (macOS) or Android emulator
- Expo Go app (for testing on physical device)
- Backend API running (http://localhost:5000)

---

## ⚡ Quick Start (10 Minutes)

### Option 1: Using Expo Go (Easiest - on Phone)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start Expo development server
expo start
# or
npm start

# 4. Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app

# App opens in Expo Go on your phone
```

### Option 2: iOS Simulator (macOS)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start for iOS simulator
npm run ios
# or
expo start --ios

# iOS simulator opens automatically
```

### Option 3: Android Emulator

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start Android emulator first
# Open Android Studio and launch emulator

# 4. Start for Android
npm run android
# or
expo start --android

# App installs and opens in emulator
```

---

## 🔧 Full Setup (20 Minutes)

### Step 1: Install Global Dependencies

```bash
# Install Expo CLI
npm install -g expo-cli

# Verify installation
expo --version
```

### Step 2: Install Project Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

**Key Environment Variables:**

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000  # Android emulator
# For iOS simulator: http://localhost:5000
# For physical device: http://your.backend.ip:5000

EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000

# App Configuration
EXPO_PUBLIC_APP_NAME=AAMS
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_FACE_RECOGNITION=true
EXPO_PUBLIC_ENABLE_QR_SCANNING=true
EXPO_PUBLIC_ENABLE_CAMERA=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true

# Theme
EXPO_PUBLIC_DEFAULT_THEME=dark

# Debug
EXPO_PUBLIC_DEBUG=false
```

### Step 4: Configure for Your Device

**For Android Emulator:**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000
```

**For iOS Simulator:**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

**For Physical Device:**
```bash
# Find your computer's IP address
# macOS/Linux:
ifconfig | grep "inet "

# Use that IP in .env:
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:5000
```

### Step 5: Request Camera Permissions

Camera permissions will be requested on first use for:
- Face recognition
- QR code scanning
- Photo capture

---

## 🧪 Verify Installation

### Start Expo Development Server

```bash
npm start
# or
expo start
```

**Output:**
```
Expo CLI starting in development mode on http://localhost:19000
› Press a │ open Android emulator
› Press i │ open iOS simulator  
› Press w │ open web client
› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

### On Physical Device

```bash
# Open Expo Go app (download from App Store/Play Store)
# Scan QR code shown in terminal
# App opens in Expo Go
```

### Test Login

```
Demo Credentials:
Email: student@aams.demo
Password: Student@123
```

---

## 📦 Available NPM Scripts

```bash
npm start            # Start Expo development server
npm run ios          # Start iOS simulator
npm run android      # Start Android emulator
npm run web          # Start web version
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code
npm run build:ios    # Build iOS app
npm run build:android # Build Android app
npm run eas:build    # Build with EAS (Expo Application Services)
```

---

## 📂 Project Structure

```
aams-mobile/
├── src/
│   ├── screens/       # Screen components
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AttendanceScreen.js
│   │   ├── QRScannerScreen.js
│   │   ├── FaceRecognitionScreen.js
│   │   ├── NotificationsScreen.js
│   │   └── SettingsScreen.js
│   │
│   ├── components/    # Reusable components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   └── ...
│   │
│   ├── hooks/         # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useCamera.js
│   │   └── ...
│   │
│   ├── services/      # API services
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── ...
│   │
│   ├── navigation/    # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── StackNavigator.js
│   │
│   ├── utils/         # Utilities
│   ├── styles/        # Styles
│   ├── App.js         # Main component
│   └── index.js       # Entry point
│
├── .env.example       # Environment template
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── SETUP.md           # This file
```

---

## 🎨 Features

### Authentication
- Email/password login
- Demo account support
- Token persistence
- Auto-logout on expiry

### Dashboard
- Welcome message
- Quick stats
- Recent activity
- Action buttons

### Attendance Marking
- Manual marking
- QR code scanning
- Face recognition
- Attendance history

### QR Scanner
- Scan QR codes
- Auto attendance marking
- Error handling
- Feedback messages

### Face Recognition
- Face enrollment
- Real-time face detection
- Recognition matching
- Confidence score display

### Notifications
- Push notifications (if configured)
- In-app notifications
- Notification history
- Mark as read

### Settings
- Theme toggle
- Logout
- Profile view
- App info

---

## 🔐 Authentication

### Login Flow

1. User enters email and password
2. App sends to `/api/auth/login`
3. Backend returns JWT token
4. Token stored in AsyncStorage as `aams_token`
5. All requests include token in `Authorization` header

### Token Management

```javascript
// Login
await AsyncStorage.setItem('aams_token', token);

// Logout
await AsyncStorage.removeItem('aams_token');

// Use in requests
const token = await AsyncStorage.getItem('aams_token');
const headers = {
  'Authorization': `Bearer ${token}`
};
```

---

## 📸 Camera & Permissions

### Request Permissions

```javascript
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

// Camera permission
const { status } = await Camera.requestCameraPermissionsAsync();

// Photo/gallery permission
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
```

### Face Recognition

```javascript
// Capture face image
// Send to backend: /api/attendance/face
// Backend returns: match status

const response = await fetch(`${API_URL}/api/attendance/face`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData  // includes face image
});
```

### QR Scanning

```javascript
import { CameraView, useCameraPermissions } from 'expo-camera';

// User points camera at QR code
// Scanned data parsed
// Auto attendance marking

const handleBarCodeScanned = async ({ data }) => {
  // data contains QR code value
  // Send to backend: /api/attendance/qr
};
```

---

## 🐛 Troubleshooting

### npm install Fails

**If you see: `No matching version found for zustand-persist@^1.1.0`**

This package doesn't exist in npm registry. The issue has been fixed:
- The dependency has been removed from `package.json`
- The app uses Zustand with AsyncStorage directly (already integrated)

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Try installing again
npm install

# Should work now!
npm start
```

### Expo CLI Not Found

```bash
npm install -g expo-cli --force
expo --version
```

### Cannot Connect to Backend

**Check API URL in .env:**

For Android emulator: `http://10.0.2.2:5000`
For iOS simulator: `http://localhost:5000`
For physical device: `http://192.168.x.x:5000`

**Test connection:**
```bash
# From your computer
curl http://localhost:5000/health

# Verify backend is running
# Check backend logs: docker-compose logs backend
```

### Camera Permission Denied

```javascript
// Request permission again
import * as Camera from 'expo-camera';
await Camera.requestCameraPermissionsAsync();

// Or go to Settings → App → Permissions → Camera
```

### App Crashes on Startup

```bash
# Clear cache
expo start --clear

# or

npm start -- --clear
```

### QR Code Not Scanning

```bash
# Ensure camera permission granted
# Check good lighting
# Hold camera steady
# Try different QR code
```

### Face Recognition Not Working

```bash
# Ensure camera permission granted
# Check face is clearly visible
# Good lighting required
# Face must be registered in system
```

### Network Error When Logging In

```bash
# Check backend is running
# Check API URL in .env
# Check network connectivity
# Try again after few seconds
```

---

## 🚀 Building for App Stores

### Build iOS App

```bash
# Using EAS (Recommended)
eas build --platform ios

# Or locally (requires Mac)
expo build:ios
```

### Build Android App

```bash
# Using EAS (Recommended)
eas build --platform android

# Or locally
expo build:android
```

### Configure app.json

```json
{
  "expo": {
    "name": "AAMS",
    "slug": "aams",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.aams.mobile"
    },
    "android": {
      "package": "com.aams.mobile"
    }
  }
}
```

---

## 🔗 Related Documentation

- **[Backend Setup](../aams-backend/SETUP.md)** - Backend setup
- **[Frontend Setup](../aams-frontend/SETUP.md)** - Web frontend setup
- **[AI Service Setup](../aams-ai/SETUP.md)** - AI setup
- **[QUICKSTART.md](../QUICKSTART.md)** - Overall quick start

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed: `npm install -g expo-cli`
- [ ] Dependencies installed: `npm install`
- [ ] .env file created and configured
- [ ] Backend running on http://localhost:5000
- [ ] Development server started: `npm start`
- [ ] Can scan QR code with Expo Go app
- [ ] Can login with demo credentials
- [ ] Can see dashboard
- [ ] Camera permission working

---

## 📱 Demo Credentials

```
Student Account (Recommended for mobile):
Email: student@aams.demo
Password: Student@123

Faculty Account:
Email: faculty@aams.demo
Password: Faculty@123

Admin Account:
Email: admin@aams.demo
Password: Admin@123
```

---

## 🚀 Next Steps

1. **Start** development server: `npm start`
2. **Open** Expo Go app or simulator
3. **Login** with demo credentials
4. **Explore** features
5. **Test** QR scanning and face recognition

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Ready
