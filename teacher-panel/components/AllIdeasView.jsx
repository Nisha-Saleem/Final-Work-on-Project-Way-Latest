import React, { useState, useEffect } from 'react';
import { getAllIdeasFiltered } from '../api/teacherPanelApi';
import '../styles/AllIdeasView.css';

const AllIdeasView = () => {
  const [ideas, setIdeas] = useState([]);
  const [currentTab, setCurrentTab] = useState('Accepted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load ideas from backend based on current tab
    const loadIdeas = async () => {
      try {
        setLoading(true);
        let filters = {};
        
        if (currentTab === 'Accepted') {
          filters.status = 'Accepted';
        } else if (currentTab === 'Rejected') {
          filters.status = 'Rejected';
        } else if (currentTab === 'Morning') {
          filters.session = 'Morning';
        } else if (currentTab === 'Evening') {
          filters.session = 'Evening';
        }
        
        const result = await getAllIdeasFiltered(filters);
        if (result.success) {
          setIdeas(result.ideas || []);
        }
      } catch (error) {
        console.error('Error loading ideas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
    
    // Check for new submissions every 2 seconds
    const interval = setInterval(loadIdeas, 2000);
    
    return () => clearInterval(interval);
  }, [currentTab]);

  // Since we fetch filtered data from backend, filteredIdeas is just the ideas we received
  const filteredIdeas = ideas;

  // For badge counts, we need to fetch all ideas without filters
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    const loadAllIdeasForCounts = async () => {
      try {
        const result = await getAllIdeasFiltered({});
        if (result.success) {
          setAllIdeas(result.ideas || []);
        }
      } catch (error) {
        console.error('Error loading all ideas for counts:', error);
      }
    };
    loadAllIdeasForCounts();
  }, []);

  const acceptedCount = allIdeas.filter(i => i.status === 'Accepted').length;
  const rejectedCount = allIdeas.filter(i => i.status === 'Rejected').length;
  const morningCount = allIdeas.filter(i => i.session.includes('Morning') && (i.status === 'Accepted' || i.status === 'Rejected')).length;
  const eveningCount = allIdeas.filter(i => i.session.includes('Evening') && (i.status === 'Accepted' || i.status === 'Rejected')).length;

  return (
    <div className="ideas-page">
      <div className="ideas-header">
        <h2 className="ideas-title">All Ideas</h2>
        <p className="ideas-subtitle">Manage approved and rejected FYP across all sessions.</p>
      </div>

      <div className="ideas-tabs-wrapper">
        <nav aria-label="Tabs" className="ideas-tabs">
          <button
            onClick={() => setCurrentTab('Accepted')}
            className={`ideas-tab-btn ${currentTab === 'Accepted' ? 'ideas-tab-btn-active' : ''}`}
          >
            <span className="material-symbols-outlined ideas-tab-icon">check_circle</span>
            Accepted Ideas
            <span className="ideas-tab-badge ideas-tab-badge-blue">{acceptedCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Rejected')}
            className={`ideas-tab-btn ${currentTab === 'Rejected' ? 'ideas-tab-btn-active' : ''}`}
          >
            <span className="material-symbols-outlined ideas-tab-icon">cancel</span>
            Rejected Ideas
            <span className="ideas-tab-badge ideas-tab-badge-gray">{rejectedCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Morning')}
            className={`ideas-tab-btn ${currentTab === 'Morning' ? 'ideas-tab-btn-active' : ''}`}
          >
            <span className="material-symbols-outlined ideas-tab-icon">wb_sunny</span>
            Morning Session
            <span className="ideas-tab-badge ideas-tab-badge-orange">{morningCount}</span>
          </button>

          <button
            onClick={() => setCurrentTab('Evening')}
            className={`ideas-tab-btn ${currentTab === 'Evening' ? 'ideas-tab-btn-active' : ''}`}
          >
            <span className="material-symbols-outlined ideas-tab-icon">nights_stay</span>
            Evening Session
            <span className="ideas-tab-badge ideas-tab-badge-purple">{eveningCount}</span>
          </button>
        </nav>
      </div>

      <div className="ideas-card">
        <div className="ideas-card-header">
          <div className="ideas-card-header-left">
            <span
              className={`material-symbols-outlined ideas-status-icon ${
                currentTab === 'Accepted'
                  ? 'ideas-status-icon-accepted'
                  : currentTab === 'Rejected'
                    ? 'ideas-status-icon-rejected'
                    : 'ideas-status-icon-default'
              }`}
            >
              {currentTab === 'Accepted' ? 'check_circle' : currentTab === 'Rejected' ? 'cancel' : 'list_alt'}
            </span>
            <h3 className="ideas-card-title">{currentTab} Ideas</h3>
          </div>
        </div>

        <div className="ideas-table-wrapper">
          <table className="ideas-table">
            <thead className="ideas-table-head">
              <tr>
                <th className="ideas-th">Idea Name</th>
                <th className="ideas-th ideas-th-description">Description</th>
                <th className="ideas-th">Leader Name</th>
                <th className="ideas-th">Session</th>
                <th className="ideas-th ideas-th-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map(idea => (
                <tr key={idea.id} className="ideas-tr">
                  <td className="ideas-td ideas-td-title">{idea.title}</td>
                  <td className="ideas-td ideas-td-description">{idea.shortDescription}</td>
                  <td className="ideas-td">{idea.leader.name}</td>
                  <td className="ideas-td ideas-td-session">{idea.session}</td>
                  <td className="ideas-td ideas-td-right">
                    <span
                      className={`ideas-status-pill ${
                        idea.status === 'Accepted'
                          ? 'ideas-status-pill-accepted'
                          : idea.status === 'Rejected'
                            ? 'ideas-status-pill-rejected'
                            : 'ideas-status-pill-pending'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredIdeas.length === 0 && (
                <tr>
                  <td colSpan={5} className="ideas-empty">No items found in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ideas-card-footer">
          <p className="ideas-footer-text">Showing {filteredIdeas.length} results</p>
        </div>
      </div>
    </div>
  );
};

export default AllIdeasView;
