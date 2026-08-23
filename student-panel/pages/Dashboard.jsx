import React, { useState, useEffect } from 'react';
import { getAllUploads, getIdeaStatsByGroup, getUserGroupId } from '../api/studentPanelApi';
import { notificationApi } from '../api/NotificationApi';

const Dashboard = ({ userName }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [ideaStats, setIdeaStats] = useState({
    submitted: 0,
    approved: 0,
    inProgress: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    if (!userName) return;

    const loadIdeaStats = async (currentGroupId) => {
      const result = await getIdeaStatsByGroup(currentGroupId);
      if (result.success && result.stats) {
        const stats = {
          submitted: result.stats.submitted,
          approved: result.stats.approved,
          inProgress: result.stats.inProgress
        };
        setIdeaStats(stats);
        localStorage.setItem(`dashboardIdeaStats_${currentGroupId}`, JSON.stringify(stats));
      }
    };

    const loadNotifications = async (currentGroupId) => {
      try {
        const result = await notificationApi.getNotificationsByGroup(currentGroupId, userName);
        if (result.success) {
          setNotifications(result.notifications);
          setUnreadCount(result.notifications.filter(n => !n.read).length);
          localStorage.setItem(
            `dashboardNotifications_${currentGroupId}_${userName}`,
            JSON.stringify(result.notifications)
          );
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const refreshDashboard = async () => {
      const groupResult = await getUserGroupId(userName);
      const currentGroupId = groupResult.groupId;

      if (currentGroupId) {
        setGroupId(currentGroupId);
        await loadIdeaStats(currentGroupId);
        await loadNotifications(currentGroupId);
      }

      const uploadsResult = await getAllUploads();
      if (uploadsResult.success && uploadsResult.uploads) {
        setUploadedFiles(uploadsResult.uploads);
      }
    };

    const bootstrap = async () => {
      const groupResult = await getUserGroupId(userName);
      if (groupResult.groupId) {
        const cachedStats = localStorage.getItem(`dashboardIdeaStats_${groupResult.groupId}`);
        if (cachedStats) {
          setIdeaStats(JSON.parse(cachedStats));
        }
        const cachedNotifications = localStorage.getItem(`dashboardNotifications_${groupResult.groupId}_${userName}`);
        if (cachedNotifications) {
          const parsed = JSON.parse(cachedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        }
        setGroupId(groupResult.groupId);
      }
    };

    bootstrap();
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 2000);

    return () => clearInterval(interval);
  }, [userName]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('doc') || fileType.includes('word')) return 'description';
    return 'insert_drive_file';
  };

  const getFileIconColor = (fileType) => {
    if (fileType.includes('pdf')) return 'dash-file-icon-red';
    if (fileType.includes('image')) return 'dash-file-icon-green';
    if (fileType.includes('doc') || fileType.includes('word')) return 'dash-file-icon-blue';
    return 'dash-file-icon-gray';
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId, userName);
      if (groupId) {
        const result = await notificationApi.getNotificationsByGroup(groupId, userName);
        if (result.success) {
          setNotifications(result.notifications);
          setUnreadCount(result.notifications.filter(n => !n.read).length);
          localStorage.setItem(
            `dashboardNotifications_${groupId}_${userName}`,
            JSON.stringify(result.notifications)
          );
        }
      }
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="dash-container">
      <div className="dash-notification-wrapper">
        <button
          className="dash-notification-icon"
          type="button"
          aria-label="Notifications"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && <span className="dash-notification-badge">{unreadCount}</span>}
        </button>
        {showNotifications && (
          <div className="dash-notification-dropdown">
            <div className="dash-notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="dash-close-btn">×</button>
            </div>
            <div className="dash-notification-list">
              {notifications.length === 0 ? (
                <p className="dash-no-notifications">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    className={`dash-notification-item ${notification.read ? 'dash-notification-read' : ''}`}
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <p className="dash-notification-title">{notification.title}</p>
                    <p className="dash-notification-leader">Leader: {notification.leaderName}</p>
                    <p className="dash-notification-leader">Status: {notification.status}</p>
                    <p className="dash-notification-leader">Time: {formatTimestamp(notification.submittedAt)}</p>
                    {!notification.read && <span className="dash-notification-new">New</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Welcome Banner */}
      <div className="dash-welcome-banner">
        <div 
          className="dash-welcome-bg" 
          style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAZOAkHwo3o9KnO8-LyQWXOL47RdVVfmSDXj6bbBQM6AcRTDwr6VII0_UDLOwwqHEOJ7ErGGBz08Kfm55H50v-u2M_NEKy23EillxdCJCYygjtPy16bkAcxdge6oDzIEfPrppyD3Zjodqc_r_eqwFo-kQ_yedQ4YqtxPpeU--FMGI4wy40qYngQOSrkPpTkA2TmUD82zptG3YWWePlq_BnXAMTB8pieL8Z-LdJyGnGEQbWMVw_6WSWtXJT3QRXqN6Bw0LoRr7Cs-TRN')"}}
        ></div>
        <div className="dash-welcome-overlay"></div>
        <div className="dash-welcome-content">
          <h2 className="dash-welcome-title">Welcome back, Student!</h2>
          <p className="dash-welcome-subtitle">You have {uploadedFiles.length} new file(s) to review.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <div className="dash-stat-icon dash-stat-icon-purple">
              <span className="material-symbols-outlined text-2xl">upload</span>
            </div>
            <span className="dash-stat-badge dash-stat-badge-purple">Submitted</span>
          </div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Submit Ideas</h3>
            <p className="dash-stat-value">{ideaStats.submitted}</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <div className="dash-stat-icon dash-stat-icon-green">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <span className="dash-stat-badge dash-stat-badge-green">Approved</span>
          </div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Approved Ideas</h3>
            <p className="dash-stat-value">{ideaStats.approved}</p>
          </div>
        </div>

        <div className="dash-files-card">
          <div className="dash-files-header">
            <h3 className="dash-files-title">Latest File Uploads</h3>
            <span className="dash-stat-badge dash-stat-badge-slate">{uploadedFiles.length} files</span>
          </div>
          <div className="dash-files-list">
            {uploadedFiles.length === 0 ? (
              <div className="dash-files-empty">
                <span className="material-symbols-outlined dash-files-empty-icon">folder_open</span>
                <p className="dash-files-empty-title">No files uploaded yet</p>
                <p className="dash-files-empty-subtitle">Check back later for new materials</p>
              </div>
            ) : (
              uploadedFiles.slice().reverse().map((file) => (
                <div key={file.id} className="dash-file-item">
                  <div className={`dash-file-icon ${getFileIconColor(file.type)}`}>
                    <span className="material-symbols-outlined text-[20px]">{getFileIcon(file.type)}</span>
                  </div>
                  <div className="dash-file-info">
                    <p className="dash-file-name">{file.name}</p>
                    {file.announcement && file.announcement !== 'No announcement' && (
                      <p className="dash-file-announcement">{file.announcement}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{formatTimestamp(file.uploadDate)}</span>
                    </div>
                  </div>
                  <button 
                    className="dash-view-btn"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
