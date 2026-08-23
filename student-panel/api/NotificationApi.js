import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/notifications';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationApi = {
  // Get all notifications (admin view)
  getAllNotifications: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  },

  // Get notifications for a specific group (shared by leader and members)
  getNotificationsByGroup: async (groupId, userName) => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const response = await api.get(`/group/${encodeURIComponent(groupId)}${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications for group:', error);
      throw error;
    }
  },

  // Get unread count for a specific group
  getUnreadCountByGroup: async (groupId, userName) => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const response = await api.get(`/group/${encodeURIComponent(groupId)}/unread${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count for group:', error);
      throw error;
    }
  },

  // Get notifications for a specific student (by leader name)
  getNotificationsByLeader: async (leaderName, projectName = '') => {
    try {
      const query = projectName ? `?projectName=${encodeURIComponent(projectName)}` : '';
      const response = await api.get(`/leader/${leaderName}${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications for leader:', error);
      throw error;
    }
  },

  // Get unread count for a specific student
  getUnreadCountByLeader: async (leaderName, projectName = '') => {
    try {
      const query = projectName ? `?projectName=${encodeURIComponent(projectName)}` : '';
      const response = await api.get(`/leader/${leaderName}/unread${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get unread notifications count (all)
  getUnreadCount: async () => {
    try {
      const response = await api.get('/unread/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await api.get(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId, userName) => {
    try {
      const response = await api.put(`/read/${notificationId}`, { userName });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read for a specific student
  markAllAsReadByLeader: async (leaderName, projectName = '') => {
    try {
      const query = projectName ? `?projectName=${encodeURIComponent(projectName)}` : '';
      const response = await api.put(`/leader/${leaderName}/read-all${query}`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Create a new notification (for testing/manual creation)
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
};
