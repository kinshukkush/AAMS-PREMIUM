import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, ScanFace, ClipboardList, Clock, Users, CheckCircle,
  Copy, Maximize2, RefreshCw, Camera, X, Check, Search, Filter
} from 'lucide-react';
import { fadeUp, scaleIn, stagger } from '../../utils/animations';
import toast from 'react-hot-toast';

const SESSION = { code: 'CSE-301-LIVE', course: 'Data Structures (CSE-301)', startTime: new Date(), total: 45 };

/* ─── QR Tab ─────────────────────────────────────────────────── */
function QRTab() {
  const [expiry, setExpiry] = useState(300); // 5 min countdown
  const [qrUrl] = useState(`https://aams.lpu.edu/attend/${SESSION.code}`);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (expiry <= 0) return;
    const t = setInterval(() => setExpiry(e => e - 1), 1000);
    return () => clearInterval(t);
  }, [expiry]);

  const pct = (expiry / 300) * 100;
  const radius = 58;
  const circ = 2 * Math.PI * radius;

  const handleCopy = () => { navigator.clipboard.writeText(qrUrl); toast.success('Link copied!'); };
  const handleRefreshQR = () => { setExpiry(300); toast.success('QR code refreshed'); };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, paddingTop: 16 }}>
      <motion.div variants={fadeUp} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Countdown ring */}
        <svg width={140} height={140} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth={4} />
          <circle cx={70} cy={70} r={radius} fill="none" strokeWidth={4}
            stroke={expiry > 60 ? '#6C8EFF' : expiry > 30 ? '#FBBF24' : '#F87171'}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>

        {/* QR Code placeholder */}
        <div style={{ width: 112, height: 112, background: 'white', borderRadius: 12, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 100" width="96" height="96">
            {/* Simplified QR pattern */}
            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => (
              <rect key={`${r}-${c}`} x={c*13+2} y={r*13+2} width={11} height={11}
                fill={(r<3&&c<3)||(r<3&&c>3&&c<7)||(r>3&&c<3)||(r===3&&c===3) ? '#0F1117' : 'transparent'} />
            )))}
          </svg>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: expiry > 60 ? 'var(--text-secondary)' : 'var(--danger)' }}>
          Expires in {Math.floor(expiry / 60)}:{String(expiry % 60).padStart(2, '0')}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Students scan with AAMS mobile app</div>
      </motion.div>

      <motion.div variants={fadeUp} custom={2} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button id="btn-copy-qr-link" className="btn btn-secondary" onClick={handleCopy}><Copy size={15} /> Copy Link</button>
        <button id="btn-refresh-qr" className="btn btn-secondary" onClick={handleRefreshQR}><RefreshCw size={15} /> Refresh QR</button>
        <button id="btn-fullscreen-qr" className="btn btn-primary" onClick={() => setFullscreen(true)}><Maximize2 size={15} /> Fullscreen</button>
      </motion.div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
              <X size={20} />
            </button>
            <div style={{ background: 'white', padding: 32, borderRadius: 20 }}>
              <div style={{ width: 240, height: 240, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={200} color="#0F1117" />
              </div>
            </div>
            <div style={{ marginTop: 24, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{SESSION.code}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Face Recognition Tab ───────────────────────────────────── */
function FaceTab() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive]     = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults]   = useState([]);
  const intervalRef             = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setActive(true);
      setScanning(true);
      intervalRef.current = setInterval(simulateScan, 2500);
    } catch {
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const simulateScan = () => {
    const names = ['Arjun Patel','Priya Singh','Rahul Mehta','Neha Gupta'];
    const conf = (88 + Math.random() * 11).toFixed(1);
    if (Math.random() > 0.3) {
      setResults(r => [{ name: names[Math.floor(Math.random()*names.length)], conf, time: new Date().toLocaleTimeString(), id: Date.now() }, ...r.slice(0, 9)]);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(false); setScanning(false);
  };

  useEffect(() => () => { stopCamera(); }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Camera panel */}
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>Camera Feed</h4>
        <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden' }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          {!active && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <Camera size={40} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Camera inactive</p>
            </div>
          )}
          {scanning && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Scan overlay */}
              <div style={{ position: 'absolute', top: '20%', left: '25%', right: '25%', bottom: '15%', border: '2.5px solid var(--accent-primary)', borderRadius: 12, boxShadow: '0 0 20px rgba(108,142,255,0.30)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'var(--accent-primary)', animation: 'scanLine 2s linear infinite', boxShadow: '0 0 8px var(--accent-primary)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
                <span style={{ background: 'rgba(108,142,255,0.20)', color: 'var(--accent-primary)', padding: '4px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>🔍 Scanning...</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          {!active
            ? <button id="btn-start-camera" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={startCamera}><Camera size={15} /> Start Camera</button>
            : <button id="btn-stop-camera" className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={stopCamera}><X size={15} /> Stop Camera</button>
          }
        </div>
      </motion.div>

      {/* Results */}
      <motion.div variants={fadeUp} custom={1} className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Recognized Students</h4>
          <span className="badge badge-info">{results.length} detected</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          <AnimatePresence>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <ScanFace size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>No faces detected yet</p>
              </div>
            ) : results.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.20)', borderRadius: 10 }}
              >
                <CheckCircle size={18} color="var(--success)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.time}</div>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)' }}>{r.conf}%</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      <style>{`@keyframes scanLine { from { top: 0 } to { top: calc(100% - 2px) } }`}</style>
    </motion.div>
  );
}

/* ─── Manual Tab ─────────────────────────────────────────────── */
function ManualTab() {
  const STUDENTS = Array.from({ length: 12 }, (_, i) => ({
    id: `STU${1000+i}`, name: ['Arjun Patel','Priya Singh','Rahul Mehta','Neha Gupta','Vikram Shah','Anjali Verma','Karan Joshi','Divya Nair','Ravi Kumar','Meera Nair','Amit Sharma','Zara Khan'][i],
    rollNo: `CSE-${i+1}`, present: null
  }));
  const [students, setStudents] = useState(STUDENTS);
  const [search, setSearch]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => setStudents(s => s.map(x => x.id === id ? { ...x, present: x.present === true ? null : true } : x));
  const markAll = (val) => setStudents(s => s.map(x => ({ ...x, present: val })));
  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    const unmarked = students.filter(s => s.present === null).length;
    if (unmarked > 0) { toast.error(`${unmarked} students still unmarked`); return; }
    setSubmitted(true);
    toast.success(`Attendance submitted! ${students.filter(s => s.present).length}/${students.length} present`);
  };

  const presentCount = students.filter(s => s.present === true).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {submitted ? (
        <motion.div variants={scaleIn} initial="hidden" animate="visible" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 20 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Attendance Submitted!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{presentCount} students marked present out of {students.length}</p>
          <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => setSubmitted(false)}>Mark Again</button>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
              <Search size={16} color="var(--text-muted)" />
              <input id="manual-search" type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button id="btn-mark-all-present" className="btn btn-success btn-sm" onClick={() => markAll(true)}>✓ All Present</button>
            <button id="btn-mark-all-absent" className="btn btn-danger btn-sm" onClick={() => markAll(false)}>✗ All Absent</button>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="glass-card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {filtered.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s', background: s.present === true ? 'rgba(52,211,153,0.06)' : s.present === false ? 'rgba(248,113,113,0.06)' : 'transparent' }}
                  onClick={() => toggle(s.id)}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                    {s.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.rollNo}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button id={`present-${s.id}`} onClick={e => { e.stopPropagation(); setStudents(st => st.map(x => x.id === s.id ? {...x, present: true} : x)); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: s.present === true ? 'var(--success)' : 'var(--bg-elevated)', color: s.present === true ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      Present
                    </button>
                    <button id={`absent-${s.id}`} onClick={e => { e.stopPropagation(); setStudents(st => st.map(x => x.id === s.id ? {...x, present: false} : x)); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: s.present === false ? 'var(--danger)' : 'var(--bg-elevated)', color: s.present === false ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {presentCount} present · {students.filter(s => s.present === false).length} absent · {students.filter(s => s.present === null).length} unmarked
            </span>
            <button id="btn-submit-manual" className="btn btn-primary" onClick={handleSubmit}><Check size={15} /> Submit Attendance</button>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MarkAttendance() {
  const [activeTab, setTab] = useState('qr');
  const [elapsed, setElapsed] = useState(0);
  const TABS = [
    { id: 'qr',   icon: QrCode,       label: 'QR Code' },
    { id: 'face', icon: ScanFace,      label: 'Face Recognition' },
    { id: 'manual',icon: ClipboardList,label: 'Manual' },
  ];

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtElapsed = `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;

  return (
    <div>
      {/* Session status banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 'var(--r-lg)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'glow-pulse 1.5s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700 }}>LIVE SESSION</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{SESSION.course}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 12 }}>Code: </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.78rem' }}>{SESSION.code}</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmtElapsed}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Elapsed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SESSION.total}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Students</div>
          </div>
        </div>
      </motion.div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mark Attendance</h1>
          <p>Choose your preferred method to record attendance</p>
        </div>
      </div>

      {/* Tab switcher */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible"
        style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 32, border: '1px solid var(--border-default)', width: 'fit-content', gap: 4 }}
      >
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} id={`tab-${t.id}`} onClick={() => setTab(t.id)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', background: activeTab === t.id ? 'var(--bg-surface)' : 'transparent', color: activeTab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)', boxShadow: activeTab === t.id ? 'var(--shadow-card)' : 'none' }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {activeTab === 'qr'     && <QRTab />}
          {activeTab === 'face'   && <FaceTab />}
          {activeTab === 'manual' && <ManualTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}