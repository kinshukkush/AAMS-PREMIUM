import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanFace, X, Upload, Check, Search, ChevronDown, RefreshCw,
  Camera, Trash2, Image as ImageIcon, AlertTriangle, CheckCircle
} from 'lucide-react';
import { fadeUp, scaleIn, stagger } from '../../utils/animations';
import toast from 'react-hot-toast';

const PHOTO_ANGLES = [
  { id: 'front', label: 'Front (Straight)', guide: 'Look directly at the camera' },
  { id: 'left',  label: 'Left Profile',     guide: 'Turn head 30° to the left' },
  { id: 'right', label: 'Right Profile',    guide: 'Turn head 30° to the right' },
];

const STUDENTS = [
  { _id: 's1', name: 'Arjun Patel',  rollNo: 'CSE-001', encodings: 3 },
  { _id: 's2', name: 'Priya Singh',  rollNo: 'CSE-002', encodings: 0 },
  { _id: 's3', name: 'Rahul Mehta',  rollNo: 'CSE-003', encodings: 2 },
  { _id: 's4', name: 'Neha Gupta',   rollNo: 'CSE-004', encodings: 0 },
  { _id: 's5', name: 'Vikram Shah',  rollNo: 'CSE-005', encodings: 3 },
];

export default function FaceRegistration() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [search, setSearch]         = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedStudent, setStudent] = useState(null);
  const [photos, setPhotos]         = useState({ front: null, left: null, right: null });
  const [capturing, setCapturing]   = useState(null); // which angle
  const [step, setStep]             = useState(1); // 1=select, 2=capture, 3=confirm, 4=done
  const [uploading, setUploading]   = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const filteredStudents = STUDENTS.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const startCamera = async (angle) => {
    setCapturing(angle);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
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
    canvasRef.current.width  = videoRef.current.videoWidth  || 640;
    canvasRef.current.height = videoRef.current.videoHeight || 480;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setPhotos(p => ({ ...p, [capturing]: dataUrl }));
    stopCamera();
    setCapturing(null);
    toast.success(`${capturing.charAt(0).toUpperCase() + capturing.slice(1)} photo captured!`);
    const allCaptured = { ...photos, [capturing]: dataUrl };
    if (Object.values(allCaptured).every(Boolean)) setStep(3);
  };

  const retakePhoto = (angle) => {
    setPhotos(p => ({ ...p, [angle]: null }));
    if (step === 3) setStep(2);
  };

  const handleSelectStudent = (s) => {
    setStudent(s);
    setSearch(s.name);
    setSearchOpen(false);
    setPhotos({ front: null, left: null, right: null });
    setStep(2);
  };

  const handleUpload = async () => {
    if (!Object.values(photos).every(Boolean)) { toast.error('Please capture all 3 photos'); return; }
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    setStep(4);
    toast.success(`Face registration complete for ${selectedStudent.name}!`);
  };

  const reset = () => {
    setStudent(null); setSearch('');
    setPhotos({ front: null, left: null, right: null });
    setStep(1); setCapturing(null); setCameraActive(false);
  };

  const STEPS = ['Select Student','Capture Photos','Review & Upload','Complete'];
  const allCaptured = Object.values(photos).every(Boolean);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Face Registration</h1>
          <p>Capture 3-angle photos to register students for face recognition</p>
        </div>
      </div>

      {/* Progress step indicator */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: step >= i + 1 ? 'white' : 'var(--text-muted)', border: step < i + 1 ? '1px solid var(--border-default)' : 'none', transition: 'all 0.3s' }}>
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.65rem', color: step === i + 1 ? 'var(--accent-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--border-default)', margin: '0 8px', marginBottom: 20, transition: 'background 0.4s' }} />}
          </div>
        ))}
      </motion.div>

      {/* Step 4: Complete */}
      {step === 4 && (
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <CheckCircle size={72} color="var(--success)" style={{ marginBottom: 20, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Registration Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{selectedStudent?.name} has been registered with 3 face angles.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button id="btn-register-another" className="btn btn-primary" onClick={reset}><ScanFace size={15} /> Register Another</button>
            <button className="btn btn-secondary" onClick={reset}><RefreshCw size={15} /> Start Over</button>
          </div>
        </motion.div>
      )}

      {step < 4 && (
        <div className="grid-2">
          {/* Left Column */}
          <div>
            {/* Student Search */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24, marginBottom: 20, position: 'relative' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>Select Student</h3>
              <div className="input-with-icon">
                <Search className="input-icon" size={16} />
                <input id="student-search-input" className="input"
                  type="text" placeholder="Search by name or roll number..."
                  value={search} onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
              {searchOpen && filteredStudents.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 24, right: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-modal)', zIndex: 50, overflow: 'hidden' }}>
                  {filteredStudents.map(s => (
                    <button key={s._id} id={`student-item-${s._id}`} onClick={() => handleSelectStudent(s)}
                      style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(108,142,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>{s.name[0]}</div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.rollNo}</div>
                      </div>
                      <span className={`badge ${s.encodings > 0 ? 'badge-success' : 'badge-neutral'}`}>{s.encodings > 0 ? `${s.encodings} encodings` : 'Not registered'}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedStudent && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(108,142,255,0.08)', border: '1px solid var(--border-accent)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{selectedStudent.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedStudent.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedStudent.rollNo}</div>
                  </div>
                  <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
                </div>
              )}
            </motion.div>

            {/* Camera View */}
            {cameraActive && (
              <motion.div variants={scaleIn} initial="hidden" animate="visible" className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>
                  Capturing: {capturing?.charAt(0).toUpperCase() + capturing?.slice(1)} view
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {PHOTO_ANGLES.find(a => a.id === capturing)?.guide}
                </p>
                <div style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 160, height: 200, border: '2.5px solid rgba(108,142,255,0.80)', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', boxShadow: '0 0 20px rgba(108,142,255,0.30)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button id="btn-capture-photo" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={capturePhoto}><Camera size={15} /> Capture</button>
                  <button className="btn btn-secondary" onClick={() => { stopCamera(); setCapturing(null); }}>Cancel</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column — Photo angles */}
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>Capture 3 Angles</h3>
            {!selectedStudent && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>Select a student first</p>
              </div>
            )}
            {selectedStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {PHOTO_ANGLES.map(angle => (
                  <div key={angle.id} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: photos[angle.id] ? 'rgba(52,211,153,0.05)' : 'var(--bg-elevated)' }}>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: photos[angle.id] ? '1px solid rgba(52,211,153,0.2)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: photos[angle.id] ? 'rgba(52,211,153,0.15)' : 'rgba(108,142,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {photos[angle.id] ? <CheckCircle size={18} color="var(--success)" /> : <Camera size={18} color="var(--accent-primary)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{angle.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{angle.guide}</div>
                      </div>
                      {photos[angle.id]
                        ? <button id={`retake-${angle.id}`} className="btn btn-ghost btn-sm" onClick={() => retakePhoto(angle.id)}><RefreshCw size={14} /> Retake</button>
                        : <button id={`capture-${angle.id}`} className="btn btn-primary btn-sm" onClick={() => startCamera(angle.id)} disabled={cameraActive}><Camera size={14} /> Capture</button>
                      }
                    </div>
                    {photos[angle.id] && (
                      <img src={photos[angle.id]} alt={`${angle.label} photo`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    )}
                  </div>
                ))}

                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
                  <button id="btn-upload-registration" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload} disabled={!allCaptured || uploading}>
                    {uploading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Uploading...</> : <><Upload size={15} /> Upload & Register</>}
                  </button>
                  <button className="btn btn-secondary" onClick={reset}><X size={15} /></button>
                </div>
                {!allCaptured && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>{Object.values(photos).filter(Boolean).length}/3 photos captured</p>}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}