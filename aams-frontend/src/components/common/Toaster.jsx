import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: '12px 16px',
            boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10,
            animation: 'slideIn 0.25s ease', minWidth: 280, maxWidth: 380,
            borderLeft: `4px solid ${t.type === 'success' ? '#06D6A0' : t.type === 'error' ? '#EF4444' : t.type === 'warning' ? '#F59E0B' : '#4F6EF7'}`
          }}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function Toaster() {
  return null; // Handled by ToastProvider when wrapped in App
}
