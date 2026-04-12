import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { Calendar, Clock, MapPin, Users, Settings } from 'lucide-react';

export default function TimetableManager() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Timetable Manager</h1>
          <p>Schedule and manage academic sessions</p>
        </div>
        <button className="btn btn-primary"><Calendar size={15}/> New Schedule</button>
      </div>

      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <Calendar size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--accent-primary)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Timetable Management</h3>
        <p style={{ color: 'var(--text-muted)' }}>Drag and drop classes, schedule recuring sessions, and assign faculty.</p>
        <div style={{ marginTop: 24, display: 'inline-flex', gap: 10 }}>
          <button className="btn btn-secondary">Import CSV</button>
          <button className="btn btn-primary">Create Empty</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
