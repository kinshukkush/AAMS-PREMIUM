import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Calendar, Clock } from 'lucide-react';

export default function FacultyTimetable() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Timetable</h1>
          <p>Your weekly teaching schedule and upcoming sessions.</p>
        </div>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <Calendar size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--accent-primary)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Weekly Planner</h3>
        <p style={{ color: 'var(--text-muted)' }}>Syncs automatically with admin scheduling.</p>
      </motion.div>
    </motion.div>
  );
}
