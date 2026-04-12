import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Settings, User } from 'lucide-react';

export default function ParentProfile() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Profile Settings</h1>
          <p>Manage your account, notification preferences, and child mappings.</p>
        </div>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <User size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--info)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Account Configuration</h3>
        <p style={{ color: 'var(--text-muted)' }}>Profile features coming soon.</p>
      </motion.div>
    </motion.div>
  );
}
