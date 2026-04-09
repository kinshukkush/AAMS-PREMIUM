import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BookOpen, Calendar, AlertTriangle, Award, RefreshCw } from 'lucide-react';
import { StatCard, PageHeader, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [overall, setOverall] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get student ID — backend may return either 'id' or '_id'
  const studentId = user?._id || user?.id;

  const loadData = async (isRefresh = false) => {
    // If no studentId, stop loading and show empty state — don't spin forever
    if (!studentId) {
      setLoading(false);
      setError('Could not load student profile. Please log out and log in again.');
      return;
    }

    if (isRefresh) setRefreshing(true);

    try {
      const [sumRes, recRes] = await Promise.all([
        apiClient.get(`/attendance/student/${studentId}/summary`),
        apiClient.get(`/attendance/student/${studentId}`, { params: { limit: 8 } }),
      ]);

      setSummary(sumRes.data?.summary || []);
      setOverall(sumRes.data?.overall || 0);
      setRecentRecords(recRes.data?.records || []);
      setError(null);
    } catch (err) {
      console.error('Dashboard load error:', err);
      // Don't show error for 404 — student just has no records yet
      if (err.status !== 404) {
        setError(null); // Still show empty dashboard, not error
      }
      setSummary([]);
      setOverall(0);
      setRecentRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]); // re-run if studentId changes

  // Auto-refresh every 30 seconds to pick up new attendance marks
  useEffect(() => {
    if (!studentId) return;
    const interval = setInterval(() => {
      loadData(true); // silent refresh
    }, 30000);
    return () => clearInterval(interval);
  }, [studentId]);

  if (loading) return <LoadingSpinner />;

  // Show error only if something critical failed
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
        <h3 style={{ marginBottom: 8 }}>Could not load dashboard</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => loadData()}>Try Again</button>
      </div>
    );
  }

  const totalPresent = summary.reduce((a, c) => a + (c.present || 0), 0);
  const totalClasses = summary.reduce((a, c) => a + (c.total || 0), 0);
  const totalAbsent = totalClasses - totalPresent;
  const atRiskCourses = summary.filter(c => c.percentage < 75).length;

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#06D6A0' },
    { name: 'Absent', value: totalAbsent, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]}! 👋`}
        description={`Your attendance overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        actions={
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {atRiskCourses > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-lg)', padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertTriangle size={20} color="#EF4444" />
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.9rem' }}>Attendance Warning</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              You have {atRiskCourses} course(s) below 75%. Attend more classes to avoid debarment.
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid stagger">
        <StatCard title="Overall Attendance" value={`${overall}%`} icon={Award} color="primary" subtitle="Across all subjects" />
        <StatCard title="Courses Enrolled" value={summary.length} icon={BookOpen} color="purple" subtitle="This semester" />
        <StatCard title="Classes Attended" value={totalPresent} icon={Calendar} color="success" subtitle={`Out of ${totalClasses} total`} />
        <StatCard title="At-Risk Courses" value={atRiskCourses} icon={AlertTriangle} color={atRiskCourses > 0 ? 'danger' : 'success'} subtitle="Below 75% threshold" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Pie Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Attendance Breakdown</h3>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
              <div>No attendance records yet</div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Records will appear after your first class</div>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Subject-wise %</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Attendance per course</p>
          {summary.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={summary.map(c => ({ name: c.course?.code || '?', percent: c.percentage }))} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 12 }} formatter={v => [`${v}%`, 'Attendance']} />
                <Bar dataKey="percent" fill="#4F6EF7" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Course List */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Subject-wise Attendance</h3>
        {summary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📚</div>
            <div>No attendance records yet</div>
            <div style={{ fontSize: '0.8rem', marginTop: 4, color: 'var(--text-muted)' }}>
              Records appear here after your faculty marks attendance
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {summary.map(c => (
              <div key={c.course?._id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: c.percentage < 75 ? 'rgba(239,68,68,0.1)' : 'rgba(79,110,247,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace',
                  color: c.percentage < 75 ? '#EF4444' : '#4F6EF7',
                }}>
                  {c.course?.code?.slice(-3) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{c.course?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.present}/{c.total} classes attended</div>
                </div>
                <div style={{ width: 160, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${c.percentage}%`, borderRadius: 99,
                      background: c.percentage < 75 ? '#EF4444' : c.percentage >= 85 ? '#06D6A0' : '#F59E0B',
                      transition: 'width 0.6s',
                    }} />
                  </div>
                  <AttendanceBadge percent={c.percentage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Records */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Attendance</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-refreshes every 30s</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Course</th><th>Status</th><th>Time</th><th>Method</th></tr>
            </thead>
            <tbody>
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    No records yet — attend a class to see records here
                  </td>
                </tr>
              ) : recentRecords.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(r.date).toLocaleDateString('en-IN')}
                  </td>
                  <td><span className="badge badge-info">{r.course?.name || '—'}</span></td>
                  <td>
                    <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>
                      {r.status === 'present' ? '✅ Present' : r.status === 'late' ? '⏰ Late' : '❌ Absent'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.checkInTime || '—'}</td>
                  <td>
                    <span className={`badge ${r.method === 'face' ? 'badge-info' : r.method === 'qr' ? 'badge-success' : 'badge-neutral'}`}>
                      {r.method === 'face' ? '🧠 Face' : r.method === 'qr' ? '📱 QR' : r.method === 'manual' ? '✍️ Manual' : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}