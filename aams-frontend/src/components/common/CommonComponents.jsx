// ===== COMMON REUSABLE COMPONENTS =====

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendValue }) {
  return (
    <div className={`stat-card ${color} animate-slideUp`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: colorBg(color), display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={20} color={colorVal(color)} />
          </div>
        )}
      </div>
      {subtitle && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{subtitle}</div>}
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
          <span style={{ fontSize: '0.75rem', color: trendValue >= 0 ? '#06D6A0' : '#EF4444', fontWeight: 600 }}>
            {trendValue >= 0 ? '↑' : '↓'} {Math.abs(trendValue)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trend}</span>
        </div>
      )}
    </div>
  );
}

function colorBg(color) {
  const map = {
    primary: 'rgba(79, 110, 247, 0.12)',
    success: 'rgba(6, 214, 160, 0.12)',
    warning: 'rgba(245, 158, 11, 0.12)',
    danger: 'rgba(239, 68, 68, 0.12)',
    purple: 'rgba(124, 58, 237, 0.12)',
  };
  return map[color] || map.primary;
}

function colorVal(color) {
  const map = {
    primary: '#4F6EF7', success: '#06D6A0',
    warning: '#F59E0B', danger: '#EF4444', purple: '#7C3AED',
  };
  return map[color] || map.primary;
}

export function Badge({ type = 'neutral', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

export function AttendanceBadge({ percent }) {
  if (percent >= 85) return <span className="badge badge-success">{percent}%</span>;
  if (percent >= 75) return <span className="badge badge-warning">{percent}%</span>;
  return <span className="badge badge-danger">{percent}%</span>;
}

export function AttendanceBar({ percent }) {
  const cls = percent >= 85 ? 'high' : percent >= 75 ? 'medium' : 'low';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className={`progress-fill ${cls}`} style={{ width: `${percent}%` }} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: 36,
        color: percent >= 85 ? '#06D6A0' : percent >= 75 ? '#F59E0B' : '#EF4444'
      }}>{percent}%</span>
    </div>
  );
}

export function StatusDot({ status }) {
  return <span className={`status-dot ${status}`} />;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ fontSize: '1.2rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-bar" style={{ maxWidth: 320 }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M6 11C8.76 11 11 8.76 11 6C11 3.24 8.76 1 6 1C3.24 1 1 3.24 1 6C1 8.76 3.24 11 6 11Z" stroke="var(--text-muted)" strokeWidth="1.5"/>
        <path d="M14 14L10 10" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {Icon && <Icon size={24} color="var(--text-muted)" />}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{title}</div>
      {description && <p style={{ fontSize: '0.875rem', maxWidth: 360 }}>{description}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: '2.5px solid var(--border-color)',
        borderTopColor: 'var(--brand-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={{ padding: 24, ...style }}>
      {children}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button key={tab.id} className={`tab ${active === tab.id ? 'active' : ''}`} onClick={() => onChange(tab.id)}>
          {tab.label}
          {tab.count !== undefined && (
            <span style={{ marginLeft: 6, background: active === tab.id ? 'var(--brand-primary)' : 'var(--bg-surface-2)',
              color: active === tab.id ? 'white' : 'var(--text-muted)',
              padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700
            }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function MethodBadge({ method }) {
  const map = {
    face: { label: '🧠 Face', class: 'badge-info' },
    qr: { label: '📱 QR', class: 'badge-success' },
    manual: { label: '✍️ Manual', class: 'badge-neutral' },
  };
  const m = map[method] || { label: method, class: 'badge-neutral' };
  return <span className={`badge ${m.class}`}>{m.label}</span>;
}
