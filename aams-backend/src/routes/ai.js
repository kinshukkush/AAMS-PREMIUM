const express = require('express');
const router = express.Router();
const { registerFace, recognizeFace } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/register', authorize('student', 'teacher', 'admin'), registerFace);
router.post('/recognize', authorize('student', 'teacher', 'admin'), recognizeFace);

module.exports = router;
