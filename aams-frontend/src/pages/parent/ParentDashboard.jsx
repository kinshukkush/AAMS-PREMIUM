import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Heart, AlertTriangle, BookOpen, TrendingUp } from 'lucide-react';
import { StatCard, PageHeader, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState(null);

  useEffect(() => {
    // Get child ID from parent profile
    const linked = user?.parentProfile?.linkedStudent;
    const cid = linked?._id || linked?.id || (typeof linked === 'string' ? linked : null);
    setChildId(cid);
  }, [user]);

  useEffect(() => {
    if (!childId) { setLoading(false); return; }
    apiClient.get(`/attendance/student/${childId}/summary`)
      .then(res => {
        setSummary(res.data?.summary || []);
        setOverall(res.data?.overall || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [childId]);

  const childName = user?.parentProfile?.linkedStudent?.name || 'Your Child';
  const totalPresent = summary.reduce((a,c) => a + (c.present||0), 0);
  const totalClasses = summary.reduce((a,c) => a + (c.total||0), 0);
  const atRisk = summary.filter(c => c.percentage < 75).length;

  const pieData = [
    { name:'Present', value: totalPresent, color:'#06D6A0' },
    { name:'Absent', value: totalClasses - totalPresent, color:'#EF4444' },
  ].filter(d => d.value > 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Parent Dashboard" description={`Tracking attendance for ${childName}`} />

      {/* Child Banner */}
      <div className="card" style={{ padding:'20px 24px', marginBottom:24,
        background:'linear-gradient(135deg,rgba(79,110,247,0.08) 0%,rgba(124,58,237,0.08) 100%)',
        border:'1px solid rgba(79,110,247,0.2)', display:'flex', gap:16, alignItems:'center' }}>
        <div className="avatar" style={{ width:56, height:56, fontSize:'1.1rem', flexShrink:0, background:'var(--gradient-brand)' }}>
          {childName?.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:4 }}>{childName}</h2>
          <AttendanceBadge percent={overall} />
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'2.5rem', fontWeight:900, fontFamily:'var(--font-display)',
            color: overall >= 85?'#06D6A0':overall>=75?'#F59E0B':'#EF4444', lineHeight:1 }}>{overall}%</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:4 }}>Overall Attendance</div>
        </div>
      </div>

      {atRisk > 0 && (
        <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--radius-lg)', padding:'14px 20px', marginBottom:20, display:'flex', gap:10 }}>
          <AlertTriangle size={18} color="#EF4444" style={{ flexShrink:0, marginTop:1 }} />
          <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)' }}>
            <strong style={{ color:'#EF4444' }}>Attention:</strong> {childName} has {atRisk} course(s) below the 75% minimum threshold.
          </span>
        </div>
      )}

      <div className="stats-grid stagger">
        <StatCard title="Overall Attendance" value={`${overall}%`} icon={Heart} color="primary" subtitle="This semester" />
        <StatCard title="Subjects Enrolled" value={summary.length} icon={BookOpen} color="purple" subtitle="This semester" />
        <StatCard title="Classes Attended" value={totalPresent} icon={TrendingUp} color="success" subtitle={`Out of ${totalClasses}`} />
        <StatCard title="At-Risk Subjects" value={atRisk} icon={AlertTriangle} color={atRisk>0?'danger':'success'} subtitle="Below 75%" />
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Attendance Split</h3>
          {pieData.length > 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {pieData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:8, fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display:'flex', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
                      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight:700, color:d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>No data yet</div>}
        </div>
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Subject-wise Details</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {summary.slice(0,5).map(c => (
              <div key={c.course?._id} style={{ display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.course?.name}</span>
                <div style={{ width:80, height:5, background:'var(--bg-surface-2)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${c.percentage}%`, background: c.percentage<75?'#EF4444':c.percentage>=85?'#06D6A0':'#F59E0B' }} />
                </div>
                <AttendanceBadge percent={c.percentage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}