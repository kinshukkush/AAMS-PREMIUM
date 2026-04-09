import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PageHeader, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

export default function ChildAttendance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState(null);

  useEffect(() => {
    const linked = user?.parentProfile?.linkedStudent;
    const cid = linked?._id || linked?.id || (typeof linked === 'string' ? linked : null);
    setChildId(cid);
  }, [user]);

  useEffect(() => {
    if (!childId) { setLoading(false); return; }
    Promise.all([
      apiClient.get(`/attendance/student/${childId}/summary`),
      apiClient.get(`/attendance/student/${childId}`, { params:{ limit:50 } }),
    ]).then(([sumRes, recRes]) => {
      setSummary(sumRes.data?.summary || []);
      setRecords(recRes.data?.records || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [childId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Child's Attendance"
        description="Complete attendance history"
        actions={<button className="btn btn-primary btn-sm"><Download size={14} /> Download</button>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {summary.map(c => (
          <div key={c.course?._id} className="card" style={{ padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.875rem' }}>{c.course?.name}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{c.course?.code}</div>
              </div>
              <AttendanceBadge percent={c.percentage} />
            </div>
            <div style={{ height:6, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${c.percentage}%`, borderRadius:99,
                background: c.percentage>=85?'#06D6A0':c.percentage>=75?'#F59E0B':'#EF4444' }} />
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:6 }}>{c.present}/{c.total} classes</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Attendance Log</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Date</th><th>Subject</th><th>Status</th><th>Time</th><th>Method</th></tr></thead>
            <tbody>
              {records.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No records</td></tr>}
              {records.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td><span className="badge badge-info">{r.course?.name || '—'}</span></td>
                  <td><span className={`badge ${r.status==='present'?'badge-success':r.status==='late'?'badge-warning':'badge-danger'}`}>{r.status}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{r.checkInTime||'—'}</td>
                  <td><span className={`badge ${r.method==='face'?'badge-info':r.method==='qr'?'badge-success':'badge-neutral'}`}>{r.method||'—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}