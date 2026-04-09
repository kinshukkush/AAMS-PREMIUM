/**
 * usePremiumAnalytics - Premium Features and Analytics Hook
 * Handles fetching analytics, heatmaps, anomalies, and engagement metrics
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const usePremiumAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch analytics report
   */
  const fetchAnalytics = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/premium/analytics`, {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setAnalytics(response.data.report);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch attendance heatmap
   */
  const fetchHeatmap = useCallback(async (weeks = 4) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/premium/heatmap`, {
        params: { weeks },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setHeatmap(response.data.heatmap);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch heatmap');
      console.error('Fetch heatmap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Detect anomalies
   */
  const detectAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/premium/anomalies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setAnomalies(response.data.anomalies);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to detect anomalies');
      console.error('Detect anomalies error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch engagement metrics
   */
  const fetchEngagementMetrics = useCallback(async (courseId = null) => {
    setLoading(true);
    try {
      const params = courseId ? { courseId } : {};
      const response = await axios.get(`${API_URL}/api/premium/engagement`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('aams_token')}`
        }
      });
      setMetrics(response.data.metrics);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch metrics');
      console.error('Fetch engagement metrics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch class analytics (for faculty)
   */
  const fetchClassAnalytics = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/premium/class-analytics/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('aams_token')}`
          }
        }
      );
      setClassAnalytics(response.data.analytics);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch class analytics');
      console.error('Fetch class analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch late arrival statistics
   */
  const fetchLateStats = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/premium/late-stats`, {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.stats;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch late stats');
      console.error('Fetch late stats error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch comparative analytics
   */
  const fetchComparativeAnalytics = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/premium/comparative-analytics`, {
        params: { courseId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.analytics;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch comparative analytics');
      console.error('Fetch comparative analytics error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validate geolocation
   */
  const validateLocation = useCallback(async (userLocation, sessionId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/premium/validate-location`,
        { userLocation, sessionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Validate location error:', err);
      return { success: false, valid: false };
    }
  }, []);

  return {
    analytics,
    heatmap,
    anomalies,
    metrics,
    classAnalytics,
    loading,
    error,
    fetchAnalytics,
    fetchHeatmap,
    detectAnomalies,
    fetchEngagementMetrics,
    fetchClassAnalytics,
    fetchLateStats,
    fetchComparativeAnalytics,
    validateLocation
  };
};

export default usePremiumAnalytics;
