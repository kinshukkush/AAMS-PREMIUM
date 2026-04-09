import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Clock, AlertTriangle, Play } from 'lucide-react';
import { StatCard, PageHeader, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ttRes, stuRes, riskRes, sessRes] = await Promise.all([
          apiClient.get('/timetable'),
          apiClient.get('/users/students/my-class'),
          apiClient.get('/attendance/analytics/at-risk?threshold=75'),
          apiClient.get('/attendance/sessions?limit=8'),
        ]);
        setTimetable(ttRes.data?.timetable || []);
        setStudents(stuRes.data?.students || []);
        setAtRisk(riskRes.data?.students || []);
        setSessions(sessRes.data?.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const today = new Date().toLocaleDateString('en-US', { weekday:'long' });
  const todayClasses = timetable.filter(t => t.dayOfWeek === today);

  // Build weekly data from sessions
  const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    week: day,
    present: sessions.filter(s => new Date(s.date).toLocaleDateString('en-US',{weekday:'short'}) === day)
                     .reduce((a,s) => a + s.presentCount, 0),
  }));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Faculty Dashboard"
        description={`Good morning, ${user?.name}!`}
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/faculty/mark-attendance')}>
            <Play size={15} /> Start Attendance
          </button>
        }
      />

      <div className="stats-grid stagger">
        <StatCard title="My Students" value={students.length} icon={Users} color="primary" subtitle="Enrolled this semester" />
        <StatCard title="Today's Classes" value={todayClasses.length} icon={Clock} color="purple" subtitle="Scheduled today" />
        <StatCard title="Sessions Run" value={sessions.length} icon={BookOpen} color="success" subtitle="Total this semester" />
        <StatCard title="At-Risk Students" value={atRisk.length} icon={AlertTriangle} color="danger" subtitle="Below 75% threshold" />
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Today's schedule */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontSize:'1rem', fontWeight:700 }}>Today's Schedule ({today})</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/faculty/timetable')}>View all</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {todayClasses.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)', fontSize:'0.875rem' }}>🎉 No classes today</div>
            ) : todayClasses.map(cls => (
              <div key={cls._id} style={{ display:'flex', gap:14, padding:'12px 14px', borderRadius:'var(--radius-md)', background:'var(--bg-surface-2)', border:'1px solid var(--border-color)', alignItems:'center' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{cls.course?.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{cls.batch} Sec {cls.section} · {cls.room}</div>
                </div>
                <div style={{ textAlign:'right', marginRight:8 }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{cls.startTime}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{cls.endTime}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/faculty/mark-attendance')}>
                  <Play size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trend */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:4 }}>Weekly Sessions</h3>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>Students present per session this week</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="week" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:10, fontSize:12 }} />
              <Line type="monotone" dataKey="present" stroke="#4F6EF7" strokeWidth={2.5} dot={{ fill:'#4F6EF7', r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Students Overview */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ fontSize:'1rem', fontWeight:700 }}>My Students</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/faculty/analytics')}>Full Analytics</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Student</th><th>Roll No</th><th>Section</th><th>Face Registered</th></tr></thead>
            <tbody>
              {students.slice(0, 10).map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="avatar" style={{ width:30, height:30, fontSize:'0.7rem', background:'var(--gradient-brand)', flexShrink:0 }}>
                        {s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span style={{ fontWeight:500, fontSize:'0.875rem' }}>{s.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--text-secondary)' }}>{s.studentProfile?.rollNo || '—'}</span></td>
                  <td>{s.studentProfile?.section ? <span className="badge badge-info">Sec {s.studentProfile.section}</span> : '—'}</td>
                  <td><span className={`badge ${s.faceRegistered ? 'badge-success' : 'badge-warning'}`}>{s.faceRegistered ? '✅ Yes' : '⚠️ No'}</span></td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No students assigned yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
