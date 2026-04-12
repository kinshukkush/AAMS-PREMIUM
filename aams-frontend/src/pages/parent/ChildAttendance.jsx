import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Clock, Book } from 'lucide-react';

export default function ChildAttendance() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Child Attendance</h1>
          <p>Detailed view of daily attendance records.</p>
        </div>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <Clock size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--warning)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Attendance Log</h3>
        <p style={{ color: 'var(--text-muted)' }}>Class-by-class attendance history will be listed.</p>
      </motion.div>
    </motion.div>
  );
}