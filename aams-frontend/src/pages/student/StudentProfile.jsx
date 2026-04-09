// StudentProfile.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, BookOpen, Camera } from 'lucide-react';
import { PageHeader } from '../../components/common/CommonComponents';

export default function StudentProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  return (
    <div className="animate-fadeIn">
      <PageHeader title="My Profile" description="View and manage your personal information" />
      <div className="grid-2">
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div className="avatar" style={{ width: 100, height: 100, fontSize: '2rem', margin: '0 auto' }}>{user?.avatar}</div>
            <button style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-brand)', border: '2px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Camera size={13} color="white" />
            </button>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>{user?.rollNo}</p>
          <span className="badge role-student">{user?.role}</span>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Batch', user?.batch || 'B.Tech CSE 2021'], ['Semester', '5th Semester'], ['Section', 'Section A'], ['Department', 'Computer Science']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Personal Information</h3>
            <button className={`btn ${editing ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setEditing(!editing)}>
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: User, label: 'Full Name', value: user?.name, key: 'name' },
              { icon: Mail, label: 'Email Address', value: user?.email, key: 'email' },
              { icon: Phone, label: 'Phone', value: '9876543210', key: 'phone' },
              { icon: BookOpen, label: 'Roll Number', value: user?.rollNo || 'CSE2021001', key: 'rollNo' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={12} /> {label}
                </label>
                <input className="input" defaultValue={value} readOnly={!editing} style={{ opacity: editing ? 1 : 0.7 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
