import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight,
  Download, Users, CheckSquare, Square, ToggleLeft, ToggleRight,
  User, Shield, BookOpen, Heart, Filter, MoreHorizontal, Check
} from 'lucide-react';
import { fadeUp, scaleIn, stagger, slideLeft } from '../../utils/animations';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['All', 'student', 'faculty', 'admin', 'parent'];
const ROLE_ICONS = { student: User, faculty: BookOpen, admin: Shield, parent: Heart };
const ROLE_COLORS = { student: '#6C8EFF', faculty: '#A78BFA', admin: '#F87171', parent: '#34D399' };

const MOCK_USERS = Array.from({ length: 24 }, (_, i) => ({
  _id: `u${i+1}`,
  name: ['Arjun Patel','Priya Singh','Rahul Mehta','Neha Gupta','Vikram Shah','Anjali Verma','Karan Joshi','Divya Nair'][i % 8] + ` ${i+1}`,
  email: `user${i+1}@lpu.edu`,
  role: ROLES.slice(1)[i % 4],
  isActive: i % 7 !== 0,
  department: { name: ['CSE','ECE','MBA','MECH'][i % 4] },
  createdAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
  avatar: null,
}));

export default function UserManagement() {
  const [users, setUsers]           = useState(MOCK_USERS);
  const [filtered, setFiltered]     = useState(MOCK_USERS);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [formData, setFormData]     = useState({ name:'', email:'', role:'student', department:'' });

  const PER_PAGE = 8;

  /* Filter + search */
  useEffect(() => {
    let f = users;
    if (roleFilter !== 'All') f = f.filter(u => u.role === roleFilter);
    if (search) f = f.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    setFiltered(f);
    setPage(1);
  }, [users, search, roleFilter]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const handleSearch = useCallback((e) => setSearch(e.target.value), []);

  const openAddDrawer = () => {
    setEditUser(null);
    setFormData({ name:'', email:'', role:'student', department:'' });
    setDrawerOpen(true);
  };
  const openEditDrawer = (u) => {
    setEditUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, department: u.department?.name || '' });
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (editUser) {
      setUsers(us => us.map(u => u._id === editUser._id ? { ...u, ...formData } : u));
      toast.success('User updated successfully');
    } else {
      const newUser = { _id: `u${Date.now()}`, ...formData, isActive: true, department: { name: formData.department }, createdAt: new Date().toISOString() };
      setUsers(us => [newUser, ...us]);
      toast.success('User created successfully');
    }
    setLoading(false);
    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    setUsers(us => us.filter(u => u._id !== id));
    setDeleteConfirm(null);
    toast.success('User deleted');
  };

  const handleToggleActive = (id) => {
    setUsers(us => us.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    const u = users.find(x => x._id === id);
    toast.success(`${u?.name} ${u?.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleBulkDelete = () => {
    setUsers(us => us.filter(u => !selected.has(u._id)));
    toast.success(`${selected.size} user(s) deleted`);
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(u => u._id)));
  };

  const exportCSV = () => {
    const rows = [['Name','Email','Role','Status','Department'],...filtered.map(u => [u.name,u.email,u.role,u.isActive?'Active':'Inactive',u.department?.name||''])];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
    toast.success('CSV exported');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>User Management</h1>
          <p>Manage all system users — students, faculty, admins, and parents</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button id="btn-export-csv" className="btn btn-secondary" onClick={exportCSV}><Download size={15} /> Export CSV</button>
          <button id="btn-add-user" className="btn btn-primary" onClick={openAddDrawer}><Plus size={15} /> Add User</button>
        </div>
      </div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} color="var(--text-muted)" />
          <input id="user-search" type="text" placeholder="Search by name or email..." value={search} onChange={handleSearch} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ROLES.map(r => (
            <button
              key={r} id={`filter-${r}`}
              onClick={() => setRoleFilter(r)}
              className="btn btn-sm"
              style={{
                background: roleFilter === r ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: roleFilter === r ? 'white' : 'var(--text-secondary)',
                border: roleFilter === r ? 'none' : '1px solid var(--border-default)',
              }}
            >
              {r === 'All' ? 'All Users' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            id="btn-bulk-delete" className="btn btn-danger btn-sm" onClick={handleBulkDelete}
          >
            <Trash2 size={14} /> Delete {selected.size} selected
          </motion.button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible" className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <button onClick={selectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {selected.size === paginated.length && paginated.length > 0 ? <CheckSquare size={16} color="var(--accent-primary)" /> : <Square size={16} />}
                  </button>
                </th>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : paginated.map(u => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <td>
                    <button onClick={() => toggleSelect(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {selected.has(u._id) ? <CheckSquare size={16} color="var(--accent-primary)" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${ROLE_COLORS[u.role]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ROLE_COLORS[u.role], fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        {u.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.department?.name || '—'}</td>
                  <td>
                    <button
                      id={`toggle-user-${u._id}`}
                      onClick={() => handleToggleActive(u._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <div style={{ width: 40, height: 22, borderRadius: 11, background: u.isActive ? 'rgba(52,211,153,0.20)' : 'var(--bg-elevated)', border: `1px solid ${u.isActive ? 'var(--success)' : 'var(--border-default)'}`, position: 'relative', transition: 'all 0.25s' }}>
                        <motion.div animate={{ x: u.isActive ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: u.isActive ? 'var(--success)' : 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: u.isActive ? 'var(--success)' : 'var(--text-muted)' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button id={`edit-user-${u._id}`} onClick={() => openEditDrawer(u)} className="btn btn-ghost btn-icon" title="Edit user" aria-label="Edit user">
                        <Edit2 size={15} />
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button id={`delete-user-${u._id}`} onClick={() => setDeleteConfirm(u._id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} title="Delete user" aria-label="Delete user">
                          <Trash2 size={15} />
                        </button>
                        <AnimatePresence>
                          {deleteConfirm === u._id && (
                            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="popover" style={{ right: 0, top: 40 }}>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Delete {u.name}?</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>This action cannot be undone.</p>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {((page-1)*PER_PAGE)+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} users
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button id="btn-prev-page" className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} id={`btn-page-${p}`} className="btn btn-sm" onClick={() => setPage(p)}
                style={{ background: page === p ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: page === p ? 'white' : 'var(--text-secondary)', border: page === p ? 'none' : '1px solid var(--border-default)' }}
              >{p}</button>
            ))}
            <button id="btn-next-page" className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Add/Edit Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <motion.div variants={slideLeft} initial="hidden" animate="visible" exit="exit" className="drawer">
              <div className="drawer-header">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setDrawerOpen(false)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <form onSubmit={handleSave} className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="form-name">Full Name *</label>
                  <input id="form-name" className="input" type="text" placeholder="User's full name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} required />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="form-email">Email Address *</label>
                  <input id="form-email" className="input" type="email" placeholder="user@lpu.edu" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Role *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {ROLES.slice(1).map(r => {
                      const RoleIcon = ROLE_ICONS[r];
                      return (
                        <button key={r} type="button" id={`drawer-role-${r}`} onClick={() => setFormData(f => ({...f, role: r}))}
                          style={{ padding: '10px', borderRadius: 'var(--r-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, border: formData.role === r ? '1.5px solid var(--border-accent)' : '1.5px solid var(--border-default)', background: formData.role === r ? 'rgba(108,142,255,0.08)' : 'var(--bg-elevated)', transition: 'all 0.15s' }}
                        >
                          <RoleIcon size={16} color={ROLE_COLORS[r]} />
                          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{r}</span>
                          {formData.role === r && <Check size={14} color="var(--accent-primary)" style={{ marginLeft: 'auto' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="form-dept">Department</label>
                  <select id="form-dept" className="input" value={formData.department} onChange={e => setFormData(f => ({...f, department: e.target.value}))}>
                    <option value="">Select department</option>
                    {['CSE','ECE','MBA','MECH','CIVIL','IT'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </form>
              <div className="drawer-footer" style={{ display: 'flex', gap: 10 }}>
                <button id="btn-save-user" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={loading}>
                  {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</> : editUser ? 'Update User' : 'Create User'}
                </button>
                <button className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
