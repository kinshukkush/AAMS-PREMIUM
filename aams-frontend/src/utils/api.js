import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000/api';

// ===== Main API client =====
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aams_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('aams_refresh');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const newToken = res.data.data.accessToken;
          localStorage.setItem('aams_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('aams_token');
        localStorage.removeItem('aams_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ===== AI service client =====
export const aiApi = axios.create({
  baseURL: AI_URL,
  timeout: 10000,
});

aiApi.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

// ===== AUTH =====
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/auth/update-password', { currentPassword, newPassword }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ===== USERS =====
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getMyStudents: (params) => api.get('/users/students/my-class', { params }),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: (ids) => api.put('/users/notifications/read', { ids }),
  updatePhoto: (id, formData) => api.put(`/users/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ===== ATTENDANCE =====
export const attendanceAPI = {
  startSession: (data) => api.post('/attendance/sessions/start', data),
  endSession: (sessionId) => api.put(`/attendance/sessions/${sessionId}/end`),
  getActiveSessions: () => api.get('/attendance/sessions/active'),
  getSessions: (params) => api.get('/attendance/sessions', { params }),
  getSessionRecords: (sessionId) => api.get(`/attendance/sessions/${sessionId}/records`),
  markAttendance: (data) => api.post('/attendance/mark', data),
  bulkMark: (data) => api.post('/attendance/bulk-mark', data),
  qrScan: (sessionCode) => api.post('/attendance/qr-scan', { sessionCode }),
  getStudentAttendance: (studentId, params) =>
    api.get(`/attendance/student/${studentId}`, { params }),
  getStudentSummary: (studentId) =>
    api.get(`/attendance/student/${studentId}/summary`),
  getDeptAnalytics: (params) => api.get('/attendance/analytics/department', { params }),
  getAtRisk: (threshold) =>
    api.get('/attendance/analytics/at-risk', { params: { threshold } }),
};

// ===== DEPARTMENTS & COURSES =====
export const deptAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// ===== TIMETABLE =====
export const timetableAPI = {
  getAll: (params) => api.get('/timetable', { params }),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
};

// ===== DEVICES =====
export const devicesAPI = {
  getAll: () => api.get('/devices'),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  ping: (id) => api.post(`/devices/${id}/ping`),
};

// ===== REPORTS =====
export const reportsAPI = {
  getStudentPDF: (studentId) =>
    api.get(`/reports/student/${studentId}/pdf`, { responseType: 'blob' }),
  getExcel: (params) =>
    api.get('/reports/excel', { params, responseType: 'blob' }),
  getSummary: (params) => api.get('/reports/summary', { params }),
};

// ===== AI SERVICE =====
export const faceAPI = {
  health: () => aiApi.get('/health'),
  getStatus: () => aiApi.get('/status'),
  registerFace: (studentId, formData) =>
    aiApi.post(`/register/${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  registerFaceBase64: (studentId, base64Frame) =>
    aiApi.post(`/register/${studentId}`, { frame: base64Frame }),
  deleteFace: (studentId) => aiApi.delete(`/register/${studentId}`),
  recognize: (formData) => aiApi.post('/recognize', formData),
  recognizeBase64: (sessionId, base64Frame, alreadyMarked = []) =>
    aiApi.post('/recognize/stream', {
      sessionId,
      frame: base64Frame,
      alreadyMarked
    }),
  livenessCheck: (formData) => aiApi.post('/liveness', formData),
  reloadCache: () => aiApi.post('/reload-cache'),
};

// ===== HELPERS =====
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
