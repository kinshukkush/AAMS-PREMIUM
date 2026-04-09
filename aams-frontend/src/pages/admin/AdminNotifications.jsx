import { useState, useEffect } from 'react';
import { Send, CheckCheck } from 'lucide-react';
import { PageHeader, Tabs, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendForm, setSendForm] = useState({ recipientType:'all_students', type:'announcement', title:'', message:'', viaEmail:true, viaApp:true });
  const [sending, setSending] = useState(false);

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

  const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) return alert('Title and message required');
    setSending(true);
    try {
      // Get recipients based on type
      let recipientsRes;
      if (sendForm.recipientType === 'all_students') {
        recipientsRes = await apiClient.get('/users?role=student&limit=500');
      } else if (sendForm.recipientType === 'all_faculty') {
        recipientsRes = await apiClient.get('/users?role=faculty&limit=500');
      } else {
        // at_risk — get from analytics
        const riskRes = await apiClient.get('/attendance/analytics/at-risk');
        const uniqueIds = [...new Set((riskRes.data?.students || []).map(s => s.student?._id).filter(Boolean))];
        await apiClient.post('/notifications/send', { recipients: uniqueIds, type: sendForm.type, title: sendForm.title, message: sendForm.message });
        alert('Sent successfully!');
        setSendForm(f => ({ ...f, title:'', message:'' }));
        setSending(false);
        return;
      }
      const users = recipientsRes.data?.users || [];
      const ids = users.map(u => u._id);
      await apiClient.post('/notifications/send', { recipients: ids, type: sendForm.type, title: sendForm.title, message: sendForm.message });
      alert(`Sent to ${ids.length} users successfully!`);
      setSendForm(f => ({ ...f, title:'', message:'' }));
    } catch(err) { alert(err.message || 'Send failed'); }
    finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner />;
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Notifications"
        description="System alerts and bulk notification management"
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}><CheckCheck size={14} /> Mark All Read</button>
          </div>
        }
      />

      <Tabs
        tabs={[{ id:'inbox', label:'Inbox', count:unread }, { id:'send', label:'Send Bulk' }]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'inbox' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {notifications.length === 0 && <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No notifications</div>}
          {notifications.map(n => (
            <div key={n._id} className="card" style={{
              padding:'16px 20px', display:'flex', gap:14,
              borderLeft:`4px solid ${n.type==='low_attendance'?'#F59E0B':n.type==='system_alert'?'#EF4444':'#4F6EF7'}`,
              opacity: n.isRead ? 0.7 : 1,
            }}>
              <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface-2)', fontSize:16 }}>
                {n.type==='low_attendance'?'⚠️':n.type==='system_alert'?'🚨':'ℹ️'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontWeight:700 }}>{n.title}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'#4F6EF7' }} />}
                  </div>
                </div>
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'send' && (
        <div className="card" style={{ padding:32, maxWidth:600 }}>
          <h3 style={{ fontWeight:700, marginBottom:20 }}>Send Bulk Notification</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="input-group"><label className="input-label">Recipients</label>
              <select className="input" value={sendForm.recipientType} onChange={e => setSendForm({...sendForm, recipientType:e.target.value})}>
                <option value="all_students">All Students</option>
                <option value="all_faculty">All Faculty</option>
                <option value="at_risk">At-Risk Students (below 75%)</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Type</label>
              <select className="input" value={sendForm.type} onChange={e => setSendForm({...sendForm, type:e.target.value})}>
                <option value="low_attendance">Attendance Warning</option>
                <option value="announcement">General Announcement</option>
                <option value="exam_alert">Exam Alert</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Title</label>
              <input className="input" placeholder="Notification title" value={sendForm.title} onChange={e => setSendForm({...sendForm, title:e.target.value})} />
            </div>
            <div className="input-group"><label className="input-label">Message</label>
              <textarea className="input" rows={4} placeholder="Enter notification message..." value={sendForm.message} onChange={e => setSendForm({...sendForm, message:e.target.value})} style={{ resize:'vertical' }} />
            </div>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              <Send size={15} /> {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
