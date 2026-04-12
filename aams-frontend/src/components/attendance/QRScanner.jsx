import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../utils/animations';
import { QrCode, Camera } from 'lucide-react';

export default function QRScanner() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position: 'fixed', inset: 0, background: '#0F1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
        <QrCode size={120} style={{ opacity: 0.3, margin: '0 auto 20px', color: 'var(--accent-primary)' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 10, color: 'white' }}>QR Scanner</h3>
        <p style={{ color: 'var(--text-muted)' }}>Scan sessions codes instantly.</p>
      </motion.div>
    </motion.div>
  );
}
