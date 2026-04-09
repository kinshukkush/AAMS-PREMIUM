import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, GraduationCap, BookOpen, AlertTriangle, Activity } from 'lucide-react';
import { StatCard, PageHeader, Card, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

const PIE_COLORS = ['#4F6EF7','#06D6A0','#F59E0B','#EF4444','#7C3AED'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [atRiskRes, notifsRes, deptRes, summaryRes] = await Promise.all([
          apiClient.get('/attendance/analytics/at-risk?threshold=75'),
          apiClient.get('/users/notifications'),
          apiClient.get('/attendance/analytics/department'),
          apiClient.get('/reports/summary'),
        ]);
        setAtRisk(atRiskRes.data?.students || []);
        setNotifications(notifsRes.data?.notifications || []);
        setDeptStats(deptRes.data?.stats || []);
        setMonthlySummary(summaryRes.data?.summary || {});
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Also load user counts
  const [userCounts, setUserCounts] = useState({ students: 0, faculty: 0 });
  useEffect(() => {
    Promise.all([
      apiClient.get('/users?role=student&limit=1'),
      apiClient.get('/users?role=faculty&limit=1'),
    ]).then(([s, f]) => {
      setUserCounts({
        students: s.data?.pagination?.total || 0,
        faculty: f.data?.pagination?.total || 0,
      });
    }).catch(() => {});
  }, []);

  if (loading) return <LoadingSpinner />;

  const avgPercent = monthlySummary?.percentage ?? 0;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="System Overview"
        description={`Welcome back! — ${new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`}
      />

      <div className="stats-grid stagger">
        <StatCard title="Total Students" value={userCounts.students.toLocaleString()} icon={GraduationCap} color="primary" subtitle="Across all departments" />
        <StatCard title="Faculty Members" value={userCounts.faculty.toLocaleString()} icon={Users} color="purple" subtitle="Active this semester" />
        <StatCard title="Avg Attendance" value={`${avgPercent}%`} icon={Activity} color="success" subtitle="College-wide" />
        <StatCard title="At-Risk Students" value={atRisk.length} icon={AlertTriangle} color="danger" subtitle="Below 75% threshold" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Department chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:4 }}>Department Attendance</h3>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>Average by department this semester</p>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptStats.map(d => ({ dept: d.deptInfo?.code || 'N/A', avg: d.percentage }))} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:10, fontSize:12 }} formatter={v => [`${v}%`,'Avg']} />
                <Bar dataKey="avg" radius={[6,6,0,0]}>
                  {deptStats.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)' }}>No department data yet</div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <h3 style={{ fontSize:'1rem', fontWeight:700 }}>Recent Alerts</h3>
            <a href="/admin/notifications" style={{ fontSize:'0.8rem', color:'var(--brand-primary)', textDecoration:'none' }}>View all</a>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {notifications.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:'0.875rem' }}>No notifications</div>
            )}
            {notifications.slice(0, 5).map(n => (
              <div key={n._id} style={{
                display:'flex', gap:12, padding:'10px 12px',
                borderRadius:'var(--radius-md)',
                background: n.isRead ? 'transparent' : 'var(--bg-hover)',
                border:`1px solid ${n.isRead ? 'transparent' : 'var(--border-color)'}`,
              }}>
                <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  background: n.type === 'low_attendance' ? 'rgba(245,158,11,0.15)' : 'rgba(79,110,247,0.15)', fontSize:14 }}>
                  {n.type === 'low_attendance' ? '⚠️' : 'ℹ️'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.8125rem', fontWeight:600, marginBottom:2 }}>{n.title}</div>
                  <div style={{ fontSize:'0.775rem', color:'var(--text-secondary)', marginBottom:4, lineHeight:1.4 }}>{n.message}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                </div>
                {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#4F6EF7', flexShrink:0, marginTop:3 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Students */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:'1rem', fontWeight:700 }}>⚠️ At-Risk Students</h3>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>Students below 75% attendance threshold</p>
          </div>
          <a href="/admin/reports" style={{ fontSize:'0.8rem', color:'var(--brand-primary)', textDecoration:'none' }}>Full report</a>
        </div>
        {atRisk.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}>🎉 No at-risk students currently</div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Roll No</th><th>Course</th><th>Attendance</th><th>Status</th></tr></thead>
              <tbody>
                {atRisk.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight:500 }}>{s.student?.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.student?.email}</div>
                    </td>
                    <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{s.student?.rollNo || '—'}</span></td>
                    <td><span className="badge badge-info">{s.course?.name}</span></td>
                    <td><AttendanceBadge percent={s.percentage} /></td>
                    <td><span className={`badge ${s.percentage < 60 ? 'badge-danger' : 'badge-warning'}`}>{s.percentage < 60 ? '🚨 Critical' : '⚠️ At Risk'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
