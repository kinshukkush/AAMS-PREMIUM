import { useState } from 'react';
import { useAuth, apiClient } from '../context/AuthContext';
import { User, Mail, Lock, Save, CheckCircle2, AlertCircle, Key, Shield } from 'lucide-react';
import { PageHeader } from '../components/common/CommonComponents';

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

        {/* ── Profile Card ── */}
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

          {/* Current identity badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 20,
          }}>
            <Shield size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user?.enrollmentId}</strong>
              {' — '}
              <span className="badge" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>{roleLabel}</span>
            </span>
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

      </div>
    </div>
  );
}
