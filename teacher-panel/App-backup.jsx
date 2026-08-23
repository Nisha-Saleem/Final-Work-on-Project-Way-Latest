import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { INITIAL_IDEAS } from './data';
import DashboardView from './components/DashboardView';
import AllIdeasView from './components/AllIdeasView';
import ProgressView from './components/ProgressView';
import Upload from './components/Upload';
import './styles/main.css';
import './styles/utilities.css';
import './styles/scrollbar.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIssues, setShowIssues] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-container">
      {/* Simple back button */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-content">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-info">
              <h1>Teacher Panel</h1>
            </div>
          </div>
          {/* Navigation */}
          <nav className="nav-menu">
            <Link 
              to="/dashboard"
              className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">dashboard</span>
              <p className={`nav-text ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</p>
            </Link>
            <Link 
              to="/allideas"
              className={`nav-button ${isActive('/allideas') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">tips_and_updates</span>
              <p className={`nav-text ${isActive('/allideas') ? 'active' : ''}`}>All Ideas</p>
            </Link>
            <Link 
              to="/progress"
              className={`nav-button ${isActive('/progress') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">bar_chart</span>
              <p className={`nav-text ${isActive('/progress') ? 'active' : ''}`}>Progress</p>
            </Link>
            <Link 
              to="/upload"
              className={`nav-button ${isActive('/upload') ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined nav-icon">upload</span>
              <p className={`nav-text ${isActive('/upload') ? 'active' : ''}`}>Upload</p>
            </Link>
          </nav>
        </div>
              </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-actions">
            {location.pathname === '/dashboard' && (
              <>
                <button 
                  onClick={() => setShowIssues(true)}
                  className="issues-btn"
                >
                  <span className="material-symbols-outlined">help</span>
                  Issues
                </button>
                <button className="notification-btn">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="notification-dot"></span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="content-area">
          <div className="content-wrapper">
            <Routes>
              <Route path="/dashboard" element={<DashboardView showIssues={showIssues} setShowIssues={setShowIssues} />} />
              <Route path="/allideas" element={<AllIdeasView />} />
              <Route path="/progress" element={<ProgressView />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/" element={<DashboardView showIssues={showIssues} setShowIssues={setShowIssues} />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Navigation />
    </Router>
  );
};

export default App;
