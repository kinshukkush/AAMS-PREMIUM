import { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PageHeader, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function StudentAnalytics() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    apiClient.get('/users/students/my-class')
      .then(res => {
        const studs = res.data?.students || [];
        setStudents(studs);
        if (studs.length > 0) setSelected(studs[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected?._id) return;
    setLoadingDetail(true);
    apiClient.get(`/attendance/student/${selected._id}/summary`)
      .then(res => {
        setSummary(res.data?.summary || []);
        setOverall(res.data?.overall || 0);
      })
      .catch(console.error)
      .finally(() => setLoadingDetail(false));
  }, [selected]);

  if (loading) return <LoadingSpinner />;

  const radarData = summary.map(c => ({ subject: c.course?.code || '?', attendance: c.percentage }));
  const totalPresent = summary.reduce((a,c) => a + (c.present||0), 0);
  const totalClasses = summary.reduce((a,c) => a + (c.total||0), 0);

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Student Analytics" description="Deep dive into individual student performance" />

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:24 }}>
        {/* Student List */}
        <div className="card" style={{ padding:16, height:'fit-content' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12, padding:'0 4px' }}>Select Student</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {students.map(s => (
              <button key={s._id} onClick={() => setSelected(s)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 10px',
                borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', textAlign:'left', width:'100%',
                background: selected?._id === s._id ? 'var(--bg-active)' : 'transparent', transition:'all 0.15s',
              }}>
                <div className="avatar" style={{ width:32, height:32, fontSize:'0.7rem', flexShrink:0, background:'var(--gradient-brand)' }}>
                  {s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:500, color: selected?._id===s._id ? 'var(--brand-primary)' : 'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.studentProfile?.rollNo || '—'}</div>
                </div>
              </button>
            ))}
            {students.length === 0 && <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', padding:'8px 0', textAlign:'center' }}>No students assigned</div>}
          </div>
        </div>

        {/* Analytics Panel */}
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                <div className="avatar" style={{ width:64, height:64, fontSize:'1.2rem', background:'var(--gradient-brand)' }}>
                  {selected.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex:1 }}>
                  <h2 style={{ fontSize:'1.3rem', fontWeight:800 }}>{selected.name}</h2>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:8 }}>{selected.studentProfile?.rollNo} · {selected.studentProfile?.batch} · Sec {selected.studentProfile?.section}</div>
                  <div style={{ display:'flex', gap:10 }}>
                    {loadingDetail ? <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Loading...</span> : <AttendanceBadge percent={overall} />}
                    {overall < 75 && <span className="badge badge-danger">⚠️ Below Threshold</span>}
                    <span className={`badge ${selected.faceRegistered ? 'badge-success' : 'badge-warning'}`}>{selected.faceRegistered ? '✅ Face Registered' : '⚠️ Not Registered'}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-secondary btn-sm">📧 Send Email</button>
                </div>
              </div>
            </div>

            {/* Mini stats */}
            {!loadingDetail && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                {[
                  { label:'Overall', value:`${overall}%`, color: overall>=85?'#06D6A0':overall>=75?'#F59E0B':'#EF4444' },
                  { label:'Classes Attended', value:`${totalPresent}/${totalClasses}`, color:'#4F6EF7' },
                  { label:'Subjects', value: summary.length, color:'#7C3AED' },
                  { label:'At-Risk Courses', value: summary.filter(c=>c.percentage<75).length, color:'#EF4444' },
                ].map(stat => (
                  <div key={stat.label} className="card" style={{ padding:'16px', textAlign:'center' }}>
                    <div style={{ fontSize:'1.5rem', fontWeight:800, fontFamily:'var(--font-display)', color:stat.color }}>{stat.value}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {!loadingDetail && summary.length > 0 && (
              <div className="grid-2">
                <div className="card" style={{ padding:24 }}>
                  <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:16 }}>Subject-wise %</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={summary.map(c => ({ code: c.course?.code||'?', percent: c.percentage }))} layout="vertical" barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                      <XAxis type="number" domain={[0,100]} tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} unit="%" />
                      <YAxis type="category" dataKey="code" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
                      <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:10, fontSize:12 }} formatter={v => [`${v}%`,'Attendance']} />
                      <Bar dataKey="percent" radius={[0,6,6,0]} fill="#4F6EF7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{ padding:24 }}>
                  <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:16 }}>Radar Chart</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'var(--text-muted)' }} />
                      <Radar dataKey="attendance" stroke="#4F6EF7" fill="#4F6EF7" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Subject table */}
            {!loadingDetail && (
              <div className="card" style={{ padding:24 }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:16 }}>Detailed Breakdown</h3>
                {summary.length === 0 ? (
                  <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No attendance data yet for this student</div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Course</th><th>Classes</th><th>Present</th><th>Attendance</th><th>Trend</th></tr></thead>
                      <tbody>
                        {summary.map(c => (
                          <tr key={c.course?._id}>
                            <td><div style={{ fontWeight:500, fontSize:'0.875rem' }}>{c.course?.name}</div><div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{c.course?.code}</div></td>
                            <td style={{ textAlign:'center' }}><span className="badge badge-neutral">{c.total}</span></td>
                            <td style={{ textAlign:'center' }}><span className="badge badge-success">{c.present}</span></td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:130 }}>
                                <div style={{ flex:1, height:5, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
                                  <div style={{ height:'100%', width:`${c.percentage}%`, borderRadius:99, background: c.percentage>=85?'#06D6A0':c.percentage>=75?'#F59E0B':'#EF4444' }} />
                                </div>
                                <AttendanceBadge percent={c.percentage} />
                              </div>
                            </td>
                            <td>{c.percentage >= 80 ? <span style={{ color:'#06D6A0', display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem' }}><TrendingUp size={14} /> Good</span> : <span style={{ color:'#EF4444', display:'flex', alignItems:'center', gap:4, fontSize:'0.8rem' }}><TrendingDown size={14} /> Low</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
