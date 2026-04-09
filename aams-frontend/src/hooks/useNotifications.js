/**
 * useNotifications - Notification Management Hook
 * Handles fetching, displaying, and managing notifications
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useRealtime from './useRealtime';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscribe } = useRealtime();

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (page = 1, limit = 20, read = null) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (read !== null) {
        params.read = read;
      }

      const response = await axios.get(`${API_URL}/api/notifications`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      setNotifications(response.data.notifications);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notifications');
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch(`${API_URL}/api/notifications/mark-all-read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const deleted = notifications.find(n => n._id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  }, [notifications]);

  /**
   * Delete all notifications
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Delete all notifications error:', err);
    }
  }, []);

  /**
   * Listen for real-time notifications
   */
  useEffect(() => {
    const unsubscribe = subscribe('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => unsubscribe?.();
  }, [subscribe]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
  };
};

export default useNotifications;
