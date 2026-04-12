// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../context/AuthContext';
// import {
//   Eye, EyeOff, GraduationCap, Mail, Lock, ChevronRight,
//   Users, Shield, User, Heart, ScanFace, BarChart2, Bell, CheckCircle
// } from 'lucide-react';
// import { fadeUp, scaleIn, stagger, slideRight } from '../../utils/animations';

// const TESTIMONIALS = [
//   { quote: "AAMS cut our manual attendance work by 90%. Face recognition is incredibly accurate.", author: "Dr. Priya Sharma", role: "Head of CSE" },
//   { quote: "The real-time analytics help me identify at-risk students before it's too late.", author: "Prof. Arjun Mehta", role: "Faculty, Mathematics" },
//   { quote: "As a parent, getting instant alerts when my child misses class gives me peace of mind.", author: "Mrs. Kavita Patel", role: "Parent" },
// ];

// const FEATURES = [
//   { icon: ScanFace, label: "Face Recognition Attendance", color: "#6C8EFF" },
//   { icon: BarChart2, label: "Real-time Analytics", color: "#A78BFA" },
//   { icon: Bell, label: "Smart Notifications", color: "#34D399" },
// ];

// const ROLES = [
//   { id: 'student', label: 'Student', icon: User, desc: 'Access your attendance & schedule', gradient: 'linear-gradient(135deg,#6C8EFF,#60A5FA)' },
//   { id: 'faculty', label: 'Faculty', icon: Users, desc: 'Mark & manage attendance', gradient: 'linear-gradient(135deg,#A78BFA,#7C3AED)' },
//   { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full system management', gradient: 'linear-gradient(135deg,#F87171,#EC4899)' },
//   { id: 'parent', label: 'Parent', icon: Heart, desc: 'Monitor your child\'s attendance', gradient: 'linear-gradient(135deg,#34D399,#059669)' },
// ];

// export default function LoginPage() {
//   const [tab, setTab]                   = useState('login'); // 'login' | 'register'
//   const [email, setEmail]               = useState('');
//   const [password, setPassword]         = useState('');
//   const [name, setName]                 = useState('');
//   const [selectedRole, setRole]         = useState('student');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError]               = useState('');
//   const [fieldError, setFieldError]     = useState({});
//   const [forgotOpen, setForgotOpen]     = useState(false);
//   const [forgotEmail, setForgotEmail]   = useState('');
//   const [forgotSent, setForgotSent]     = useState(false);
//   const [tIdx, setTIdx]                 = useState(0);
//   const [shaking, setShaking]           = useState(false);

//   const { login, loading } = useAuth();
//   const navigate = useNavigate();

//   /* Rotate testimonials */
//   useEffect(() => {
//     const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
//     return () => clearInterval(t);
//   }, []);

//   /* Inline validation */
//   const validate = () => {
//     const errs = {};
//     if (!email) errs.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
//     if (!password) errs.password = 'Password is required';
//     else if (password.length < 6) errs.password = 'Minimum 6 characters';
//     if (tab === 'register' && !name.trim()) errs.name = 'Name is required';
//     return errs;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     const errs = validate();
//     if (Object.keys(errs).length) { setFieldError(errs); triggerShake(); return; }
//     setFieldError({});

//     const result = await login(email, password);
//     if (result.success) {
//       navigate(`/${result.role}/dashboard`);
//     } else {
//       setError(result.error || 'Invalid email or password');
//       triggerShake();
//     }
//   };

//   const triggerShake = () => {
//     setShaking(true);
//     setTimeout(() => setShaking(false), 500);
//   };

//   const handleForgotSubmit = (e) => {
//     e.preventDefault();
//     setForgotSent(true);
//   };

//   return (
//     <div className="bg-mesh noise" style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>

//       {/* ── LEFT BRAND PANEL ── */}
//       <motion.div
//         initial={{ x: -80, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
//         style={{
//           flex: 1, display: 'flex', flexDirection: 'column',
//           justifyContent: 'center', padding: '60px 56px',
//           position: 'relative', overflow: 'hidden',
//           borderRight: '1px solid var(--border-subtle)',
//         }}
//         className="login-left-panel"
//       >
//         {/* Background orbs */}
//         <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
//           <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(108,142,255,0.12)', filter: 'blur(80px)' }} />
//           <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(167,139,250,0.10)', filter: 'blur(80px)' }} />
//         </div>

//         {/* Logo */}
//         <motion.div
//           variants={fadeUp} initial="hidden" animate="visible"
//           style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}
//         >
//           <div className="glow-pulse" style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(108,142,255,0.40)' }}>
//             <GraduationCap size={26} color="white" />
//           </div>
//           <div>
//             <div className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1 }}>AAMS</div>
//             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Automated Attendance Management</div>
//           </div>
//         </motion.div>

//         {/* Headline */}
//         <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
//           <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.15, marginBottom: 20, color: 'var(--text-primary)' }}>
//             Smart Attendance<br />
//             <span className="gradient-text">Powered by AI</span>
//           </h1>
//           <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 400, marginBottom: 40 }}>
//             Face recognition, QR scanning, and real-time analytics — built for modern educational institutions.
//           </p>
//         </motion.div>

//         {/* Feature pills */}
//         <motion.div
//           variants={stagger} initial="hidden" animate="visible"
//           style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 48 }}
//         >
//           {FEATURES.map((f, i) => (
//             <motion.div variants={slideRight} custom={i} key={f.label}
//               style={{ display: 'flex', alignItems: 'center', gap: 12 }}
//             >
//               <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                 <f.icon size={18} color={f.color} />
//               </div>
//               <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.label}</span>
//               <CheckCircle size={16} color="var(--success)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Testimonial */}
//         <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 28 }}>
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={tIdx}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.4 }}
//             >
//               <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 12 }}>
//                 "{TESTIMONIALS[tIdx].quote}"
//               </p>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
//                   {TESTIMONIALS[tIdx].author[0]}
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{TESTIMONIALS[tIdx].author}</div>
//                   <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{TESTIMONIALS[tIdx].role}</div>
//                 </div>
//               </div>
//             </motion.div>
//           </AnimatePresence>

//           {/* Dots */}
//           <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
//             {TESTIMONIALS.map((_, i) => (
//               <button key={i} onClick={() => setTIdx(i)} style={{ width: i === tIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === tIdx ? 'var(--accent-primary)' : 'var(--border-default)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} aria-label={`Testimonial ${i + 1}`} />
//             ))}
//           </div>
//         </div>

//         {/* Stats row */}
//         <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
//           {[['12K+','Students'],['850+','Faculty'],['99.2%','Accuracy']].map(([v,l]) => (
//             <div key={l}>
//               <div className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{v}</div>
//               <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
//             </div>
//           ))}
//         </div>
//       </motion.div>

//       {/* ── RIGHT FORM PANEL ── */}
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
//         style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', flexShrink: 0 }}
//         className="login-right-panel"
//       >
//         <div style={{ width: '100%', maxWidth: 380 }}>

//           {/* Tab switcher */}
//           <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 32, border: '1px solid var(--border-default)' }}>
//             {['login','register'].map(t => (
//               <button
//                 key={t}
//                 onClick={() => { setTab(t); setError(''); setFieldError({}); }}
//                 style={{
//                   flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', borderRadius: 8,
//                   fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
//                   transition: 'all 0.25s',
//                   background: tab === t ? 'var(--bg-surface)' : 'transparent',
//                   color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
//                   boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
//                   position: 'relative',
//                 }}
//                 id={`tab-${t}`}
//               >
//                 {t === 'login' ? 'Sign In' : 'Register'}
//                 {tab === t && (
//                   <motion.div layoutId="tab-indicator" style={{ position: 'absolute', bottom: 2, left: '20%', right: '20%', height: 2, background: 'var(--accent-primary)', borderRadius: 2 }} />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Header */}
//           <div style={{ marginBottom: 28 }}>
//             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
//               {tab === 'login' ? 'Welcome back 👋' : 'Create account'}
//             </h2>
//             <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
//               {tab === 'login' ? 'Sign in to access your AAMS dashboard' : 'Join AAMS to manage your attendance'}
//             </p>
//           </div>

//           {/* Form */}
//           <motion.form
//             onSubmit={handleSubmit}
//             animate={shaking ? { x: [0, -10, 10, -10, 10, 0] } : {}}
//             transition={{ duration: 0.4 }}
//             style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
//             noValidate
//           >
//             {/* Name (register only) */}
//             <AnimatePresence>
//               {tab === 'register' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.25 }}
//                 >
//                   <div className="input-group">
//                     <label className="input-label" htmlFor="reg-name">Full Name</label>
//                     <input
//                       id="reg-name" className="input"
//                       type="text" placeholder="Your full name"
//                       value={name} onChange={e => { setName(e.target.value); setFieldError(f => ({ ...f, name: '' })); }}
//                       style={fieldError.name ? { borderColor: 'var(--danger)' } : {}}
//                       autoComplete="name"
//                     />
//                     {fieldError.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.name}</span>}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Email */}
//             <div className="input-group">
//               <label className="input-label" htmlFor="login-email">Email Address</label>
//               <div className="input-with-icon">
//                 <Mail className="input-icon" size={16} />
//                 <input
//                   id="login-email" className="input"
//                   type="email" placeholder="your@lpu.edu"
//                   value={email} onChange={e => { setEmail(e.target.value); setFieldError(f => ({ ...f, email: '' })); }}
//                   style={fieldError.email ? { borderColor: 'var(--danger)' } : {}}
//                   autoComplete="email" autoFocus
//                 />
//               </div>
//               {fieldError.email && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.email}</span>}
//             </div>

//             {/* Password */}
//             <div className="input-group">
//               <label className="input-label" htmlFor="login-password">Password</label>
//               <div className="input-with-icon">
//                 <Lock className="input-icon" size={16} />
//                 <input
//                   id="login-password" className="input"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder={tab === 'login' ? 'Your password' : 'Min 6 characters'}
//                   value={password} onChange={e => { setPassword(e.target.value); setFieldError(f => ({ ...f, password: '' })); }}
//                   style={{ paddingLeft: 40, paddingRight: 44, ...(fieldError.password ? { borderColor: 'var(--danger)' } : {}) }}
//                   autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
//                 />
//                 <button
//                   type="button" onClick={() => setShowPassword(s => !s)}
//                   style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//               {fieldError.password && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError.password}</span>}
//             </div>

//             {/* Register: Role Selector */}
//             <AnimatePresence>
//               {tab === 'register' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <div className="input-group">
//                     <label className="input-label">I am a</label>
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
//                       {ROLES.map(r => (
//                         <button
//                           key={r.id} type="button" id={`role-${r.id}`}
//                           onClick={() => setRole(r.id)}
//                           style={{
//                             padding: '10px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
//                             border: selectedRole === r.id ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border-default)',
//                             background: selectedRole === r.id ? 'rgba(108,142,255,0.08)' : 'var(--bg-elevated)',
//                             display: 'flex', alignItems: 'center', gap: 8,
//                             transition: 'all 0.15s', textAlign: 'left',
//                           }}
//                         >
//                           <div style={{ width: 28, height: 28, borderRadius: 8, background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                             <r.icon size={14} color="white" />
//                           </div>
//                           <div>
//                             <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</div>
//                             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{r.desc}</div>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Forgot password (login only) */}
//             {tab === 'login' && (
//               <div style={{ textAlign: 'right', marginTop: -4 }}>
//                 <button
//                   type="button" onClick={() => setForgotOpen(o => !o)}
//                   style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500 }}
//                 >
//                   Forgot password?
//                 </button>
//               </div>
//             )}

//             {/* Forgot password inline expansion */}
//             <AnimatePresence>
//               {forgotOpen && tab === 'login' && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: 16, marginTop: -8 }}
//                 >
//                   {!forgotSent ? (
//                     <form onSubmit={handleForgotSubmit} style={{ display: 'flex', gap: 8 }}>
//                       <input
//                         className="input"
//                         type="email" placeholder="Enter your email"
//                         value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
//                         style={{ flex: 1, fontSize: '0.85rem' }}
//                       />
//                       <button type="submit" className="btn btn-primary btn-sm">Send</button>
//                     </form>
//                   ) : (
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.85rem' }}>
//                       <CheckCircle size={16} /> Reset link sent! Check your email.
//                     </div>
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Error */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
//                 style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.30)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}
//               >
//                 ⚠️ {error}
//               </motion.div>
//             )}

//             {/* Submit */}
//             <button
//               type="submit" id="login-submit-btn"
//               className="btn btn-primary btn-lg"
//               style={{ width: '100%', justifyContent: 'center', marginTop: 4, boxShadow: '0 4px 20px rgba(108,142,255,0.35)' }}
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
//                   <span>{tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
//                 </>
//               ) : (
//                 <>
//                   <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
//                   <ChevronRight size={18} />
//                 </>
//               )}
//             </button>

//             {/* Divider */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
//               <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
//               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or continue with</span>
//               <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
//             </div>

//             {/* Google SSO */}
//             <button
//               type="button" id="google-sso-btn"
//               onClick={() => alert('Google SSO — connect to OAuth provider')}
//               style={{
//                 width: '100%', padding: '11px 20px', borderRadius: 'var(--r-md)',
//                 border: '1.5px solid var(--border-default)', background: 'var(--bg-elevated)',
//                 cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
//                 color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500,
//                 transition: 'all 0.15s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
//               onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
//               Sign {tab === 'login' ? 'in' : 'up'} with Google
//             </button>
//           </motion.form>

//           <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 24 }}>
//             By continuing, you agree to AAMS{' '}
//             <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Terms of Service</a>
//           </p>
//         </div>
//       </motion.div>

//       <style>{`
//         @media (max-width: 768px) {
//           .login-left-panel { display: none !important; }
//           .login-right-panel { width: 100% !important; padding: 32px 24px !important; }
//         }
//       `}</style>
//     </div>
//   );
// }











































import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Eye, EyeOff, GraduationCap, Mail, Lock, ChevronRight,
  Users, Shield, User, Heart, ScanFace, BarChart2, Bell,
  CheckCircle2, Sparkles, ArrowRight, Zap, Stars,
} from 'lucide-react';
import { fadeUp, scaleIn, stagger, slideRight } from '../../utils/animations';

const TESTIMONIALS = [
  {
    quote: 'AAMS reduced our manual attendance workload by 90%. The face recognition workflow feels effortless.',
    author: 'Dr. Priya Sharma',
    role: 'Head of CSE',
  },
  {
    quote: 'The real-time analytics make it easy to identify attendance risks before students fall behind.',
    author: 'Prof. Arjun Mehta',
    role: 'Faculty, Mathematics',
  },
  {
    quote: 'Instant alerts help me stay informed about my child’s attendance without constant follow-up.',
    author: 'Mrs. Kavita Patel',
    role: 'Parent',
  },
];

const FEATURES = [
  { icon: ScanFace, label: 'Face Recognition Attendance', color: '#7C6AFF' },
  { icon: BarChart2, label: 'Real-time Analytics Dashboard', color: '#06B6D4' },
  { icon: Bell, label: 'Smart Notification Engine', color: '#10B981' },
];

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: User,
    desc: 'Track attendance & daily schedule',
    gradient: 'linear-gradient(135deg,#06B6D4,#10B981)',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: Users,
    desc: 'Mark attendance & review class reports',
    gradient: 'linear-gradient(135deg,#7C6AFF,#06B6D4)',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    desc: 'Manage users, devices & analytics',
    gradient: 'linear-gradient(135deg,#EC4899,#7C6AFF)',
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: Heart,
    desc: 'Monitor child attendance updates',
    gradient: 'linear-gradient(135deg,#10B981,#06B6D4)',
  },
];

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@aams.demo', password: 'Admin@123', color: '#EC4899' },
  { role: 'Faculty', email: 'faculty@aams.demo', password: 'Faculty@123', color: '#7C6AFF' },
  { role: 'Student', email: 'student@aams.demo', password: 'Student@123', color: '#06B6D4' },
];

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 4 + (i % 4) * 2,
        top: `${(i * 13) % 100}%`,
        left: `${(i * 17) % 100}%`,
        duration: 8 + (i % 5),
        delay: i * 0.4,
        color: i % 3 === 0 ? 'rgba(124,106,255,0.35)' : i % 3 === 1 ? 'rgba(6,182,212,0.30)' : 'rgba(236,72,153,0.22)',
      })),
    []
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ opacity: 0.15, y: 0, x: 0 }}
          animate={{
            opacity: [0.15, 0.7, 0.25],
            y: [0, -40, 0],
            x: [0, 16, -8, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            top: particle.top,
            left: particle.left,
            borderRadius: '50%',
            background: particle.color,
            boxShadow: `0 0 18px ${particle.color}`,
            filter: 'blur(0.2px)',
          }}
        />
      ))}
    </div>
  );
}

function OrbitRings() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 460,
          height: 460,
          borderRadius: '50%',
          border: '1px solid rgba(124,106,255,0.08)',
          top: '50%',
          left: '18%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: '50%',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#7C6AFF',
            boxShadow: '0 0 14px rgba(124,106,255,0.8)',
          }}
        />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '1px solid rgba(6,182,212,0.08)',
          top: '55%',
          left: '20%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#06B6D4',
            boxShadow: '0 0 14px rgba(6,182,212,0.8)',
          }}
        />
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [shaking, setShaking] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const validate = () => {
    const errors = {};
    if (tab === 'register' && !name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldError(errors);
      triggerShake();
      return;
    }

    setFieldError({});
    const result = await login(email, password);

    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    } else {
      setError(result.error || 'Invalid email or password');
      triggerShake();
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setFieldError({});
    setTab('login');
  };

  return (
    <div
      className="bg-mesh noise particles-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        background:
          'radial-gradient(circle at top left, rgba(124,106,255,0.10), transparent 35%), radial-gradient(circle at bottom right, rgba(6,182,212,0.08), transparent 35%), var(--bg-base)',
      }}
    >
      <FloatingParticles />
      <OrbitRings />

      {/* Left Brand Panel */}
      <motion.section
        initial={{ x: -70, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="login-left-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '56px 58px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid var(--border-subtle)',
          zIndex: 1,
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            className="orb orb-purple"
            style={{ top: '-12%', left: '-10%', width: 420, height: 420 }}
          />
          <div
            className="orb orb-cyan"
            style={{ bottom: '-12%', right: '-12%', width: 360, height: 360 }}
          />
          <div
            className="orb orb-pink"
            style={{ top: '35%', right: '15%', width: 180, height: 180 }}
          />
        </div>

        {/* Logo */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52, position: 'relative', zIndex: 2 }}
        >
          <motion.div
            className="glow-pulse"
            whileHover={{ scale: 1.06, rotate: 6 }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'linear-gradient(135deg,#7C6AFF,#06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(124,106,255,0.35)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), transparent 60%)',
              }}
            />
            <GraduationCap size={28} color="white" />
          </motion.div>

          <div>
            <div
              className="gradient-text"
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              AAMS
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Premium AI Attendance Platform
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fadeUp}
          custom={1}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div
            className="badge badge-info"
            style={{
              marginBottom: 20,
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(124,106,255,0.10)',
              border: '1px solid rgba(124,106,255,0.20)',
              width: 'fit-content',
            }}
          >
            <Sparkles size={13} />
            AI-Powered Campus Intelligence
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.1rem',
              fontWeight: 800,
              lineHeight: 1.06,
              marginBottom: 18,
              color: 'var(--text-primary)',
              letterSpacing: '-0.04em',
              maxWidth: 620,
            }}
          >
            Reimagine attendance with
            <br />
            <span className="gradient-text text-glow">premium AI workflows</span>
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.85,
              maxWidth: 520,
              marginBottom: 34,
            }}
          >
            Face recognition, QR attendance, real-time analytics, smart alerts, and premium dashboards —
            all in one smooth, modern system built for institutions that move fast.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gap: 14,
            marginBottom: 36,
            maxWidth: 540,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.label}
              variants={slideRight}
              custom={index}
              whileHover={{ x: 4, scale: 1.01 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: '18px',
                background: 'rgba(13,13,26,0.62)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${feature.color}18`,
                  border: `1px solid ${feature.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 16px ${feature.color}22`,
                }}
              >
                <feature.icon size={18} color={feature.color} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                  {feature.label}
                </div>
              </div>

              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            marginBottom: 34,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {[
            ['12K+', 'Students'],
            ['850+', 'Faculty'],
            ['99.2%', 'Accuracy'],
          ].map(([value, label]) => (
            <div
              key={label}
              style={{
                minWidth: 132,
                padding: '14px 16px',
                borderRadius: '18px',
                background: 'rgba(13,13,26,0.62)',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div
                className="gradient-text"
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 560,
            padding: '22px 22px 18px',
            borderRadius: '22px',
            background: 'rgba(13,13,26,0.62)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 10px 34px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Stars size={15} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              What users say
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  fontSize: '0.92rem',
                  lineHeight: 1.8,
                  marginBottom: 14,
                }}
              >
                “{TESTIMONIALS[testimonialIndex].quote}”
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--gradient-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    boxShadow: 'var(--glow-accent)',
                  }}
                >
                  {TESTIMONIALS[testimonialIndex].author[0]}
                </div>

                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {TESTIMONIALS[testimonialIndex].author}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {TESTIMONIALS[testimonialIndex].role}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setTestimonialIndex(index)}
                aria-label={`Show testimonial ${index + 1}`}
                style={{
                  width: index === testimonialIndex ? 22 : 7,
                  height: 7,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: index === testimonialIndex ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.25s ease',
                  boxShadow: index === testimonialIndex ? 'var(--glow-accent)' : 'none',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Right Form Panel */}
      <motion.section
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="login-right-panel"
        style={{
          width: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '36px 44px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          style={{
            width: '100%',
            maxWidth: 390,
            padding: '26px 24px',
            borderRadius: '28px',
            background: 'rgba(13,13,26,0.78)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 18px 60px rgba(0,0,0,0.45), 0 0 30px rgba(124,106,255,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* top gradient line */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 1,
              background: 'var(--gradient-brand)',
            }}
          />

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: 4,
              marginBottom: 26,
              border: '1px solid var(--border-default)',
            }}
          >
            {['login', 'register'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTab(item);
                  setError('');
                  setFieldError({});
                  setForgotOpen(false);
                  setForgotSent(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 12,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: 'transparent',
                  color: tab === item ? 'var(--text-primary)' : 'var(--text-muted)',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                }}
              >
                {item === 'login' ? 'Sign In' : 'Register'}
                {tab === item && (
                  <motion.div
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 12,
                      background: 'rgba(124,106,255,0.12)',
                      border: '1px solid rgba(124,106,255,0.18)',
                      boxShadow: '0 8px 20px rgba(124,106,255,0.10)',
                      zIndex: -1,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <div
              className="badge badge-info"
              style={{
                marginBottom: 12,
                width: 'fit-content',
                padding: '6px 12px',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.18)',
              }}
            >
              <Zap size={12} />
              Secure access
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.7rem',
                fontWeight: 800,
                marginBottom: 6,
                letterSpacing: '-0.03em',
              }}
            >
              {tab === 'login' ? 'Welcome back 👋' : 'Create your account'}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {tab === 'login'
                ? 'Sign in to continue to your premium AAMS workspace.'
                : 'Start with a beautiful, modern attendance management experience.'}
            </p>
          </div>

          {/* Demo Accounts */}
          {tab === 'login' && (
            <div
              style={{
                marginBottom: 18,
                padding: '14px 14px 12px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Demo Accounts
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {DEMO_ACCOUNTS.map((account) => (
                  <motion.button
                    key={account.role}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => fillDemo(account)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: '14px',
                      background: 'rgba(13,13,26,0.65)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: account.color,
                          boxShadow: `0 0 10px ${account.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{account.role}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {account.email}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            noValidate
          >
            {/* Name */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="input-group">
                    <div className="floating-label-group">
                      <input
                        id="reg-name"
                        className={`input ${fieldError.name ? 'input-error' : ''}`}
                        type="text"
                        placeholder=" "
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setFieldError((prev) => ({ ...prev, name: '' }));
                        }}
                        autoComplete="name"
                      />
                      <label htmlFor="reg-name">Full Name</label>
                    </div>
                    {fieldError.name && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--danger)' }}>{fieldError.name}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="input-group">
              <div className="floating-label-group input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  id="login-email"
                  className={`input ${fieldError.email ? 'input-error' : ''}`}
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldError((prev) => ({ ...prev, email: '' }));
                  }}
                  autoComplete="email"
                  autoFocus
                />
                <label htmlFor="login-email" style={{ left: 42 }}>Email Address</label>
              </div>
              {fieldError.email && (
                <span style={{ fontSize: '0.74rem', color: 'var(--danger)' }}>{fieldError.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="input-group">
              <div className="floating-label-group input-with-icon">
                <Lock className="input-icon" size={16} />
                <input
                  id="login-password"
                  className={`input ${fieldError.password ? 'input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldError((prev) => ({ ...prev, password: '' }));
                  }}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: 44 }}
                />
                <label htmlFor="login-password" style={{ left: 42 }}>Password</label>

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError.password && (
                <span style={{ fontSize: '0.74rem', color: 'var(--danger)' }}>{fieldError.password}</span>
              )}
            </div>

            {/* Register role selection */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="input-group">
                    <label className="input-label">Select Role</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {ROLES.map((role) => (
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          style={{
                            padding: '11px 12px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border:
                              selectedRole === role.id
                                ? '1.5px solid var(--border-accent)'
                                : '1.5px solid var(--border-default)',
                            background:
                              selectedRole === role.id
                                ? 'rgba(124,106,255,0.08)'
                                : 'rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            transition: 'all 0.18s ease',
                            textAlign: 'left',
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 10,
                              background: role.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: selectedRole === role.id ? '0 0 18px rgba(124,106,255,0.18)' : 'none',
                            }}
                          >
                            <role.icon size={14} color="white" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {role.label}
                            </div>
                            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                              {role.desc}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password */}
            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -2 }}>
                <button
                  type="button"
                  onClick={() => setForgotOpen((prev) => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent-primary)',
                    fontSize: '0.79rem',
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Forgot password panel */}
            <AnimatePresence>
              {forgotOpen && tab === 'login' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '16px',
                    padding: 14,
                    marginTop: -2,
                  }}
                >
                  {!forgotSent ? (
                    <form onSubmit={handleForgotSubmit} style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        type="email"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        Send
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.84rem', fontWeight: 500 }}>
                      <CheckCircle2 size={16} />
                      Reset link sent! Please check your inbox.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    background: 'rgba(239,68,68,0.10)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '16px',
                    padding: '11px 13px',
                    fontSize: '0.84rem',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 4,
                boxShadow: '0 8px 30px rgba(124,106,255,0.35)',
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner" />
                  <span>{tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 2px' }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border-subtle))' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border-subtle), transparent)' }} />
            </div>

            {/* Google SSO */}
            <motion.button
              whileHover={{ y: -1, borderColor: 'var(--border-strong)' }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => alert('Google SSO — connect to OAuth provider')}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '16px',
                border: '1.5px solid var(--border-default)',
                background: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.18s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign {tab === 'login' ? 'in' : 'up'} with Google
            </motion.button>
          </motion.form>

          {/* Footer text */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              marginTop: 22,
              lineHeight: 1.7,
            }}
          >
            By continuing, you agree to AAMS{' '}
            <a href="#" style={{ color: 'var(--accent-primary)' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" style={{ color: 'var(--accent-primary)' }}>
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.section>

      <style>{`
        @media (max-width: 1024px) {
          .login-left-panel {
            padding: 44px 36px !important;
          }
        }

        @media (max-width: 768px) {
          .login-left-panel {
            display: none !important;
          }

          .login-right-panel {
            width: 100% !important;
            padding: 28px 18px !important;
          }
        }
      `}</style>
    </div>
  );
}