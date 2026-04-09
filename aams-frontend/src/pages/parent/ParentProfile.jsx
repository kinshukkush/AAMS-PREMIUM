import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/CommonComponents';
import { User, Mail, Phone, Heart } from 'lucide-react';

export default function ParentProfile() {
  const { user } = useAuth();
  return (
    <div className="animate-fadeIn">
      <PageHeader title="My Profile" description="Your account and linked student information" />
      <div className="grid-2">
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.6rem', margin: '0 auto 16px' }}>{user?.avatar}</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
          <span className="badge role-parent">Parent / Guardian</span>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(6,214,160,0.06)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Heart size={14} color="#06D6A0" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06D6A0' }}>Linked Student</span>
            </div>
            <div style={{ fontWeight: 700 }}>Siddharth Malik</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CSE2021001 · B.Tech CSE 2021</div>
          </div>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: User, label: 'Full Name', value: user?.name },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Phone, label: 'Phone', value: '+91 98765 43200' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={12} /> {label}</label>
                <input className="input" defaultValue={value} readOnly style={{ opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
