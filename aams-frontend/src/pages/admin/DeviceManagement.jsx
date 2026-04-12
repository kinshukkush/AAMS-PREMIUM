import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Smartphone, Shield, Wifi, RefreshCw } from 'lucide-react';

export default function DeviceManagement() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Device Management</h1>
          <p>Register and authorize mobile devices for face recognition access.</p>
        </div>
        <button className="btn btn-primary"><Smartphone size={15}/> Register Device</button>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <Shield size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--success)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Authorized Devices</h3>
        <p style={{ color: 'var(--text-muted)' }}>Manage strict hardware-binding to prevent spoofing.</p>
      </motion.div>
    </motion.div>
  );
}
