import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CheckCircle, RefreshCw, User, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader, SearchBar, Modal, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
 
const AI_URL = '/ai/api';
 
export default function FaceRegistration() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [localStatus, setLocalStatus] = useState({});
  const [showConfirm, setShowConfirm] = useState(null);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
  console.log('AI Service URL:', AI_URL);
  // Test if AI service is reachable
  fetch(`${AI_URL}/health`)
    .then(r => r.json())
    .then(d => console.log('AI Health:', d))
    .catch(e => console.error('AI unreachable:', e));
}, []);
  // Load students on mount
  useEffect(() => {
    apiClient.get('/users?role=student&limit=200')
      .then(res => setStudents(res.data?.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
 
  // Connect stream to video element after React renders the video tag
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .then(() => setVideoReady(true))
        .catch(err => {
          console.error('Video play error:', err);
          setError('Could not start video. Try allowing camera again.');
        });
    }
  }, [stream, capturing]);
 
  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.studentProfile?.rollNo?.toLowerCase().includes(search.toLowerCase())
  );
 
  const startCamera = async () => {
    setError('');
    setVideoReady(false);
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
 
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
 
      setStream(mediaStream);
      setCapturing(true); // render the video tag first, then useEffect connects stream
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Click the camera icon in your browser address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a webcam and try again.');
      } else {
        setError('Camera error: ' + err.message);
      }
    }
  };
 
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setStream(null);
    setCapturing(false);
    setVideoReady(false);
  };
 
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !selected) return;
 
    // Check video is actually playing and has dimensions
    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) {
      setError('Camera not ready yet. Wait a moment and try again.');
      return;
    }
 
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
 
    const ctx = canvas.getContext('2d');
    // Draw normal (not mirrored) — the CSS mirror is just for display
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Could not capture image. Try again.');
        return;
      }
 
      setRegistering(true);
      setError('');
 
      try {
        const formData = new FormData();
        formData.append('image', blob, 'face.jpg');
 
        const res = await fetch(`${AI_URL}/register/${selected._id}`, {
          method: 'POST',
          body: formData,
          mode: 'cors',
        });
 
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`AI service error: ${res.status} — ${text}`);
        }
 
        const data = await res.json();
 
        if (!data.success) {
          setError(data.error || 'No face detected. Make sure your face is clearly visible and well lit.');
          setRegistering(false);
          return;
        }
 
        const newCount = captureCount + 1;
        setCaptureCount(newCount);
 
        if (newCount >= 3) {
          // Mark face as registered in backend
          try {
            await apiClient.put(`/users/${selected._id}`, { faceRegistered: true });
          } catch (e) {
            console.error('Failed to update faceRegistered flag:', e);
          }
          setLocalStatus(prev => ({ ...prev, [selected._id]: 'registered' }));
          setStudents(prev => prev.map(s =>
            s._id === selected._id ? { ...s, faceRegistered: true } : s
          ));
          stopCamera();
          setCaptureCount(0);
        }
      } catch (err) {
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError(`Cannot reach AI service at ${AI_URL}. Make sure "python run.py" is running in a separate terminal.`);
        } else {
          setError('Registration failed: ' + err.message);
        }
      } finally {
        setRegistering(false);
      }
    }, 'image/jpeg', 0.9);
  }, [selected, captureCount, stream]);
 
  const handleSelect = (student) => {
    stopCamera();
    setCaptureCount(0);
    setError('');
    setSelected(student);
  };
 
  const handleDelete = async (studentId) => {
    try {
      await fetch(`${AI_URL}/register/${studentId}`, { method: 'DELETE' });
      await apiClient.put(`/users/${studentId}`, { faceRegistered: false });
      setStudents(prev => prev.map(s =>
        s._id === studentId ? { ...s, faceRegistered: false } : s
      ));
      setLocalStatus(prev => ({ ...prev, [studentId]: null }));
      if (selected?._id === studentId) stopCamera();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
    setShowConfirm(null);
  };
 
  if (loading) return <LoadingSpinner />;
 
  const registeredCount = students.filter(s => s.faceRegistered || localStatus[s._id] === 'registered').length;
  const isRegistered = selected && (selected.faceRegistered || localStatus[selected._id] === 'registered');
 
  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Face Registration"
        description="Register student faces for AI-powered attendance recognition"
      />
 
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: students.length, color: '#4F6EF7' },
          { label: 'Registered', value: registeredCount, color: '#06D6A0' },
          { label: 'Pending', value: students.length - registeredCount, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
 
        {/* Student List */}
        <div className="card" style={{ padding: 20, maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Students
          </h3>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or roll no..." />
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filtered.map(s => {
              const isReg = s.faceRegistered || localStatus[s._id] === 'registered';
              const isSel = selected?._id === s._id;
              return (
                <div
                  key={s._id}
                  onClick={() => handleSelect(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isSel ? 'var(--bg-active)' : 'transparent',
                    border: `1px solid ${isSel ? 'var(--brand-primary)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="avatar" style={{
                    width: 30, height: 30, fontSize: '0.65rem', flexShrink: 0,
                    background: isReg ? 'linear-gradient(135deg,#06D6A0,#3B82F6)' : 'var(--gradient-brand)'
                  }}>
                    {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      color: isSel ? 'var(--brand-primary)' : 'var(--text-primary)'
                    }}>{s.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.studentProfile?.rollNo || '—'}</div>
                  </div>
                  {isReg
                    ? <CheckCircle size={15} color="#06D6A0" style={{ flexShrink: 0 }} />
                    : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--border-color)', flexShrink: 0 }} />
                  }
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20, fontSize: '0.8rem' }}>
                No students found
              </div>
            )}
          </div>
        </div>
 
        {/* Camera Panel */}
        <div className="card" style={{ padding: 28 }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)', gap: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-xl)', background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={28} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select a student</div>
              <div style={{ fontSize: '0.875rem' }}>Choose from the list on the left to register their face</div>
            </div>
          ) : (
            <div>
              {/* Student header */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, padding: '14px 18px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
                <div className="avatar" style={{
                  width: 46, height: 46,
                  background: isRegistered ? 'linear-gradient(135deg,#06D6A0,#3B82F6)' : 'var(--gradient-brand)'
                }}>
                  {selected.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selected.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selected.studentProfile?.rollNo} · {selected.studentProfile?.batch}
                  </div>
                </div>
                {isRegistered && (
                  <>
                    <span className="badge badge-success">✅ Registered</span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--brand-danger)' }}
                      onClick={() => setShowConfirm(selected._id)}
                      title="Delete face data"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
 
              {/* Instructions */}
              <div style={{ background: 'rgba(79,110,247,0.06)', border: '1px solid rgba(79,110,247,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                📋 <strong>Instructions:</strong> Look directly at the camera. Capture 3 photos — look straight, then slightly left, then slightly right. Good lighting helps accuracy.
              </div>
 
              {/* Camera View */}
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: '#0A0F1E',
                width: '100%',
                maxWidth: 520,
                aspectRatio: '4/3',
                margin: '0 auto 20px',
              }}>
                {capturing ? (
                  <>
                    {/* Actual video element — this shows the camera feed */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => setVideoReady(true)}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transform: 'scaleX(-1)', // mirror for selfie view
                      }}
                    />
 
                    {/* Face guide oval overlay */}
                    {videoReady && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{
                          width: 180, height: 220,
                          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                          border: '3px solid rgba(79,110,247,0.8)',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.4), 0 0 20px rgba(79,110,247,0.4)',
                        }} />
                      </div>
                    )}
 
                    {/* Loading overlay while video starts */}
                    {!videoReady && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
                        <div style={{ textAlign: 'center', color: 'white' }}>
                          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
                          <div style={{ fontSize: '0.8rem' }}>Starting camera...</div>
                        </div>
                      </div>
                    )}
 
                    {/* Capture progress dots */}
                    <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 32, height: 6, borderRadius: 99,
                          background: captureCount > i ? '#06D6A0' : 'rgba(255,255,255,0.3)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
 
                    {/* Status text */}
                    <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                      {captureCount === 0 && '📸 Look straight ahead'}
                      {captureCount === 1 && '📸 Turn slightly to the left'}
                      {captureCount === 2 && '📸 Turn slightly to the right'}
                    </div>
                  </>
                ) : (
                  /* Inactive state */
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <Camera size={52} color="rgba(255,255,255,0.2)" />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Camera inactive</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>Click Start Camera below</span>
                  </div>
                )}
              </div>
 
              {/* Hidden canvas for capturing frames */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
 
              {/* Error message */}
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16,
                  display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem', color: '#EF4444'
                }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{error}</span>
                </div>
              )}
 
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {!capturing ? (
                  <button className="btn btn-primary" onClick={startCamera} style={{ minWidth: 140 }}>
                    <Camera size={16} /> Start Camera
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={stopCamera}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={captureFrame}
                      disabled={registering || !videoReady}
                      style={{ background: 'linear-gradient(135deg,#06D6A0,#3B82F6)', minWidth: 160 }}
                    >
                      {registering
                        ? '⏳ Processing...'
                        : !videoReady
                          ? '⏳ Starting...'
                          : `📸 Capture (${captureCount}/3)`
                      }
                    </button>
                  </>
                )}
 
                {isRegistered && !capturing && (
                  <button className="btn btn-secondary" onClick={startCamera}>
                    <RefreshCw size={15} /> Re-register
                  </button>
                )}
              </div>
 
              {/* Success message */}
              {isRegistered && (
                <div style={{ textAlign: 'center', marginTop: 20, padding: 16, background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.25)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#06D6A0' }}>Face Successfully Registered!</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {selected.name} will now be recognized during AI attendance sessions.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
 
      {/* Confirm Delete Modal */}
      <Modal isOpen={!!showConfirm} onClose={() => setShowConfirm(null)} title="Delete Face Data">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to delete face data for this student? They will need to re-register to use face recognition.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleDelete(showConfirm)}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}