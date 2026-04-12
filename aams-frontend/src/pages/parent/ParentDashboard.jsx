import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Users, History, Activity } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Parent Dashboard</h1>
          <p>Monitor your child's academic attendance and performance.</p>
        </div>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <Activity size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--success)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Overview</h3>
        <p style={{ color: 'var(--text-muted)' }}>Aggregate attendance trends for your child appear here.</p>
      </motion.div>
    </motion.div>
  );
}