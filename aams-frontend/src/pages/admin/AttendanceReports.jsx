import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { PageHeader, Tabs, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function AttendanceReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [atRisk, setAtRisk] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [summary, setSummary] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [riskRes, deptRes, sumRes, stuRes] = await Promise.all([
          apiClient.get('/attendance/analytics/at-risk?threshold=75'),
          apiClient.get('/attendance/analytics/department'),
          apiClient.get('/reports/summary'),
          apiClient.get('/users?role=student&limit=100'),
        ]);
        setAtRisk(riskRes.data?.students || []);
        setDeptStats(deptRes.data?.stats || []);
        setSummary(sumRes.data?.summary || {});
        setAllStudents(stuRes.data?.users || []);
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/reports/excel', { responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a'); a.href = url;
      a.download = `attendance_report_${Date.now()}.xlsx`; a.click();
      window.URL.revokeObjectURL(url);
    } catch(err) { alert('Export failed: ' + err.message); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner />;

  const chartData = deptStats.map(d => ({
    dept: d.deptInfo?.code || 'N/A',
    avg: d.percentage || 0,
  }));

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Attendance Reports"
        description="College-wide attendance analytics and exportable reports"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleExportExcel} disabled={exporting}>
            <Download size={14} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        }
      />

      <Tabs
        tabs={[{ id:'overview', label:'Overview' }, { id:'students', label:'Student Report' }, { id:'atrisk', label:'At Risk', count:atRisk.length }]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {[
              { label:'Total Classes', value: summary.total || 0, color:'#4F6EF7' },
              { label:'Total Present', value: summary.present || 0, color:'#06D6A0' },
              { label:'Total Absent', value: summary.absent || 0, color:'#EF4444' },
              { label:'Avg Attendance', value: `${summary.percentage || 0}%`, color:'#7C3AED' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:'1.8rem', fontWeight:800, fontFamily:'var(--font-display)', color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:24 }}>
            <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>Department-wise Average</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize:12, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background:'var(--bg-surface)', border:'1px solid var(--border-color)', borderRadius:10 }} formatter={v => [`${v}%`,'Avg']} />
                  <Bar dataKey="avg" fill="#7C3AED" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No department data yet</div>}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card" style={{ padding:24 }}>
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Roll No</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>
                {allStudents.map(s => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight:500 }}>{s.name}</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.email}</div></td>
                    <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{s.studentProfile?.rollNo || '—'}</span></td>
                    <td><span className="badge badge-info">{s.department?.code || '—'}</span></td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
                {allStudents.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No students</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'atrisk' && (
        <div className="card" style={{ padding:24 }}>
          {atRisk.length === 0 ? (
            <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>🎉 No at-risk students</div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Student</th><th>Roll No</th><th>Course</th><th>Attendance</th><th>Status</th></tr></thead>
                <tbody>
                  {atRisk.map((s,i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight:500 }}>{s.student?.name}</div><div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.student?.email}</div></td>
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
      )}
    </div>
  );
}
