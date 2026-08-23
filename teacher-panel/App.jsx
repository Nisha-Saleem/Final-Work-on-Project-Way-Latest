import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardView from './components/DashboardView';
import AllIdeasView from './components/AllIdeasView';
import ProgressView from './components/ProgressView';
import Upload from './components/Upload';
import { notifications } from './api/teacherPanelApi';
import './styles/main.css';
import './styles/utilities.css';
import './styles/scrollbar.css';

const Navigation = ({ userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showIssues, setShowIssues] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [ideaNotifications, setIdeaNotifications] = useState([]);
  const [notificationSelectId, setNotificationSelectId] = useState(null);
  const [teacherPermissions, setTeacherPermissions] = useState([]);

  useEffect(() => {
    const loadPermissions = () => {
      const saved = localStorage.getItem('roles');
      if (saved) {
        const roles = JSON.parse(saved);
        const teacher = roles.find(r => r.id === '2');
        if (teacher) {
          setTeacherPermissions(teacher.permissions);
        }
      }
    };

    loadPermissions();

    // Listen for storage changes to update permissions when admin saves
    const handleStorageChange = (e) => {
      if (e.key === 'roles') {
        loadPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await notifications.getAllNotifications();
        if (result.success) {
          setIdeaNotifications(result.notifications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setIdeaNotifications([]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  const canUpload = !teacherPermissions.includes('idea.upload');
  const canViewProgress = !teacherPermissions.includes('progress.track');
  const canReviewIdeas = !teacherPermissions.includes('idea.review');
  const canCreateTasks = !teacherPermissions.includes('task.create');

  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === `/teacher${path}` || currentPath === path;
  };

  const unreadNotificationCount = ideaNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification) => {
    try {
      const result = await notifications.markAsRead(notification._id);
      if (result.success) {
        const updated = ideaNotifications.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        );
        setIdeaNotifications(updated);
        setNotificationSelectId(notification.ideaId);
        setShowNotifications(false);
        if (!isActive('/dashboard')) {
          navigate('/teacher/dashboard');
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationHandled = useCallback(() => {
    setNotificationSelectId(null);
  }, []);

  const dashboardProps = {
    showIssues,
    setShowIssues,
    notificationSelectId,
    onNotificationHandled: handleNotificationHandled,
  };

  const handleNavigation = (path) => {
    navigate(`/teacher${path}`);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              <span className="user-initial">{userName ? userName.charAt(0).toUpperCase() : 'T'}</span>
            </div>
            <div className="user-info">
              <h1>Teacher Panel</h1>
              <p className="user-name">{userName || 'Teacher'}</p>
            </div>
            <button
              onClick={onLogout}
              className="logout-btn"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
          {/* Navigation */}
          <nav className="nav-menu">
            {canCreateTasks && <button 
              onClick={() => handleNavigation('/dashboard')}
              className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">dashboard</span>
              <p className={`nav-text ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</p>
            </button>}
            {canReviewIdeas && <button 
              onClick={() => handleNavigation('/allideas')}
              className={`nav-button ${isActive('/allideas') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">tips_and_updates</span>
              <p className={`nav-text ${isActive('/allideas') ? 'active' : ''}`}>All Ideas</p>
            </button>}
            {canViewProgress && <button 
              onClick={() => handleNavigation('/progress')}
              className={`nav-button ${isActive('/progress') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">bar_chart</span>
              <p className={`nav-text ${isActive('/progress') ? 'active' : ''}`}>Progress</p>
            </button>}
            {canUpload && <button 
              onClick={() => handleNavigation('/upload')}
              className={`nav-button ${isActive('/upload') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">upload</span>
              <p className={`nav-text ${isActive('/upload') ? 'active' : ''}`}>Upload</p>
            </button>}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-actions">
            {isActive('/dashboard') && canCreateTasks && (
              <>
                <button 
                  onClick={() => setShowIssues(true)}
                  className="issues-btn"
                >
                  <span className="material-symbols-outlined">help</span>
                  Issues
                </button>
                <div className="notification-wrapper">
                  <button
                    type="button"
                    className="notification-btn"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    aria-label="Idea notifications"
                  >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadNotificationCount > 0 && (
                      <span className="notification-badge">{unreadNotificationCount}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <>
                      <div
                        className="notification-backdrop"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="notification-panel">
                        <div className="notification-panel-header">
                          <h3 className="notification-panel-title">New Idea Submissions</h3>
                          <button
                            type="button"
                            className="notification-panel-close"
                            onClick={() => setShowNotifications(false)}
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </div>
                        <div className="notification-panel-body">
                          {ideaNotifications.length === 0 ? (
                            <p className="notification-empty">No idea submissions yet.</p>
                          ) : (
                            ideaNotifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                className={`notification-item ${notification.read ? 'notification-item-read' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <p className="notification-item-title">{notification.title}</p>
                                <p className="notification-item-leader">
                                  Leader: {notification.leaderName}
                                </p>
                                {!notification.read && (
                                  <span className="notification-item-new">New</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="content-area">
          <div className="content-wrapper">
            {(() => {
              const currentPath = location.pathname;
              if ((currentPath === '/teacher/dashboard' || currentPath === '/teacher') && canCreateTasks) {
                return <DashboardView {...dashboardProps} />;
              } else if (currentPath === '/teacher/allideas' && canReviewIdeas) {
                return <AllIdeasView />;
              } else if (currentPath === '/teacher/progress' && canViewProgress) {
                return <ProgressView />;
              } else if (currentPath === '/teacher/upload' && canUpload) {
                return <Upload />;
              }
              return <DashboardView {...dashboardProps} />;
            })()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App = ({ userName, onLogout }) => {
  return <Navigation userName={userName} onLogout={onLogout} />;
};

export default App;
