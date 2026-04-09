import { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiClient.get('/users/notifications');
      setNotifications(res.data?.notifications || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await apiClient.put('/users/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch(err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Notifications"
        description="Attendance alerts and system updates"
        actions={<button className="btn btn-secondary btn-sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</button>}
      />
      {notifications.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>🎉 No notifications</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {notifications.map(n => (
            <div key={n._id} className="card" style={{
              padding:'16px 20px', display:'flex', gap:14, alignItems:'flex-start',
              borderLeft:`4px solid ${n.type==='low_attendance'?'#F59E0B':n.type==='system_alert'?'#EF4444':'#4F6EF7'}`,
              opacity: n.isRead ? 0.75 : 1,
            }}>
              <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: n.type==='low_attendance'?'rgba(245,158,11,0.1)':'rgba(79,110,247,0.1)', fontSize:16 }}>
                {n.type==='low_attendance'?'⚠️':n.type==='system_alert'?'🚨':'ℹ️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{n.title}</span>
                  {!n.isRead && <span style={{ width:8, height:8, borderRadius:'50%', background:'#4F6EF7', flexShrink:0, marginTop:4 }} />}
                </div>
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:6, lineHeight:1.5 }}>{n.message}</p>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
