import { useState, useRef, useEffect } from 'react';
import { LoadingSpinner, PageHeader } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function FaceDebug() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);
  const [aiError, setAiError] = useState('');

  // Test image upload
  const [testImage, setTestImage] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Live camera test
  const [cameraActive, setCameraActive] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Registered faces preview
  const [faceImages, setFaceImages] = useState([]);

  useEffect(() => {
    const load = async () => {
      // Load students
      try {
        const res = await apiClient.get('/users?role=student&limit=100');
        setStudents(res.data?.users || []);
      } catch (e) { console.error(e); }

      // Check AI service status
      try {
        const res = await fetch('/ai/api/status');
        const data = await res.json();
        setAiStatus(data.data);
      } catch (e) {
        setAiError('AI service not reachable at /ai/api. Check vite.config.js proxy and python run.py');
      }

      setLoading(false);
    };
    load();
  }, []);

  // Connect stream to video
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play()
        .then(() => setVideoReady(true))
        .catch(console.error);
    }
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      alert('Camera error: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setVideoReady(false);
    setLiveResult(null);
  };

  // Capture frame from live camera and test recognition
  const testLiveFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState < 2) return;

    setScanning(true);
    setLiveResult(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append('image', blob, 'test.jpg');

        const res = await fetch('/ai/api/recognize', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setLiveResult(data);
      } catch (err) {
        setLiveResult({ error: err.message });
      } finally {
        setScanning(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Test with uploaded image file
  const testUploadedImage = async (file) => {
    if (!file) return;
    setTesting(true);
    setTestResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setTestImage(e.target.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file, file.name);

      const res = await fetch('/ai/api/recognize', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  // Re-register a specific student
  const reRegisterStudent = async (studentId, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file, 'face.jpg');
      const res = await fetch(`/ai/api/register/${studentId}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Face re-registered for student ${studentId}. Encodings: ${data.encodings_count}`);
        // Refresh AI status
        const statusRes = await fetch('/ai/api/status');
        const statusData = await statusRes.json();
        setAiStatus(statusData.data);
      } else {
        alert('❌ Failed: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  const registeredStudents = students.filter(s => s.faceRegistered);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="🔍 Face Recognition Debug"
        description="Test and diagnose face recognition — check registered faces, test camera, upload images"
      />

      {/* ── AI SERVICE STATUS ── */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>1. AI Service Status</h3>

        {aiError ? (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div style={{ color: '#EF4444', fontWeight: 700, marginBottom: 8 }}>❌ AI Service Unreachable</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{aiError}</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 6 }}>
              Check:<br />
              1. Is python run.py running in terminal?<br />
              2. Does vite.config.js have /ai proxy pointing to localhost:8000?<br />
              3. Did you restart npm run dev after changing vite.config.js?
            </div>
          </div>
        ) : aiStatus ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { label: 'Status', value: '✅ Online', color: '#06D6A0' },
              { label: 'Registered Students', value: aiStatus.total_registered, color: '#4F6EF7' },
              { label: 'Total Encodings', value: aiStatus.total_encodings, color: '#7C3AED' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Checking...</div>
        )}

        {aiStatus && aiStatus.total_registered === 0 && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#F59E0B' }}>
            ⚠️ No faces registered in AI service. Go to <strong>Face Registration</strong> and register student faces first.
          </div>
        )}

        {aiStatus && aiStatus.student_ids?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Registered Student IDs in AI cache:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {aiStatus.student_ids.map(id => (
                <span key={id} style={{ fontSize: '0.7rem', fontFamily: 'monospace', padding: '3px 8px', background: 'rgba(79,110,247,0.1)', color: '#4F6EF7', borderRadius: 4 }}>{id}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REGISTERED STUDENTS CHECK ── */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>2. Registered Students Check</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Students marked as registered in MongoDB vs what AI service has loaded
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>MongoDB faceRegistered</th>
                <th>In AI Cache</th>
                <th>Re-register</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const sid = s._id || s.id;
                const inAiCache = aiStatus?.student_ids?.includes(sid);
                return (
                  <tr key={sid}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sid}</div>
                    </td>
                    <td>
                      <span className={`badge ${s.faceRegistered ? 'badge-success' : 'badge-danger'}`}>
                        {s.faceRegistered ? '✅ Yes' : '❌ No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${inAiCache ? 'badge-success' : 'badge-danger'}`}>
                        {aiStatus ? (inAiCache ? '✅ Loaded' : '❌ Missing') : '?'}
                      </span>
                    </td>
                    <td>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        📸 Upload Face
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => e.target.files[0] && reRegisterStudent(sid, e.target.files[0])} />
                      </label>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TEST WITH IMAGE UPLOAD ── */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>3. Test Recognition with Image</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Upload a photo and see if AI can recognize the face
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Upload */}
          <div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)',
              padding: 32, cursor: 'pointer', background: 'var(--bg-surface-2)',
              transition: 'all 0.15s',
            }}>
              {testImage ? (
                <img src={testImage} alt="Test" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📤</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Upload test image</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to select a photo</div>
                </>
              )}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && testUploadedImage(e.target.files[0])} />
            </label>
          </div>

          {/* Result */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Result</div>
            {testing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 16 }}>
                <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Sending to AI service...
              </div>
            )}
            {testResult && !testResult.error && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <span className="badge badge-info">👤 {testResult.faces_detected} face(s) detected</span>
                  <span className={`badge ${testResult.recognized > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {testResult.recognized > 0 ? `✅ ${testResult.recognized} recognized` : '❌ Not recognized'}
                  </span>
                </div>

                {testResult.results?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {testResult.results.map((r, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: r.recognized ? 'rgba(6,214,160,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', border: `1px solid ${r.recognized ? 'rgba(6,214,160,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        {r.recognized ? (
                          <>
                            <div style={{ fontWeight: 700, color: '#06D6A0', marginBottom: 4 }}>✅ RECOGNIZED</div>
                            <div style={{ fontSize: '0.85rem' }}>Student ID: <code style={{ background: 'var(--bg-surface-2)', padding: '1px 6px', borderRadius: 4 }}>{r.student_id}</code></div>
                            {/* Find student name */}
                            {(() => {
                              const found = students.find(s => (s._id || s.id) === r.student_id);
                              return found ? <div style={{ fontSize: '0.85rem', marginTop: 4, color: '#06D6A0' }}>Name: <strong>{found.name}</strong></div> : null;
                            })()}
                            <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Confidence: <strong style={{ color: '#06D6A0' }}>{r.confidence?.toFixed(1)}%</strong></div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>❌ FACE DETECTED BUT NOT RECOGNIZED</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              This face was detected but doesn't match any registered student.
                            </div>
                            {r.confidence && <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Best match confidence: {r.confidence?.toFixed(1)}% (need &gt;85%)</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {testResult.faces_detected === 0 && (
                  <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>❌ NO FACE DETECTED</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Possible reasons:</div>
                    <ul style={{ marginTop: 6, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 2 }}>
                      <li>Image is too dark or blurry</li>
                      <li>Face is too small or too far</li>
                      <li>Face is at an extreme angle</li>
                      <li>Image format not supported</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {testResult?.error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', color: '#EF4444', fontSize: '0.85rem' }}>
                Error: {testResult.error}
              </div>
            )}
            {!testResult && !testing && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: 16 }}>Upload an image to test recognition</div>
            )}
          </div>
        </div>
      </div>

      {/* ── LIVE CAMERA TEST ── */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>4. Live Camera Test</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Point camera at a student's face and click Scan to test recognition in real time
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Camera */}
          <div>
            <div style={{
              position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              background: '#0A0F1E', aspectRatio: '4/3',
            }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                onLoadedMetadata={() => setVideoReady(true)}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: cameraActive ? 'block' : 'none',
                  transform: 'scaleX(-1)',
                }}
              />
              {!cameraActive && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ fontSize: '2.5rem' }}>📷</div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Click Start Camera</span>
                </div>
              )}
              {cameraActive && !videoReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {!cameraActive ? (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={startCamera}>
                  📷 Start Camera
                </button>
              ) : (
                <>
                  <button className="btn btn-danger btn-sm" onClick={stopCamera}>Stop</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={testLiveFrame} disabled={!videoReady || scanning}>
                    {scanning ? '🔍 Scanning...' : '🔍 Scan Now'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Result */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scan Result</div>

            {scanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 16 }}>
                <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Analyzing frame...
              </div>
            )}

            {liveResult && !liveResult.error && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="badge badge-info">👤 {liveResult.faces_detected} face(s)</span>
                  {liveResult.liveness_failed && <span className="badge badge-warning">⚠️ Liveness failed</span>}
                  <span className={`badge ${liveResult.recognized > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {liveResult.recognized > 0 ? `✅ ${liveResult.recognized} recognized` : '❌ Not recognized'}
                  </span>
                </div>

                {liveResult.faces_detected === 0 && (
                  <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#EF4444' }}>
                    ❌ No face detected in frame.<br />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Move closer to camera, improve lighting, or look directly at camera.</span>
                  </div>
                )}

                {liveResult.results?.map((r, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: r.recognized ? 'rgba(6,214,160,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', border: `1px solid ${r.recognized ? 'rgba(6,214,160,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: 8 }}>
                    {r.recognized ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#06D6A0', marginBottom: 4 }}>✅ RECOGNIZED</div>
                        {(() => {
                          const found = students.find(s => (s._id || s.id) === r.student_id);
                          return (
                            <div style={{ fontSize: '0.9rem' }}>
                              <strong style={{ color: '#06D6A0' }}>{found?.name || r.student_id}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                Confidence: {r.confidence?.toFixed(1)}% · Distance: {r.distance?.toFixed(3)}
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: 4 }}>❌ FACE NOT RECOGNIZED</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Face detected but no match found.
                          {r.confidence && <span> Best confidence: {r.confidence?.toFixed(1)}% (need &gt;85%)</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                          → Is this student registered? Check table above.<br />
                          → Try re-registering with better quality photos.
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {liveResult?.error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', color: '#EF4444', fontSize: '0.85rem' }}>
                Error: {liveResult.error}
              </div>
            )}

            {!liveResult && !scanning && cameraActive && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: 16 }}>
                Click "Scan Now" to test recognition
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}