import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../../utils/animations';
import { BarChart, FileText, Download } from 'lucide-react';

export default function ClassReports() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Class Reports</h1>
          <p>Analyze attendance trends across your assigned courses.</p>
        </div>
        <button className="btn btn-secondary"><Download size={15}/> Export Reports</button>
      </div>
      <motion.div variants={fadeUp} className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
        <BarChart size={64} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--accent-secondary)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 10 }}>Session Insights</h3>
        <p style={{ color: 'var(--text-muted)' }}>Detailed aggregates and student statistics will appear here.</p>
      </motion.div>
    </motion.div>
  );
}
