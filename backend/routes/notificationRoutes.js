import express from 'express';
import {
  getAllNotifications,
  getNotificationsByLeader,
  getNotificationsByGroup,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCountByLeader,
  getUnreadCountByGroup,
  markAllAsReadByLeader
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications (for teacher)
router.get('/all', getAllNotifications);

// Get notifications by group ID (for student group members)
router.get('/group/:groupId', getNotificationsByGroup);

// Get unread count by group ID (for student group members)
router.get('/group/:groupId/unread', getUnreadCountByGroup);

// Get notifications by leader name (for student)
router.get('/leader/:leaderName', getNotificationsByLeader);

// Get unread count by leader name (for student)
router.get('/leader/:leaderName/unread', getUnreadCountByLeader);

// Get unread notifications
router.get('/unread', getUnreadNotifications);

// Mark notification as read
router.put('/read/:id', markAsRead);

// Mark all notifications as read by leader name (for student)
router.put('/leader/:leaderName/read-all', markAllAsReadByLeader);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
