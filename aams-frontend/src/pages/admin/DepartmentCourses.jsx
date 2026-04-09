import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, Tabs, Modal, SearchBar, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function DepartmentCourses() {
  const [activeTab, setActiveTab] = useState('departments');
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'', code:'' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/courses'),
      ]);
      setDepartments(dRes.data?.departments || []);
      setCourses(cRes.data?.courses || []);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'departments') await apiClient.post('/departments', form);
      else await apiClient.post('/courses', form);
      setShowModal(false);
      setForm({ name:'', code:'' });
      load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Delete this item?')) return;
    try {
      if (type === 'dept') await apiClient.delete(`/departments/${id}`);
      else await apiClient.delete(`/courses/${id}`);
      load();
    } catch(err) { alert(err.message); }
  };

  if (loading) return <LoadingSpinner />;

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Departments & Courses"
        description="Manage academic departments and courses"
        actions={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add New</button>}
      />

      <Tabs
        tabs={[{ id:'departments', label:'Departments', count:departments.length }, { id:'courses', label:'Courses', count:courses.length }]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'departments' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {departments.map(d => (
            <div key={d._id} className="card" style={{ padding:22 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ width:42, height:42, borderRadius:'var(--radius-md)', background:'var(--gradient-brand)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'0.8rem' }}>{d.code}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(d._id, 'dept')} style={{ color:'var(--brand-danger)' }}><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:4 }}>{d.name}</h3>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>HOD: {d.hodName || '—'}</p>
            </div>
          ))}
          {departments.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'var(--text-muted)' }}>No departments yet</div>}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ marginBottom:16 }}><SearchBar value={search} onChange={setSearch} placeholder="Search courses..." /></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Course Name</th><th>Department</th><th>Semester</th><th>Credits</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c._id}>
                    <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'#4F6EF7', fontWeight:700 }}>{c.code}</span></td>
                    <td style={{ fontWeight:500 }}>{c.name}</td>
                    <td><span className="badge badge-info">{c.department?.code || '—'}</span></td>
                    <td style={{ textAlign:'center' }}>{c.semester}</td>
                    <td style={{ textAlign:'center' }}>{c.credits}</td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--brand-danger)' }} onClick={() => handleDelete(c._id, 'course')}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No courses found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Add ${activeTab === 'departments' ? 'Department' : 'Course'}`}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="input-group"><label className="input-label">Name</label><input className="input" placeholder="Enter name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
          <div className="input-group"><label className="input-label">Code</label><input className="input" placeholder="e.g. CSE or CSE301" value={form.code} onChange={e => setForm({...form, code:e.target.value})} /></div>
          {activeTab === 'courses' && (
            <>
              <div className="input-group">
                <label className="input-label">Department</label>
                <select className="input" value={form.department || ''} onChange={e => setForm({...form, department:e.target.value})}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="input-group"><label className="input-label">Semester</label><input className="input" type="number" min={1} max={12} placeholder="5" value={form.semester || ''} onChange={e => setForm({...form, semester:e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Credits</label><input className="input" type="number" min={1} max={6} placeholder="4" value={form.credits || ''} onChange={e => setForm({...form, credits:e.target.value})} /></div>
              </div>
            </>
          )}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
