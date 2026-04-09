# AAMS Mobile - React Native Expo App

Premium mobile attendance system with face detection, QR scanning, and real-time sync.

## 📱 Features

### Authentication
- ✅ Email/Password login
- ✅ Biometric authentication (Face ID / Touch ID)
- ✅ JWT token-based auth with refresh
- ✅ Secure token storage in AsyncStorage
- ✅ Account registration

### Student Features
- ✅ Dashboard with attendance stats
- ✅ View attendance history with filters
- ✅ QR code scanner for quick attendance
- ✅ Face detection attendance marking
- ✅ Profile management
- ✅ Settings & preferences
- ✅ Notifications center

### Faculty Features
- ✅ Dashboard with class overview
- ✅ Mark attendance for students
- ✅ Session management
- ✅ Attendance analytics
- ✅ Quick actions

### Core Capabilities
- 📷 Face detection (expo-face-detector)
- 🔲 QR code scanning (expo-barcode-scanner)
- 🔐 Biometric authentication (expo-local-authentication)
- 🔔 Push notifications (expo-notifications)
- 📡 Real-time sync (socket.io)
- 🟢 Offline queue system
- 🌓 Dark/Light/System theme support

## 🏗️ Project Structure

```
aams-mobile/
├── src/
│   ├── context/              # Global state management
│   │   ├── AppContext.ts    # Zustand store (offline queue, settings)
│   │   ├── AuthContext.tsx  # JWT authentication
│   │   └── ThemeContext.tsx # Dark/Light mode themes
│   │
│   ├── navigation/           # React Navigation
│   │   └── RootNavigator.tsx # Auth & tab navigation
│   │
│   ├── screens/              # Screen components
│   │   ├── auth/            # LoginScreen, RegisterScreen
│   │   ├── student/         # StudentDashboard, StudentAttendance
│   │   ├── faculty/         # FacultyDashboard, MarkAttendanceScreen
│   │   ├── attendance/      # QRScannerScreen, FaceAttendanceScreen
│   │   ├── profile/         # ProfileScreen
│   │   ├── settings/        # SettingsScreen
│   │   └── notifications/   # NotificationsScreen
│   │
│   ├── components/           # Reusable components (TBD)
│   ├── services/             # API & external services (TBD)
│   └── hooks/                # Custom React hooks (TBD)
│
├── App.tsx                   # Entry point with providers
├── app.json                  # Expo configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Physical device or emulator (iOS Simulator / Android Emulator)

### Installation

```bash
# Navigate to mobile app
cd aams-mobile

# Install dependencies
npm install

# Start development server
npm start

# For iOS
npm run ios

# For Android
npm run android

# For Web preview
npm run web
```

### Demo Credentials

```
Email: student@aams.demo
Password: Student@123

Email: faculty@aams.demo
Password: Faculty@123

Email: admin@aams.demo
Password: Admin@123
```

## 🎨 Theme System

### Colors (Matches Web Theme)

**Dark Mode:**
- Background: `#0f1629` (Deep navy)
- Surface: `#1a2437` (Darker navy)
- Primary: `#3b82f6` (Blue)
- Text: `#ffffff`
- Text secondary: `#9ca3af`

**Light Mode:**
- Background: `#ffffff` (White)
- Surface: `#f9fafb` (Light gray)
- Primary: `#3b82f6` (Blue)
- Text: `#1f2937` (Dark gray)
- Text secondary: `#6b7280`

### Toggling Theme

```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.bg }}>
      <TouchableOpacity onPress={toggleTheme}>
        <Text style={{ color: colors.text }}>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🔐 Authentication Flow

1. **Initial Load**: Check AsyncStorage for saved token
2. **If No Token**: Show LoginScreen
3. **Login/Register**: POST to `/api/auth/login` or `/api/auth/register`
4. **Token Storage**: Save JWT to AsyncStorage
5. **Auto-Login**: Use saved token for future sessions
6. **Biometric**: Optional Face ID / Touch ID unlock

## 📷 Camera Integration

### QR Scanner
```tsx
import { BarCodeScanner } from 'expo-barcode-scanner';

// Permissions handled by Expo plugin
// On scan: POST to /api/attendance/mark-qr with QR data
```

### Face Detection
```tsx
import { Camera } from 'expo-camera';
import { useFaceDetector } from 'expo-face-detector';

// Detects faces in real-time
// On capture: POST to /api/attendance/mark-face with base64 image
```

## 🟢 Offline Mode

Automatically queues failed attendance marks:

```tsx
import { useAppStore } from '../context/AppContext';

const { offlineQueue, addToQueue, clearQueue } = useAppStore();

// When offline, attendance is added to queue
// When online, queue is synced to backend
```

## 🔔 Real-time Updates

Socket.io integration for live updates:

```tsx
// Automatic sync with backend
// New attendance, notifications, session changes
```

## 📦 Build & Deployment

### Development Build
```bash
npm start
```

### Production Build (iOS)
```bash
npm run build:ios
npm run submit:ios
```

### Production Build (Android)
```bash
npm run build:android
npm run submit:android
```

## 🛠️ Development

### Type Safety
All components use TypeScript. Interface definitions in each screen.

### State Management
- **Global State**: Zustand (`AppContext`)
- **Auth State**: React Context (`AuthContext`)
- **Theme State**: React Context (`ThemeContext`)

### API Calls
```tsx
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const response = await axios.get(`${API_URL}/api/endpoint`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## 📝 Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Camera permissions not working
- Ensure permissions are granted in device settings
- Check `app.json` plugins for camera configuration
- Test on physical device (simulators may have limitations)

### Biometric not available
- Device must have Face ID or fingerprint sensor
- User must have biometric setup in device settings
- Fallback to password login always available

### Connection issues
- Verify backend API is running
- Check `EXPO_PUBLIC_API_URL` environment variable
- Test with `curl` or Postman on desktop

### Token expiration
- Automatic token refresh on 401 response
- Logout if refresh fails
- Re-login required

## 📱 Screen Components Overview

### LoginScreen
- Email/Password input
- Biometric authentication button
- Registration link
- Demo credentials display

### StudentDashboard
- Attendance stats (present, absent, late)
- Percentage calculation
- Quick action buttons
- Recent activity

### QRScannerScreen
- Barcode scanner with frame overlay
- Real-time detection
- Success feedback
- Error handling

### FaceAttendanceScreen
- Front-facing camera
- Face positioning guide
- Capture button
- Processing feedback

### MarkAttendanceScreen
- Student list with filters
- Individual status buttons (Present/Late/Absent)
- Bulk submit functionality

### ProfileScreen
- User information
- Role display
- Settings navigation
- Logout button

## 🔗 API Integration

All endpoints match backend `/api/*` routes:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/attendance`
- `POST /api/attendance/mark-qr`
- `POST /api/attendance/mark-face`
- `POST /api/attendance/bulk-mark`
- `GET /api/sessions`
- `GET /api/users/students`

## 📊 Performance

- Code splitting with lazy loading
- Image optimization
- Memoization of expensive components
- Virtual lists for long lists
- Efficient state updates with Zustand

## 🔒 Security

- JWT tokens in AsyncStorage
- Secure axios interceptors
- Input validation on all forms
- Rate limiting (backend)
- API key protection (backend)

## 📄 License

MIT

## 👨‍💼 Support

For issues or features, contact the development team.
