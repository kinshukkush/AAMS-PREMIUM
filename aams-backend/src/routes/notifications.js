/**
 * Notifications Routes
 * In-app, email, and push notifications
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { query, validationResult } = require('express-validator');

/**
 * Get all notifications for user
 * GET /api/notifications?page=1&limit=20&read=false
 */
router.get(
  '/',
  protect,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('read').optional().isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = 1, limit = 20, read } = req.query;
      const userId = req.user._id;

      const query = { userId };
      if (read !== undefined) {
        query.read = read === 'true';
      }

      const skip = (page - 1) * limit;
      const total = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({
      userId,
      read: false
    });
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/mark-all-read
 */
router.patch('/mark-all-read', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete all notifications
 * DELETE /api/notifications
 */
router.delete('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get notifications by type
 * GET /api/notifications/type/:type
 */
router.get('/type/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const skip = (page - 1) * limit;
    const total = await Notification.countDocuments({ userId, type });
    const notifications = await Notification.find({ userId, type })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get priority notifications
 * GET /api/notifications/priority
 */
router.get('/priority', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      userId,
      priority: { $in: ['high', 'urgent'] },
      read: false
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
router.put('/preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailNotifications, pushNotifications, weeklyDigest } = req.body;

    const User = require('../models/User');
    await User.findByIdAndUpdate(
      userId,
      {
        'preferences.emailNotifications': emailNotifications !== undefined ? emailNotifications : true,
        'preferences.pushNotifications': pushNotifications !== undefined ? pushNotifications : true,
        'preferences.weeklyDigest': weeklyDigest !== undefined ? weeklyDigest : true
      }
    );

    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
