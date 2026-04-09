import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { PageHeader, AttendanceBadge, Tabs, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

export default function MyAttendance() {
  const { user } = useAuth();
  const studentId = user?._id || user?.id;
  const [activeTab, setActiveTab] = useState('courses');
  const [summary, setSummary] = useState([]);
  const [records, setRecords] = useState([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    
    const load = async () => {
      setLoading(true);
      try {
        const [sumRes, recRes] = await Promise.all([
          apiClient.get(`/attendance/student/${studentId}/summary`),
          apiClient.get(`/attendance/student/${studentId}`, { params:{ limit:100 } }),
        ]);
        setSummary(sumRes.data?.summary || []);
        setOverall(sumRes.data?.overall || 0);
        setRecords(recRes.data?.records || []);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [studentId]);

  const filteredRecords = selectedCourse === 'all'
    ? records
    : records.filter(r => r.course?._id === selectedCourse);

  const totalPresent = summary.reduce((a,c) => a + (c.present||0), 0);
  const totalClasses = summary.reduce((a,c) => a + (c.total||0), 0);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get(`/reports/student/${studentId}/pdf`, { responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a');
      a.href = url; a.download = 'attendance_report.pdf'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(err) { alert('Export failed: ' + err.message); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="My Attendance"
        description="Complete attendance record across all subjects this semester"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleExportPDF} disabled={exporting}>
            <Download size={15} /> {exporting ? 'Exporting...' : 'Download PDF'}
          </button>
        }
      />

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Overall %', value:`${overall}%`, bg:'#4F6EF7' },
          { label:'Total Present', value: totalPresent, bg:'#06D6A0' },
          { label:'Total Absent', value: totalClasses - totalPresent, bg:'#EF4444' },
          { label:'Courses', value: summary.length, bg:'#7C3AED' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'18px 20px' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)', color:s.bg }}>{s.value}</div>
            <div style={{ fontWeight:600, fontSize:'0.8rem', color:'var(--text-primary)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { id:'courses', label:'Course Summary' },
          { id:'history', label:'Attendance History' },
          { id:'calendar', label:'Calendar View' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'courses' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {summary.length === 0 && <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No records yet</div>}
          {summary.map(c => (
            <div key={c.course?._id} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                <div style={{ width:50, height:50, borderRadius:'var(--radius-md)', flexShrink:0,
                  background: c.percentage < 75 ? 'rgba(239,68,68,0.1)' : 'rgba(79,110,247,0.1)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'monospace', fontWeight:800, fontSize:'0.85rem',
                  color: c.percentage < 75 ? '#EF4444' : '#4F6EF7' }}>
                  {c.course?.code?.slice(-3) || '?'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{c.course?.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{c.course?.code}</div>
                    </div>
                    <AttendanceBadge percent={c.percentage} />
                  </div>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <div style={{ flex:1, height:8, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${c.percentage}%`, borderRadius:99,
                        background: c.percentage<75?'#EF4444':c.percentage>=85?'#06D6A0':'#F59E0B', transition:'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', minWidth:90, textAlign:'right' }}>{c.present}/{c.total} classes</span>
                  </div>
                  {c.percentage < 75 && (
                    <div style={{ marginTop:8, fontSize:'0.75rem', color:'#EF4444', fontWeight:600 }}>
                      ⚠️ Need {Math.max(0, Math.ceil(c.total * 0.75) - c.present)} more classes to reach 75%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            <select className="input" style={{ width:220 }} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="all">All Courses</option>
              {summary.map(c => <option key={c.course?._id} value={c.course?._id}>{c.course?.name}</option>)}
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Course</th><th>Status</th><th>Time</th><th>Method</th></tr></thead>
              <tbody>
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No records</td></tr>
                )}
                {filteredRecords.map((r,i) => (
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
      )}

      {activeTab === 'calendar' && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:20, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            {new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:12 }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-display)', padding:'6px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
            {/* leading empty cells */}
            {Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()}).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({length: new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate()}).map((_,i) => {
              const day = i + 1;
              const dateStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const dayRecords = records.filter(r => r.date?.startsWith(dateStr));
              const hasPresent = dayRecords.some(r => r.status === 'present');
              const hasAbsent = dayRecords.some(r => r.status === 'absent');
              const isToday = day === new Date().getDate();
              return (
                <div key={day} style={{
                  textAlign:'center', padding:'8px 4px', borderRadius:'var(--radius-sm)',
                  fontSize:'0.8rem', fontWeight: isToday ? 800 : 400,
                  background: isToday ? 'var(--gradient-brand)' : hasPresent ? 'rgba(6,214,160,0.12)' : hasAbsent ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface-2)',
                  color: isToday ? 'white' : 'var(--text-primary)',
                  border:`1px solid ${isToday?'transparent':hasPresent?'rgba(6,214,160,0.2)':hasAbsent?'rgba(239,68,68,0.2)':'var(--border-color)'}`,
                }}>
                  {day}
                  {dayRecords.length > 0 && <div style={{ width:4, height:4, borderRadius:'50%', margin:'2px auto 0', background: hasPresent?'#06D6A0':'#EF4444' }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:20, fontSize:'0.75rem', color:'var(--text-muted)' }}>
            {[['#06D6A0','Present'],['#EF4444','Absent'],['var(--bg-surface-2)','No Class']].map(([color,label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:color }} />{label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}