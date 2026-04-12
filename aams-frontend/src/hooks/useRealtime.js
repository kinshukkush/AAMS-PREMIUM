/**
 * useRealtime - Socket.io Hook for Real-time Updates
 * Manages WebSocket connections and event listeners
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

export const useRealtime = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Connect to socket.io server
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = import.meta.env.VITE_SOCKET_URL
      || (apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl);

    const socket = io(socketUrl || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('aams_token')
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Connected to real-time server');
      if (user?._id) {
        socket.emit('authenticate', user._id);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  /**
   * Subscribe to an event
   */
  const subscribe = useCallback((event, callback) => {
    if (!socketRef.current) return;

    socketRef.current.on(event, callback);

    // Store listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  /**
   * Emit an event
   */
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  /**
   * Join a session room
   */
  const joinSession = useCallback((sessionId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-session', sessionId, user?.id);
    }
  }, [user?.id]);

  /**
   * Leave a session room
   */
  const leaveSession = useCallback((sessionId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-session', sessionId);
    }
  }, []);

  /**
   * Check if connected
   */
  const isConnected = useCallback(() => {
    return socketRef.current?.connected || false;
  }, []);

  return {
    socket: socketRef.current,
    subscribe,
    emit,
    joinSession,
    leaveSession,
    isConnected
  };
};

export default useRealtime;
