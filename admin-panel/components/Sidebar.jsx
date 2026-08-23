import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {


  const linkClass = ({ isActive }) =>
    [
      'sidebar-link',
      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
    ].join(' ');

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="sidebar-logo-title">EduAdmin</h1>
            <p className="sidebar-logo-subtitle">Platform Manager</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          <NavLink to="/" className={linkClass} end>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="sidebar-link-text">Dashboard</span>
          </NavLink>

          <div className="sidebar-section-label">User Management</div>

          <NavLink to="/teachers" className={linkClass}>
            <span className="material-symbols-outlined">people</span>
            <span className="sidebar-link-text">Manage Teachers</span>
          </NavLink>

          <NavLink to="/students" className={linkClass}>
            <span className="material-symbols-outlined">school</span>
            <span className="sidebar-link-text">Manage Students</span>
          </NavLink>

          <div className="sidebar-section-label">System</div>

          <NavLink to="/roles" className={linkClass}>
            <span className="material-symbols-outlined">verified_user</span>
            <span className="sidebar-link-text">Roles & Permissions</span>
          </NavLink>
        </nav>
      </aside>

    </>
  );
};

export default Sidebar;