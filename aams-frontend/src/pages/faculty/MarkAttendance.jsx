import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, QrCode, List, Play, Square, CheckCircle, RefreshCw } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

const MODES = [
  { id: 'face', icon: Camera, label: 'Face Recognition', desc: 'AI-powered automatic detection', color: '#4F6EF7' },
  { id: 'qr', icon: QrCode, label: 'QR Code', desc: 'Students scan session QR', color: '#06D6A0' },
  { id: 'manual', icon: List, label: 'Manual', desc: 'Mark attendance manually', color: '#F59E0B' },
];

export default function MarkAttendance() {
  const [mode, setMode] = useState('face');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [markedStudents, setMarkedStudents] = useState({});
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | scanning | found | notfound

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const alreadyMarkedRef = useRef(new Set());

  // Load courses and students
  useEffect(() => {
    Promise.all([
      apiClient.get('/courses'),
      apiClient.get('/users/students/my-class'),
    ]).then(([cRes, sRes]) => {
      setCourses(cRes.data?.courses || []);
      setStudents(sRes.data?.students || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Connect webcam stream to video element
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play()
        .then(() => setVideoReady(true))
        .catch(err => setCameraError('Could not start video: ' + err.message));
    }
  }, [sessionActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = () => {
    // Stop scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Stop webcam
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setVideoReady(false);
  };

  const startWebcam = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      streamRef.current = stream;
      // video element connected via useEffect above after sessionActive = true
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Click the camera icon in your browser address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a webcam.');
      } else {
        setCameraError('Camera error: ' + err.message);
      }
      return false;
    }
    return true;
  };

  const captureAndSend = useCallback(async (currentSessionId) => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setScanStatus('scanning');

      try {
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');

        // Send to Python AI via Vite proxy
        const res = await fetch('/ai/api/recognize', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.faces_detected === 0) {
          setScanStatus('notfound');
          return;
        }

        // Process recognized faces
        const recognized = (data.results || []).filter(r => r.recognized);

        if (recognized.length > 0) {
          setScanStatus('found');

          for (const r of recognized) {
            const studentId = r.student_id;

            // Skip if already marked in this session
            if (alreadyMarkedRef.current.has(studentId)) continue;
            alreadyMarkedRef.current.add(studentId);

            // Mark attendance in backend
            try {
              await apiClient.post('/attendance/face-result', {
                sessionId: currentSessionId,
                studentId: studentId,
                confidence: r.confidence,
                status: 'present'
              });
            } catch (e) {
              console.error('Mark attendance error:', e);
            }

            // Update UI
            setMarkedStudents(prev => ({
              ...prev,
              [studentId]: {
                status: 'present',
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                method: 'face',
                confidence: r.confidence,
              }
            }));
          }
        } else {
          setScanStatus('notfound');
        }

        // Reset scan status after 1 second
        setTimeout(() => setScanStatus('idle'), 1000);

      } catch (err) {
        console.error('Scan error:', err);
        setScanStatus('idle');
      }
    }, 'image/jpeg', 0.85);
  }, []);

  const startSession = async () => {
    if (!selectedCourse) return alert('Please select a course first');
    if (!selectedBatch) return alert('Please enter batch name');

    setStarting(true);
    setCameraError('');

    // Start webcam first for face mode
    if (mode === 'face') {
      const camStarted = await startWebcam();
      if (!camStarted) {
        setStarting(false);
        return;
      }
    }

    try {
      const res = await apiClient.post('/attendance/sessions/start', {
        courseId: selectedCourse,
        batch: selectedBatch,
        section: selectedSection,
        method: mode,
      });

      const session = res.data?.session;
      const newSessionId = session._id;

      setSessionId(newSessionId);
      if (session.qrCode) setQrCode(session.qrCode);
      setSessionActive(true);
      setMarkedStudents({});
      setSessionTime(0);
      alreadyMarkedRef.current = new Set();

      // Start timer
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);

      // Start face scanning every 3 seconds
      if (mode === 'face') {
        // Small delay to let video start
        setTimeout(() => {
          scanIntervalRef.current = setInterval(() => {
            captureAndSend(newSessionId);
          }, 3000);
        }, 2000);
      }

    } catch (err) {
      alert('Failed to start session: ' + (err.message || 'Unknown error'));
      stopEverything();
    } finally {
      setStarting(false);
    }
  };

  const stopSession = async () => {
    stopEverything();
    setSessionActive(false);

    if (sessionId) {
      try {
        await apiClient.put(`/attendance/sessions/${sessionId}/end`);
      } catch (err) {
        console.error('End session error:', err);
      }
    }
  };

  const saveManualAttendance = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status: markedStudents[s._id]?.status || 'absent',
        method: 'manual',
      }));
      await apiClient.post('/attendance/bulk-mark', { sessionId, records });
      await stopSession();
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Save failed: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const toggleManual = (id, status) => {
    setMarkedStudents(prev => ({
      ...prev,
      [id]: { status, time: new Date().toLocaleTimeString(), method: 'manual' }
    }));
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const presentCount = Object.values(markedStudents).filter(s => s.status === 'present').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Mark Attendance"
        description="Start a session — face recognition scans automatically every 3 seconds"
      />

      {/* Session Config */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Session Setup
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Course</label>
            <select className="input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={sessionActive}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Batch</label>
            <input className="input" placeholder="e.g. B.Tech CSE 2021" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={sessionActive} />
          </div>
          <div className="input-group">
            <label className="input-label">Section</label>
            <select className="input" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={sessionActive}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {MODES.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.id} className="card"
              style={{
                padding: 20, cursor: sessionActive ? 'not-allowed' : 'pointer',
                border: `2px solid ${mode === m.id ? m.color : 'var(--border-color)'}`,
                background: mode === m.id ? `${m.color}10` : 'var(--bg-surface)',
                transition: 'all 0.2s', textAlign: 'left',
                opacity: sessionActive && mode !== m.id ? 0.5 : 1,
              }}
              onClick={() => !sessionActive && setMode(m.id)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: mode === m.id ? m.color : 'var(--bg-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, color: mode === m.id ? 'white' : 'var(--text-muted)',
              }}>
                <Icon size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, fontFamily: 'var(--font-display)', color: mode === m.id ? m.color : 'var(--text-primary)' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Left Panel */}
        <div>

          {/* ── FACE MODE ── */}
          {mode === 'face' && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Camera Feed</h3>
                {sessionActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>LIVE — {formatTime(sessionTime)}</span>
                  </div>
                )}
              </div>

              {/* Camera error */}
              {cameraError && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#EF4444' }}>
                  ⚠️ {cameraError}
                </div>
              )}

              {/* Video container */}
              <div style={{
                position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                background: '#0A0F1E', width: '100%', aspectRatio: '4/3',
                maxWidth: 520, margin: '0 auto 16px',
              }}>
                {/* Real webcam video */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setVideoReady(true)}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    display: sessionActive ? 'block' : 'none',
                    transform: 'scaleX(-1)',
                  }}
                />

                {/* Scanning overlay */}
                {sessionActive && videoReady && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {/* Corner brackets */}
                    {[
                      { top: 16, left: 16, borderTop: true, borderLeft: true },
                      { top: 16, right: 16, borderTop: true, borderRight: true },
                      { bottom: 16, left: 16, borderBottom: true, borderLeft: true },
                      { bottom: 16, right: 16, borderBottom: true, borderRight: true },
                    ].map((pos, i) => (
                      <div key={i} style={{
                        position: 'absolute', width: 24, height: 24,
                        top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom,
                        borderTop: pos.borderTop ? '3px solid rgba(79,110,247,0.7)' : 'none',
                        borderBottom: pos.borderBottom ? '3px solid rgba(79,110,247,0.7)' : 'none',
                        borderLeft: pos.borderLeft ? '3px solid rgba(79,110,247,0.7)' : 'none',
                        borderRight: pos.borderRight ? '3px solid rgba(79,110,247,0.7)' : 'none',
                      }} />
                    ))}

                    {/* Scan status */}
                    <div style={{
                      position: 'absolute', bottom: 12, left: 0, right: 0,
                      textAlign: 'center', fontSize: '0.75rem', fontFamily: 'monospace',
                    }}>
                      {scanStatus === 'scanning' && <span style={{ color: '#F59E0B' }}>🔍 Scanning faces...</span>}
                      {scanStatus === 'found' && <span style={{ color: '#06D6A0' }}>✅ Face recognized!</span>}
                      {scanStatus === 'notfound' && <span style={{ color: 'rgba(255,255,255,0.5)' }}>👤 No face detected</span>}
                      {scanStatus === 'idle' && <span style={{ color: 'rgba(255,255,255,0.4)' }}>Scanning every 3 seconds...</span>}
                    </div>

                    {/* Stats overlay */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem', color: '#06D6A0', fontFamily: 'monospace' }}>
                      ✅ {presentCount} marked
                    </div>
                  </div>
                )}

                {/* Loading video */}
                {sessionActive && !videoReady && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Starting camera...</span>
                  </div>
                )}

                {/* Inactive state */}
                {!sessionActive && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Camera size={52} color="rgba(255,255,255,0.2)" />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Camera will start when session begins</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>Scans faces every 3 seconds automatically</span>
                  </div>
                )}
              </div>

              {/* Hidden canvas */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {!sessionActive ? (
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={startSession} disabled={starting}>
                    <Play size={16} /> {starting ? 'Starting...' : 'Start Session + Camera'}
                  </button>
                ) : (
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={stopSession}>
                    <Square size={16} /> End Session
                  </button>
                )}
              </div>

              {sessionActive && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(79,110,247,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid rgba(79,110,247,0.15)' }}>
                  📷 Camera is scanning for registered faces every 3 seconds. Make sure students' faces are clearly visible.
                </div>
              )}
            </div>
          )}

          {/* ── QR MODE ── */}
          {mode === 'qr' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>QR Code Session</h3>
              {!sessionActive ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 180, height: 180, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)' }}>
                    <QrCode size={64} color="var(--text-muted)" />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>QR code appears when session starts</p>
                  <button className="btn btn-primary" onClick={startSession} disabled={starting}>
                    <Play size={16} /> {starting ? 'Starting...' : 'Generate QR & Start'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  {qrCode ? (
                    <img src={qrCode} alt="Session QR" style={{ width: 200, height: 200, borderRadius: 'var(--radius-lg)', margin: '0 auto 16px', display: 'block', background: 'white', padding: 8 }} />
                  ) : (
                    <div style={{ width: 200, height: 200, background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LoadingSpinner />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 600 }}>LIVE — {formatTime(sessionTime)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Students scan this QR with AAMS app</p>
                  <button className="btn btn-danger" onClick={stopSession}><Square size={16} /> End Session</button>
                </div>
              )}
            </div>
          )}

          {/* ── MANUAL MODE ── */}
          {mode === 'manual' && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Manual Attendance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Toggle each student's status</p>
              {!sessionActive ? (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={startSession} disabled={starting}>
                  <Play size={16} /> {starting ? 'Starting...' : 'Start Session'}
                </button>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                      const all = {};
                      students.forEach(s => { all[s._id] = { status: 'present', time: new Date().toLocaleTimeString(), method: 'manual' }; });
                      setMarkedStudents(all);
                    }}>✅ Mark All Present</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMarkedStudents({})}>🔄 Reset</button>
                    <button className="btn btn-danger btn-sm" onClick={stopSession}><Square size={14} /> End</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {students.map(s => {
                      const status = markedStudents[s._id]?.status || 'unmarked';
                      return (
                        <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', flex: 1 }}>{s.name}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {['present', 'absent', 'late'].map(st => (
                              <button key={st} onClick={() => toggleManual(s._id, st)} style={{
                                padding: '4px 10px', borderRadius: 'var(--radius-full)', border: 'none',
                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                                background: status === st ? (st === 'present' ? '#06D6A0' : st === 'absent' ? '#EF4444' : '#F59E0B') : 'var(--bg-surface)',
                                color: status === st ? 'white' : 'var(--text-muted)',
                                transition: 'all 0.15s',
                              }}>
                                {st === 'present' ? 'P' : st === 'absent' ? 'A' : 'L'}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right — Live Attendance List */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Attendance</h3>
            <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem' }}>
              <span style={{ color: '#06D6A0' }}>✅ {presentCount}</span>
              <span style={{ color: '#EF4444' }}>❌ {students.length - presentCount}</span>
              <span style={{ color: 'var(--text-muted)' }}>/{students.length}</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Progress</span>
              <span>{students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg,#4F6EF7,#06D6A0)',
                width: students.length > 0 ? `${(presentCount / students.length) * 100}%` : '0%',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Student list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
            {students.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No students in your class yet
              </div>
            )}
            {students.map(s => {
              const record = markedStudents[s._id || s.id];
              const sid = s._id || s.id;
              return (
                <div key={sid} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: record?.status === 'present' ? 'rgba(6,214,160,0.06)' : 'var(--bg-surface-2)',
                  border: `1px solid ${record?.status === 'present' ? 'rgba(6,214,160,0.2)' : 'transparent'}`,
                  transition: 'all 0.3s',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: record?.status === 'present' ? '#06D6A0' : record?.status === 'absent' ? '#EF4444' : record?.status === 'late' ? '#F59E0B' : 'var(--border-color)',
                    boxShadow: record?.status === 'present' ? '0 0 6px rgba(6,214,160,0.6)' : 'none',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.studentProfile?.rollNo || '—'}</div>
                  </div>
                  {record ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${record.status === 'present' ? 'badge-success' : record.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                        {record.status}
                      </span>
                      {record.confidence && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{record.confidence.toFixed(0)}%</span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{record.time}</span>
                    </div>
                  ) : (
                    sessionActive && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Waiting...</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save button for manual mode */}
          {mode === 'manual' && sessionActive && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={saveManualAttendance} disabled={saving}>
              <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}

          {/* End summary */}
          {!sessionActive && Object.keys(markedStudents).length > 0 && (
            <div style={{ marginTop: 16, padding: '14px', background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#06D6A0', marginBottom: 4 }}>Session Complete</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {presentCount} students marked present out of {students.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}