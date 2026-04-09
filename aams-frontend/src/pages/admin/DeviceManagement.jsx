import { useState, useEffect } from 'react';
import { Monitor, Plus, RefreshCw } from 'lucide-react';
import { PageHeader, Modal, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', type:'webcam', location:'', ipAddress:'' });
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(null);

  const load = async () => {
    try {
      const res = await apiClient.get('/devices');
      setDevices(res.data?.devices || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRegister = async () => {
    setSaving(true);
    try {
      await apiClient.post('/devices', form);
      setShowModal(false);
      setForm({ name:'', type:'webcam', location:'', ipAddress:'' });
      load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handlePing = async (id) => {
    setPinging(id);
    try {
      await apiClient.post(`/devices/${id}/ping`);
      load();
    } catch(err) { alert('Ping failed'); }
    finally { setPinging(null); }
  };

  if (loading) return <LoadingSpinner />;

  const active = devices.filter(d => d.status === 'active').length;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Device Management"
        description="Manage cameras and IoT devices used for attendance capture"
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Register Device</button>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Devices', value:devices.length, color:'#4F6EF7' },
          { label:'Online', value:active, color:'#06D6A0' },
          { label:'Offline', value:devices.length - active, color:'#EF4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:'1.8rem', fontWeight:800, fontFamily:'var(--font-display)', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {devices.map(d => (
          <div key={d._id} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:'var(--radius-md)',
                background: d.status==='active'?'rgba(6,214,160,0.1)':'rgba(239,68,68,0.1)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Monitor size={20} color={d.status==='active'?'#06D6A0':'#EF4444'} />
              </div>
              <span className={`badge ${d.status==='active'?'badge-success':'badge-danger'}`}>
                {d.status==='active'?'🟢 Online':'🔴 Offline'}
              </span>
            </div>
            <h3 style={{ fontWeight:700, marginBottom:4 }}>{d.name}</h3>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:12 }}>{d.location}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:'0.78rem', color:'var(--text-secondary)' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}><span>Type</span><span>{d.type}</span></div>
              {d.ipAddress && <div style={{ display:'flex', justifyContent:'space-between' }}><span>IP</span><span style={{ fontFamily:'monospace' }}>{d.ipAddress}</span></div>}
              {d.lastPing && <div style={{ display:'flex', justifyContent:'space-between' }}><span>Last ping</span><span style={{ color:'#06D6A0' }}>{new Date(d.lastPing).toLocaleTimeString('en-IN')}</span></div>}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={() => handlePing(d._id)} disabled={pinging === d._id}>
                <RefreshCw size={12} /> {pinging === d._id ? 'Pinging...' : 'Ping'}
              </button>
            </div>
          </div>
        ))}
        {devices.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--text-muted)' }}>No devices registered yet</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Device">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group"><label className="input-label">Device Name</label><input className="input" placeholder="Cam-CR201" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="input-group"><label className="input-label">Device Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
              <option value="ip_camera">IP Camera</option><option value="webcam">Webcam</option>
              <option value="ptz_camera">PTZ Camera</option><option value="edge_device">Edge Device</option>
            </select>
          </div>
          <div className="input-group"><label className="input-label">Location</label><input className="input" placeholder="Classroom 201, Block A" value={form.location} onChange={e => setForm({...form, location:e.target.value})} /></div>
          <div className="input-group"><label className="input-label">IP Address</label><input className="input" placeholder="192.168.1.101" value={form.ipAddress} onChange={e => setForm({...form, ipAddress:e.target.value})} /></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRegister} disabled={saving}>{saving ? 'Registering...' : 'Register'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
