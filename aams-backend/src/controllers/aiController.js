const User = require('../models/User');
const AttendanceSession = require('../models/AttendanceSession');
const axios = require('axios');
const { asyncHandler } = require('../middleware/errorHandler');

const registerFace = asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ success: false, error: 'Image is required.', code: 'ERR_NO_IMAGE' });

  const aiUrl = process.env.FACE_API_URL || 'http://localhost:5001';
  try {
    const response = await axios.post(`${aiUrl}/register`, {
      image,
      enrollmentId: req.user.enrollmentId
    });

    if (!response.data.success) {
      return res.status(400).json({ success: false, error: 'Failed to process face.', code: 'ERR_AI_FAIL' });
    }

    req.user.faceEmbedding = response.data.embedding;
    req.user.faceRegistered = true;
    await req.user.save();

    res.json({ success: true, message: 'Face registered successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI Service unreachable or error occurred.', code: 'ERR_AI_SERVICE' });
  }
});

const recognizeFace = asyncHandler(async (req, res) => {
  const { image, sessionId } = req.body;
  
  if (!image || !sessionId) {
    return res.status(400).json({ success: false, error: 'Image and sessionId are required.', code: 'ERR_MISSING_DATA' });
  }

  const session = await AttendanceSession.findById(sessionId).populate('course');
  if (!session) return res.status(404).json({ success: false, error: 'Session not found.', code: 'ERR_NOT_FOUND' });

  // Get enrolled students
  const enrolledStudents = await User.find({
    _id: { $in: session.course.enrolledStudents },
    faceRegistered: true
  });

  const candidates = enrolledStudents.map(s => ({
    enrollmentId: s.enrollmentId,
    embedding: s.faceEmbedding
  }));

  const aiUrl = process.env.FACE_API_URL || 'http://localhost:5001';
  try {
    const response = await axios.post(`${aiUrl}/recognize`, {
      image,
      candidates
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AI Service unreachable or error occurred.', code: 'ERR_AI_SERVICE' });
  }
});

module.exports = { registerFace, recognizeFace };
