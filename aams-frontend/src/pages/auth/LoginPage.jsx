import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Sun, Moon, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-grid" />
      </div>
      <button className="theme-toggle-fab" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-icon"><GraduationCap size={28} color="white" /></div>
            <div>
              <h1>AAMS</h1>
              <p>Automated Attendance Management</p>
            </div>
          </div>
          <div className="login-hero-text">
            <h2>Smart Attendance<br />for Modern<br />Education</h2>
            <p>Face recognition, QR codes, and real-time analytics designed for Lovely Professional University.</p>
          </div>
          <div className="login-features">
            {['🎯 Face Recognition AI','📊 Real-time Analytics','📱 QR Code Attendance','🔔 Smart Notifications'].map(f => (
              <div key={f} className="login-feature-chip"><span>{f}</span></div>
            ))}
          </div>
          <div className="login-stats">
            {[['12K+','Students'],['850+','Faculty'],['99.2%','Accuracy']].map(([v,l]) => (
              <div key={l} className="login-stat"><strong>{v}</strong><span>{l}</span></div>
            ))}
          </div>
        </div>
        <div className="login-right">
          <div className="login-card animate-slideUp">
            <div className="login-card-header">
              <h3>Welcome Back</h3>
              <p>Sign in with your LPU credentials</p>
            </div>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input className="input" type="email" placeholder="your@lpu.edu"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: '44px' }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="login-forgot"><a href="#">Forgot password?</a></div>
              {error && <div className="login-error">⚠️ {error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
        .login-bg { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .login-bg-orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.15; }
        .orb-1 { width:600px; height:600px; background:#4F6EF7; top:-200px; left:-200px; }
        .orb-2 { width:500px; height:500px; background:#7C3AED; bottom:-150px; right:-150px; }
        .login-bg-grid { position:absolute; inset:0; background-image:linear-gradient(var(--border-color) 1px,transparent 1px),linear-gradient(90deg,var(--border-color) 1px,transparent 1px); background-size:40px 40px; opacity:0.4; }
        .theme-toggle-fab { position:fixed; top:20px; right:20px; width:42px; height:42px; border-radius:var(--radius-md); background:var(--bg-surface); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-secondary); box-shadow:var(--shadow-md); transition:all var(--transition-fast); z-index:100; }
        .theme-toggle-fab:hover { color:var(--brand-primary); border-color:var(--brand-primary); }
        .login-container { display:grid; grid-template-columns:1fr 1fr; max-width:960px; width:100%; margin:0 auto; padding:40px 24px; gap:60px; align-items:center; position:relative; z-index:1; }
        .login-left { display:flex; flex-direction:column; gap:28px; }
        .login-brand { display:flex; align-items:center; gap:14px; }
        .login-brand-icon { width:52px; height:52px; border-radius:var(--radius-lg); background:var(--gradient-brand); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(79,110,247,0.40); }
        .login-brand h1 { font-size:2rem; font-weight:800; line-height:1; background:var(--gradient-brand); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .login-brand p { font-size:0.8rem; color:var(--text-muted); }
        .login-hero-text h2 { font-size:2.8rem; font-weight:800; line-height:1.15; margin-bottom:16px; background:linear-gradient(135deg,var(--text-primary) 0%,var(--text-secondary) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .login-hero-text p { color:var(--text-secondary); line-height:1.7; font-size:0.95rem; }
        .login-features { display:flex; flex-wrap:wrap; gap:10px; }
        .login-feature-chip { display:flex; align-items:center; gap:7px; padding:7px 14px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-full); font-size:0.8rem; color:var(--text-secondary); box-shadow:var(--shadow-sm); }
        .login-stats { display:flex; gap:32px; }
        .login-stat { display:flex; flex-direction:column; gap:2px; }
        .login-stat strong { font-family:var(--font-display); font-size:1.8rem; font-weight:800; background:var(--gradient-brand); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .login-stat span { font-size:0.8rem; color:var(--text-muted); }
        .login-card { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:40px; box-shadow:var(--shadow-lg); }
        .login-card-header { margin-bottom:28px; }
        .login-card-header h3 { font-size:1.6rem; font-weight:800; margin-bottom:6px; }
        .login-card-header p { color:var(--text-muted); font-size:0.875rem; }
        .login-form { display:flex; flex-direction:column; gap:18px; }
        .login-forgot { text-align:right; }
        .login-forgot a { font-size:0.8rem; color:var(--brand-primary); text-decoration:none; }
        .login-forgot a:hover { text-decoration:underline; }
        .login-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:10px 14px; font-size:0.875rem; color:#EF4444; }
        .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
        @media (max-width:768px) { .login-container { grid-template-columns:1fr; gap:32px; padding:24px 16px; } .login-left { display:none; } }
      `}</style>
    </div>
  );
}
