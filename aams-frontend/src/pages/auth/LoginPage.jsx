import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, GraduationCap, Mail, Lock, ChevronRight,
  Users, Shield, User, Heart, ScanFace, BarChart2, Bell, CheckCircle
} from 'lucide-react';
import { fadeUp, scaleIn, stagger, slideRight } from '../../utils/animations';

const TESTIMONIALS = [
  { quote: "AAMS cut our manual attendance work by 90%. Face recognition is incredibly accurate.", author: "Dr. Priya Sharma", role: "Head of CSE" },
  { quote: "The real-time analytics help me identify at-risk students before it's too late.", author: "Prof. Arjun Mehta", role: "Faculty, Mathematics" },
  { quote: "As a parent, getting instant alerts when my child misses class gives me peace of mind.", author: "Mrs. Kavita Patel", role: "Parent" },
];

const FEATURES = [
  { icon: ScanFace, label: "Face Recognition Attendance", color: "#6C8EFF" },
  { icon: BarChart2, label: "Real-time Analytics", color: "#A78BFA" },
  { icon: Bell, label: "Smart Notifications", color: "#34D399" },
];

const ROLES = [
  { id: 'student', label: 'Student', icon: User, desc: 'Access your attendance & schedule', gradient: 'linear-gradient(135deg,#6C8EFF,#60A5FA)' },
  { id: 'faculty', label: 'Faculty', icon: Users, desc: 'Mark & manage attendance', gradient: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full system management', gradient: 'linear-gradient(135deg,#F87171,#EC4899)' },
  { id: 'parent', label: 'Parent', icon: Heart, desc: 'Monitor your child\'s attendance', gradient: 'linear-gradient(135deg,#34D399,#059669)' },
];

export default function LoginPage() {
  const [tab, setTab]                   = useState('login'); // 'login' | 'register'
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [name, setName]                 = useState('');
  const [selectedRole, setRole]         = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [fieldError, setFieldError]     = useState({});
  const [forgotOpen, setForgotOpen]     = useState(false);
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotSent, setForgotSent]     = useState(false);
  const [tIdx, setTIdx]                 = useState(0);
  const [shaking, setShaking]           = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  /* Rotate testimonials */
  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* Inline validation */
  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Minimum 6 characters';
    if (tab === 'register' && !name.trim()) errs.name = 'Name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldError(errs); triggerShake(); return; }
    setFieldError({});

    const result = await login(email, password);
    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    } else {
      setError(result.error || 'Invalid email or password');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="bg-mesh noise" style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── LEFT BRAND PANEL ── */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '60px 56px',
          position: 'relative', overflow: 'hidden',
          borderRight: '1px solid var(--border-subtle)',
        }}
        className="login-left-panel"
      >
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(108,142,255,0.12)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(167,139,250,0.10)', filter: 'blur(80px)' }} />
        </div>

        {/* Logo */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}
        >
          <div className="glow-pulse" style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(108,142,255,0.40)' }}>
            <GraduationCap size={26} color="white" />
          </div>
          <div>
            <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>AAMS</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Automated Attendance Management</div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: 'var(--text-primary)' }}>
            Smart Attendance<br />
            <span className="gradient-text">Powered by AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 400, marginBottom: 40 }}>
            Face recognition, QR scanning, and real-time analytics — built for modern educational institutions.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 48 }}
        >
          {FEATURES.map((f, i) => (
            <motion.div variants={slideRight} custom={i} key={f.label}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={18} color={f.color} />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.label}</span>
              <CheckCircle size={16} color="var(--success)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 28 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 12 }}>
                "{TESTIMONIALS[tIdx].quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                  {TESTIMONIALS[tIdx].author[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{TESTIMONIALS[tIdx].author}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{TESTIMONIALS[tIdx].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTIdx(i)} style={{ width: i === tIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === tIdx ? 'var(--accent-primary)' : 'var(--border-default)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
          {[['12K+','Students'],['850+','Faculty'],['99.2%','Accuracy']].map(([v,l]) => (
            <div key={l}>
              <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{v}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', flexShrink: 0 }}
        className="login-right-panel"
      >
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 32, border: '1px solid var(--border-default)' }}>
            {['login','register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setFieldError({}); }}
                style={{
                  flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', borderRadius: 8,
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.25s',
                  background: tab === t ? 'var(--bg-surface)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
                  position: 'relative',
                }}
                id={`tab-${t}`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" style={{ position: 'absolute', bottom: 2, left: '20%', right: '20%', height: 2, background: 'var(--accent-primary)', borderRadius: 2 }} />
                )}
              </button>
            ))}
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
              {tab === 'login' ? 'Welcome back 👋' : 'Create account'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {tab === 'login' ? 'Sign in to access your AAMS dashboard' : 'Join AAMS to manage your attendance'}
            </p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            noValidate
          >
            {/* Name (register only) */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="input-group">
                    <label className="input-label" htmlFor="reg-name">Full Name</label>
                    <input
                      id="reg-name" className="input"
                      type="text" placeholder="Your full name"
                      value={name} onChange={e => { setName(e.target.value); setFieldError(f => ({ ...f, name: '' })); }}
                      style={fieldError.name ? { borderColor: 'var(--danger)' } : {}}
                      autoComplete="name"
                    />
                    {fieldError.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.name}</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  id="login-email" className="input"
                  type="email" placeholder="your@lpu.edu"
                  value={email} onChange={e => { setEmail(e.target.value); setFieldError(f => ({ ...f, email: '' })); }}
                  style={fieldError.email ? { borderColor: 'var(--danger)' } : {}}
                  autoComplete="email" autoFocus
                />
              </div>
              {fieldError.email && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.email}</span>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  id="login-password" className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={tab === 'login' ? 'Your password' : 'Min 6 characters'}
                  value={password} onChange={e => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: '' })); }}
                  style={{ paddingLeft: 40, paddingRight: 44, ...(fieldError.password ? { borderColor: 'var(--danger)' } : {}) }}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError.password && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.password}</span>}
            </div>

            {/* Register: Role Selector */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <label className="input-label">I am a</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {ROLES.map(r => (
                        <button
                          key={r.id} type="button" id={`role-${r.id}`}
                          onClick={() => setRole(r.id)}
                          style={{
                            padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                            border: selectedRole === r.id ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border-default)',
                            background: selectedRole === r.id ? 'rgba(108,142,255,0.08)' : 'var(--bg-elevated)',
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'all 0.15s', textAlign: 'left',
                          }}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <r.icon size={14} color="white" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{r.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password (login only) */}
            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button
                  type="button" onClick={() => setForgotOpen(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Forgot password inline expansion */}
            <AnimatePresence>
              {forgotOpen && tab === 'login' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: 16, marginTop: -8 }}
                >
                  {!forgotSent ? (
                    <form onSubmit={handleForgotSubmit} style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        type="email" placeholder="Enter your email"
                        value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">Send</button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.85rem' }}>
                      <CheckCircle size={16} /> Reset link sent! Check your email.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.30)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit" id="login-submit-btn"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, boxShadow: '0 4px 20px rgba(108,142,255,0.35)' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <span>{tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            {/* Google SSO */}
            <button
              type="button" id="google-sso-btn"
              onClick={() => alert('Google SSO — connect to OAuth provider')}
              style={{
                width: '100%', padding: '11px 20px', borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border-default)', background: 'var(--bg-elevated)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign {tab === 'login' ? 'in' : 'up'} with Google
            </button>
          </motion.form>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 24 }}>
            By continuing, you agree to AAMS{' '}
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Terms of Service</a>
          </p>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { width: 100% !important; padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
