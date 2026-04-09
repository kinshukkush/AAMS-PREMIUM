import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PageHeader, AttendanceBadge, Tabs, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

export default function ClassReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [sessions, setSessions] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionRecords, setSessionRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessRes, riskRes, cRes] = await Promise.all([
          apiClient.get('/attendance/sessions?limit=50'),
          apiClient.get('/attendance/analytics/at-risk?threshold=75'),
          apiClient.get('/courses'),
        ]);
        setSessions(sessRes.data?.sessions || []);
        setAtRisk(riskRes.data?.students || []);
        setCourses(cRes.data?.courses || []);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    setLoadingRecords(true);
    apiClient.get(`/attendance/sessions/${selectedSession}/records`)
      .then(res => setSessionRecords(res.data?.records || []))
      .catch(console.error)
      .finally(() => setLoadingRecords(false));
  }, [selectedSession]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/reports/excel', { responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a'); a.href = url;
      a.download = 'class_report.xlsx'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(err) { alert('Export failed'); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Class Reports"
        description="View and export attendance reports for your sessions"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleExport} disabled={exporting}>
            <Download size={15} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        }
      />

      <Tabs
        tabs={[
          { id:'summary', label:'Sessions' },
          { id:'records', label:'Session Records' },
          { id:'lowatt', label:'Low Attendance', count: atRisk.length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'summary' && (
        <div className="card" style={{ padding:24 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Course</th><th>Batch</th><th>Method</th><th>Present</th><th>Status</th></tr></thead>
              <tbody>
                {sessions.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No sessions yet</td></tr>}
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{new Date(s.date).toLocaleDateString('en-IN')}</td>
                    <td><span className="badge badge-info">{s.course?.name || '—'}</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{s.batch} Sec {s.section}</td>
                    <td><span className={`badge ${s.method==='face'?'badge-info':s.method==='qr'?'badge-success':'badge-neutral'}`}>{s.method}</span></td>
                    <td><span className="badge badge-success">{s.presentCount}</span></td>
                    <td><span className={`badge ${s.status==='completed'?'badge-success':s.status==='active'?'badge-warning':'badge-neutral'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ marginBottom:16 }}>
            <div className="input-group">
              <label className="input-label">Select Session</label>
              <select className="input" style={{ maxWidth:400 }} value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
                <option value="">Choose a session...</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {new Date(s.date).toLocaleDateString('en-IN')} — {s.course?.name} ({s.batch})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loadingRecords ? <LoadingSpinner /> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Student</th><th>Roll No</th><th>Status</th><th>Time</th><th>Method</th></tr></thead>
                <tbody>
                  {sessionRecords.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>Select a session to view records</td></tr>}
                  {sessionRecords.map((r,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500 }}>{r.student?.name}</td>
                      <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{r.student?.studentProfile?.rollNo || '—'}</span></td>
                      <td><span className={`badge ${r.status==='present'?'badge-success':r.status==='late'?'badge-warning':'badge-danger'}`}>{r.status}</span></td>
                      <td style={{ fontSize:'0.8rem' }}>{r.checkInTime || '—'}</td>
                      <td><span className={`badge ${r.method==='face'?'badge-info':r.method==='qr'?'badge-success':'badge-neutral'}`}>{r.method}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lowatt' && (
        <div className="card" style={{ padding:24 }}>
          {atRisk.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>🎉 No at-risk students</div>
          ) : (
            <>
              <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'var(--radius-md)', padding:'12px 16px', marginBottom:16 }}>
                ⚠️ {atRisk.length} students are below the 75% attendance threshold.
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Student</th><th>Roll No</th><th>Course</th><th>Attendance</th><th>Action</th></tr></thead>
                  <tbody>
                    {atRisk.map((s,i) => (
                      <tr key={i}>
                        <td><div style={{ fontWeight:500 }}>{s.student?.name}</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.student?.email}</div></td>
                        <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{s.student?.rollNo || '—'}</span></td>
                        <td><span className="badge badge-info">{s.course?.name}</span></td>
                        <td><AttendanceBadge percent={s.percentage} /></td>
                        <td><button className="btn btn-secondary btn-sm">Send Alert</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
