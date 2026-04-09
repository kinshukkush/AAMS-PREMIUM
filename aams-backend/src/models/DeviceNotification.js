const mongoose = require('mongoose');

// ===== DEVICE MODEL =====
const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['ip_camera', 'webcam', 'ptz_camera', 'edge_device', 'other'],
    default: 'webcam'
  },
  location: { type: String, required: true },
  room: { type: String },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  ipAddress: { type: String },
  macAddress: { type: String },
  streamUrl: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  lastPing: { type: Date },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: { type: String }
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
