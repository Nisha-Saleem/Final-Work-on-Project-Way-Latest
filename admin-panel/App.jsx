import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import ManageTeachers from './pages/ManageTeachers.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import RolesPermissions from './pages/RolesPermissions.jsx';
import './styles/Global.css';

const AppContent = ({ userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === `/admin${path}`;
  };

  const handleNavigation = (path) => {
    navigate(`/admin${path}`);
  };

  const renderContent = () => {
    const currentPath = location.pathname;

    if (currentPath === '/admin/dashboard') {
      return <Dashboard />;
    }
    if (currentPath === '/admin/teachers') {
      return <ManageTeachers />;
    }
    if (currentPath === '/admin/students') {
      return <ManageStudents />;
    }
    if (currentPath === '/admin/roles') {
      return <RolesPermissions />;
    }

    return <Dashboard />;
  };

  const navButtonStyle = (path) => ({
    padding: '12px',
    border: 'none',
    background: isActive(path) ? '#2563eb' : 'transparent',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
  });

  return (
    <>
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '250px',
        height: '100vh',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '20px',
        zIndex: 1000,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '18px',
            flexShrink: 0
          }}>
            {(userName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', wordBreak: 'break-word' }}>
              {userName || 'User'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.75 }}>Admin Panel</p>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button type="button" onClick={() => handleNavigation('/dashboard')} style={navButtonStyle('/dashboard')}>
            Dashboard
          </button>
          <button type="button" onClick={() => handleNavigation('/teachers')} style={navButtonStyle('/teachers')}>
            Manage Teachers
          </button>
          <button type="button" onClick={() => handleNavigation('/students')} style={navButtonStyle('/students')}>
            Manage Students
          </button>
          <button type="button" onClick={() => handleNavigation('/roles')} style={navButtonStyle('/roles')}>
            Roles & Permissions
          </button>
        </nav>
        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>

      <div style={{
        marginLeft: '250px',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        {renderContent()}
      </div>
    </>
  );
};

const App = ({ userName, onLogout }) => {
  return <AppContent userName={userName} onLogout={onLogout} />;
};

export default App;
