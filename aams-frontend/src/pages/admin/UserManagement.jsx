import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, Download } from 'lucide-react';
import { PageHeader, SearchBar, Modal, Tabs, AttendanceBadge, LoadingSpinner } from '../../components/common/CommonComponents';
import { apiClient } from '../../context/AuthContext';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('students');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'student', rollNo:'', batch:'' });
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ students: {}, faculty: {} });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        apiClient.get('/users', { params: { role:'student', search, limit:50 } }),
        apiClient.get('/users', { params: { role:'faculty', search, limit:50 } }),
      ]);
      setStudents(sRes.data?.users || []);
      setFaculty(fRes.data?.users || []);
      setPagination({ students: sRes.data?.pagination || {}, faculty: fRes.data?.pagination || {} });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [search]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await apiClient.post('/users', {
        ...form,
        studentProfile: form.role === 'student' ? { rollNo: form.rollNo, batch: form.batch } : undefined,
      });
      setShowAddModal(false);
      setForm({ name:'', email:'', phone:'', role:'student', rollNo:'', batch:'' });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to deactivate');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="User Management"
        description="Manage all students, faculty, and admin accounts"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Download size={15} /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <UserPlus size={15} /> Add User
            </button>
          </>
        }
      />

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
        {[
          { label:'Total Students', value: pagination.students.total || students.length, color:'#4F6EF7' },
          { label:'Total Faculty', value: pagination.faculty.total || faculty.length, color:'#7C3AED' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding:'16px 20px', borderTop:`3px solid ${c.color}` }}>
            <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-display)', color:c.color }}>{c.value}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll no..." />
        </div>

        <Tabs
          tabs={[
            { id:'students', label:'Students', count: students.length },
            { id:'faculty', label:'Faculty', count: faculty.length },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'students' && (
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Roll No</th><th>Batch</th><th>Section</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar" style={{ width:32, height:32, fontSize:'0.75rem', background:'var(--gradient-brand)', flexShrink:0 }}>
                          {s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{s.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--text-secondary)' }}>{s.studentProfile?.rollNo || '—'}</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{s.studentProfile?.batch || '—'}</td>
                    <td>{s.studentProfile?.section ? <span className="badge badge-info">Sec {s.studentProfile.section}</span> : '—'}</td>
                    <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedUser(s)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--brand-danger)' }} onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No students found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="table-container">
            <table>
              <thead><tr><th>Faculty</th><th>Emp Code</th><th>Designation</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {faculty.map(f => (
                  <tr key={f._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar" style={{ width:32, height:32, fontSize:'0.75rem', background:'linear-gradient(135deg,#7C3AED,#4F6EF7)', flexShrink:0 }}>
                          {f.name?.split(' ').filter(n=>n!=='Prof.').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{f.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{f.facultyProfile?.employeeCode || '—'}</span></td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{f.facultyProfile?.designation || '—'}</td>
                    <td><span className={`badge ${f.isActive ? 'badge-success' : 'badge-danger'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedUser(f)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--brand-danger)' }} onClick={() => handleDelete(f._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="Enter full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input className="input" type="email" placeholder="email@lpu.edu" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input className="input" placeholder="10-digit mobile" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
          </div>
          {form.role === 'student' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="input-group">
                <label className="input-label">Roll Number</label>
                <input className="input" placeholder="CSE2021001" value={form.rollNo} onChange={e => setForm({...form, rollNo:e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Batch</label>
                <input className="input" placeholder="B.Tech CSE 2021" value={form.batch} onChange={e => setForm({...form, batch:e.target.value})} />
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create User'}</button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center', padding:14, background:'var(--bg-surface-2)', borderRadius:'var(--radius-md)' }}>
              <div className="avatar" style={{ width:48, height:48, fontSize:'1rem' }}>
                {selectedUser.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <div style={{ fontWeight:700 }}>{selectedUser.name}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{selectedUser.email}</div>
                <span className={`badge role-${selectedUser.role}`} style={{ marginTop:4, display:'inline-block' }}>{selectedUser.role}</span>
              </div>
            </div>
            {[
              ['Roll No / Emp Code', selectedUser.studentProfile?.rollNo || selectedUser.facultyProfile?.employeeCode || '—'],
              ['Phone', selectedUser.phone || '—'],
              ['Status', selectedUser.isActive ? 'Active' : 'Inactive'],
              ['Registered', new Date(selectedUser.createdAt).toLocaleDateString('en-IN')],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-color)', fontSize:'0.875rem' }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
            <button className="btn btn-primary" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
