import Notification from '../models/Notification.js';
import { User } from '../models/User.js';

// Get all notifications (for teacher)
export const getAllNotifications = async (req, res) => {
  console.log('🔔 [Notifications] Get all notifications request received');
  console.log('🔔 [Notifications] User name:', req.query.userName);

  try {
    const { userName } = req.query;
    const notifications = await Notification.find({ recipient: 'teacher' }).sort({ submittedAt: -1 });

    // Add a computed 'read' field based on whether the current teacher has read it
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification.toObject(),
      read: userName ? notification.readBy.includes(userName) : false
    }));

    console.log('✅ [Notifications] Retrieved', notifications.length, 'notifications total');
    res.status(200).json({ success: true, notifications: notificationsWithReadStatus });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notifications by group ID (for student group members)
export const getNotificationsByGroup = async (req, res) => {
  console.log('🔔 [Notifications] Get notifications by group request received');
  console.log('🔔 [Notifications] Group ID:', req.params.groupId);
  console.log('🔔 [Notifications] User name:', req.query.userName);

  try {
    const { groupId } = req.params;
    const { userName } = req.query;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required',
        notifications: []
      });
    }

    const query = { recipient: 'student', groupId };
    console.log('🔔 [Notifications] MongoDB query:', JSON.stringify(query));
    const notifications = await Notification.find(query).sort({ submittedAt: -1 });
    
    // Add a computed 'read' field based on whether the current user has read it
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification.toObject(),
      read: userName ? notification.readBy.includes(userName) : false
    }));
    
    console.log('✅ [Notifications] Retrieved', notifications.length, 'notifications for group:', groupId);
    res.status(200).json({ success: true, notifications: notificationsWithReadStatus });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications by group',
      error: error.message
    });
  }
};

// Get unread count by group ID (for student group members)
export const getUnreadCountByGroup = async (req, res) => {
  console.log('🔔 [Notifications] Get unread count by group request received');
  console.log('🔔 [Notifications] Group ID:', req.params.groupId);
  console.log('🔔 [Notifications] User name:', req.query.userName);

  try {
    const { groupId } = req.params;
    const { userName } = req.query;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required',
        unreadCount: 0
      });
    }

    const query = { recipient: 'student', groupId };
    const notifications = await Notification.find(query);
    
    // Count notifications where the current user hasn't read it
    const unreadCount = userName 
      ? notifications.filter(n => !n.readBy.includes(userName)).length
      : notifications.filter(n => n.readBy.length === 0).length;
    
    console.log('✅ [Notifications] Retrieved unread count:', unreadCount, 'for group:', groupId);
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching unread count by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count by group',
      error: error.message
    });
  }
};

// Get notifications by leader name (for student)
export const getNotificationsByLeader = async (req, res) => {
  console.log('🔔 [Notifications] Get notifications by leader name request received');
  console.log('🔔 [Notifications] Leader name:', req.params.leaderName);
  console.log('🔔 [Notifications] Query params:', req.query);

  try {
    const { leaderName } = req.params;
    const { projectName } = req.query;
    
    // Get user's groupId
    const user = await User.findOne({ name: leaderName });
    const groupId = user?.groupId;
    
    let query = { recipient: 'student' };
    if (groupId) {
      // If user has a groupId, filter by groupId
      query.groupId = groupId;
    } else {
      // Fallback to leaderName if no groupId
      query.leaderName = leaderName;
    }
    
    console.log('🔔 [Notifications] MongoDB query:', JSON.stringify(query));
    const notifications = await Notification.find(query).sort({ submittedAt: -1 });
    console.log('✅ [Notifications] Retrieved', notifications.length, 'notifications for leader:', leaderName);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications by leader:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications by leader',
      error: error.message
    });
  }
};

// Get unread notifications
export const getUnreadNotifications = async (req, res) => {
  console.log('🔔 [Notifications] Get unread notifications request received');
  
  try {
    const notifications = await Notification.find({ read: false, recipient: 'teacher' }).sort({ submittedAt: -1 });
    console.log('✅ [Notifications] Retrieved', notifications.length, 'unread notifications');
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching unread notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching unread notifications', 
      error: error.message 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  console.log('🔔 [Notifications] Mark notification as read request received');
  console.log('🔔 [Notifications] Notification ID:', req.params.id);
  console.log('🔔 [Notifications] User name:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({
        success: false,
        message: 'userName is required'
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      console.log('⚠️ [Notifications] Notification not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    // Add user to readBy array if not already present
    if (!notification.readBy.includes(userName)) {
      notification.readBy.push(userName);
      await notification.save();
    }

    console.log('✅ [Notifications] Notification marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking notification as read', 
      error: error.message 
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  console.log('🔔 [Notifications] Mark all notifications as read request received');
  
  try {
    const result = await Notification.updateMany({ read: false }, { read: true });
    console.log('✅ [Notifications] Marked', result.modifiedCount, 'notifications as read');
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking all notifications as read', 
      error: error.message 
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  console.log('🔔 [Notifications] Delete notification request received');
  console.log('🔔 [Notifications] Notification ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      console.log('⚠️ [Notifications] Notification not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    console.log('✅ [Notifications] Notification deleted successfully:', id);
    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting notification', 
      error: error.message 
    });
  }
};

// Get unread count by leader name (for student)
export const getUnreadCountByLeader = async (req, res) => {
  console.log('🔔 [Notifications] Get unread count by leader request received');
  console.log('🔔 [Notifications] Leader name:', req.params.leaderName);
  console.log('🔔 [Notifications] Query params:', req.query);
  
  try {
    const { leaderName } = req.params;
    const { projectName } = req.query;
    
    // Get user's groupId
    const user = await User.findOne({ name: leaderName });
    const groupId = user?.groupId;
    
    let query = { read: false, recipient: 'student' };
    if (groupId) {
      // If user has a groupId, filter by groupId
      query.groupId = groupId;
    } else {
      // Fallback to leaderName if no groupId
      query.leaderName = leaderName;
    }
    
    console.log('🔔 [Notifications] MongoDB query:', JSON.stringify(query));
    const unreadCount = await Notification.countDocuments(query);
    console.log('✅ [Notifications] Retrieved unread count:', unreadCount, 'for leader:', leaderName);
    res.status(200).json({ 
      success: true, 
      unreadCount 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error fetching unread count by leader:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching unread count by leader', 
      error: error.message 
    });
  }
};

// Mark all notifications as read by leader name (for student)
export const markAllAsReadByLeader = async (req, res) => {
  console.log('🔔 [Notifications] Mark all notifications as read by leader request received');
  console.log('🔔 [Notifications] Leader name:', req.params.leaderName);
  console.log('🔔 [Notifications] Query params:', req.query);
  
  try {
    const { leaderName } = req.params;
    const { projectName } = req.query;
    
    // Get user's groupId
    const user = await User.findOne({ name: leaderName });
    const groupId = user?.groupId;
    
    let query = { read: false, recipient: 'student' };
    if (groupId) {
      // If user has a groupId, filter by groupId
      query.groupId = groupId;
    } else {
      // Fallback to leaderName if no groupId
      query.leaderName = leaderName;
    }
    
    console.log('🔔 [Notifications] MongoDB query:', JSON.stringify(query));
    const result = await Notification.updateMany(query, { read: true });
    console.log('✅ [Notifications] Marked', result.modifiedCount, 'notifications as read for leader:', leaderName);
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('❌ [Notifications] Error marking all notifications as read by leader:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking all notifications as read by leader', 
      error: error.message 
    });
  }
};
