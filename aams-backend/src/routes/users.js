const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, createUser, updateUser, deleteUser,
  getMyStudents, updatePhoto, getMyNotifications, markNotificationsRead
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.use(protect);

// Notification routes
router.get('/notifications', getMyNotifications);
router.put('/notifications/read', markNotificationsRead);

// Faculty: get enrolled students
router.get('/students/my-class', authorize('faculty', 'admin'), getMyStudents);

// Admin CRUD
router.get('/', authorize('admin', 'faculty'), getUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/photo', uploadProfile.single('photo'), updatePhoto);

module.exports = router;
