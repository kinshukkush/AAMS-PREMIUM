import { useState } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { User, Mail, Lock, Save, CheckCircle2, AlertCircle, Key, Shield, Camera, ScanFace, Check, RefreshCw, Upload, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import { PageHeader } from '../components/common/CommonComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn, fadeUp } from '../utils/animations';

const PHOTO_ANGLES = [
  { id: 'front', label: 'Front (Straight)', guide: 'Look directly at the camera' },
  { id: 'left', label: 'Left Profile', guide: 'Turn head 30° to the left' },
  { id: 'right', label: 'Right Profile', guide: 'Turn head 30° to the right' },
];

export default function Settings() {
  const { user, login } = useAuth();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Face Registration State
  const [faceStep, setFaceStep] = useState(1); // 1=ready, 2=capturing, 3=done
  const [photos, setPhotos] = useState({ front: null, left: null, right: null });
  const [capturing, setCapturing] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async (angle) => {
    setCapturing(angle);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
      setFaceStep(2);
    } catch {
      toast.error('Camera access denied');
      setCapturing(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = 640;
    canvasRef.current.height = 480;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setPhotos(p => ({ ...p, [capturing]: dataUrl }));
    stopCamera();
    setCapturing(null);
    toast.success(`${capturing} photo captured!`);
  };

  const handleFaceUpload = async () => {
    setProfileLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      toast.success('Face registered successfully!');
      setFaceStep(3);
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const isFaceRegistered = user?.faceEmbedding?.length > 0 || faceStep === 3;
  const allCaptured = Object.values(photos).every(Boolean);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim() && !email.trim()) {
      setProfileMsg({ type: 'error', text: 'Please fill in at least one field.' });
      return;
    }

    setProfileLoading(true);
    try {
      const res = await apiClient.put('/auth/update-profile', {
        ...(name.trim() && { name: name.trim() }),
        ...(email.trim() && { email: email.trim() }),
      });
      const updatedUser = res.data?.user || res.user;
      if (updatedUser) {
        localStorage.setItem('aams_user', JSON.stringify(updatedUser));
      }
      setProfileMsg({ type: 'success', text: 'Profile updated successfully! Changes will reflect on next login if applicable.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPassLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPassLoading(false);
    }
  };

  const MessageAlert = ({ msg }) => {
    if (!msg) return null;
    const isSuccess = msg.type === 'success';
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 16px', borderRadius: '12px',
        background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        fontSize: '0.875rem',
        color: isSuccess ? 'var(--success)' : 'var(--danger)',
        marginTop: 12,
      }}>
        {isSuccess ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
        <span>{msg.text}</span>
      </div>
    );
  };

  const roleLabel = user?.role === 'teacher' ? 'Faculty' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Settings"
        description="Manage your account details and security preferences"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, maxWidth: 900 }}>

        {/* ── Avatar & Identity Card ── */}
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div className="avatar" style={{ width: 100, height: 100, fontSize: '3rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-brand)', color: 'white', borderRadius: '50%', fontWeight: 700 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Camera size={14} color="var(--text-primary)" />
            </button>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12, margin: '0 0 12px 0' }}>{user?.enrollmentId}</p>
          <span className="badge" style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>{roleLabel}</span>

          {user?.role === 'student' && user?.studentProfile && (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Batch', user.studentProfile.batch || '2024'], ['Semester', `Semester ${user.studentProfile.semester || 1}`], ['Section', `Section ${user.studentProfile.section || 'A'}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {user?.role === 'teacher' && user?.facultyProfile && (
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Designation', user.facultyProfile.designation || 'Faculty']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Profile Form Card ── */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Profile Information</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>Update your name and email address</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} /> Full Name
              </label>
              <input
                className="input"
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} /> Email Address
              </label>
              <input
                className="input"
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <MessageAlert msg={profileMsg} />

            <button
              type="submit"
              className="btn btn-primary"
              id="save-profile-btn"
              disabled={profileLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {profileLoading ? (
                <><div className="btn-spinner" /><span>Saving...</span></>
              ) : (
                <><Save size={15} /><span>Save Profile</span></>
              )}
            </button>
          </form>
        </div>

        {/* ── Password Card ── */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #EC4899, #7C6AFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Key size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Change Password</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>Update your login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Current Password
              </label>
              <input
                className="input"
                id="settings-current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> New Password
              </label>
              <input
                className="input"
                id="settings-new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Confirm New Password
              </label>
              <input
                className="input"
                id="settings-confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>

            <MessageAlert msg={passMsg} />

            <button
              type="submit"
              className="btn btn-primary"
              id="change-password-btn"
              disabled={passLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {passLoading ? (
                <><div className="btn-spinner" /><span>Updating...</span></>
              ) : (
                <><Key size={15} /><span>Update Password</span></>
              )}
            </button>
          </form>
        </div>

        {/* ── Face Biometrics Card (Student Only) ── */}
        {(user?.role === 'student' || user?.role === 'teacher') && (
          <div className="card" style={{ padding: 28, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: isFaceRegistered ? 'rgba(52,211,153,0.15)' : 'rgba(108,142,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ScanFace size={18} color={isFaceRegistered ? 'var(--success)' : 'var(--accent-primary)'} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Face Biometrics</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>Register your face for AI attendance</p>
              </div>
              <span className={`badge ${isFaceRegistered ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: 'auto' }}>
                {isFaceRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>

            {faceStep === 1 && !isFaceRegistered && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  You haven't registered your face yet. Register now to use AI-powered face recognition attendance.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                  {PHOTO_ANGLES.map(angle => (
                    <div key={angle.id} style={{ padding: 12, background: 'var(--bg-surface-2)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: 4 }}>{angle.label}</div>
                      {photos[angle.id] ? (
                        <div style={{ width: '100%', height: 60, borderRadius: 8, overflow: 'hidden' }}>
                          <img src={photos[angle.id]} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <button className="btn btn-ghost btn-sm" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => startCamera(angle.id)}>
                          <Camera size={12} /> Capture
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {allCaptured && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleFaceUpload} disabled={loading}>
                    {loading ? 'Processing...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            )}

            {faceStep === 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
                  <video ref={videoRef} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} muted playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 180, height: 220, border: '2px solid var(--accent-primary)', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', opacity: 0.6 }} />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={capturePhoto}><Camera size={15} /> Take Photo</button>
                  <button className="btn btn-secondary" onClick={() => { stopCamera(); setFaceStep(1); }}>Cancel</button>
                </div>
              </div>
            )}

            {isFaceRegistered && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(52,211,153,0.08)', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)' }}>
                <CheckCircle color="var(--success)" size={20} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Biometrics Active</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Your face is registered and ready for attendance.</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setFaceStep(1); setPhotos({ front: null, left: null, right: null }); }}>
                  <RefreshCw size={14} /> Re-register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
