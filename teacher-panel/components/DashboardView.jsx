import React, { useState, useEffect } from 'react';
import { getPendingIdeas, reviewIdea, sendFeedback, getAllIssues, replyToIssue } from '../api/teacherPanelApi';
import '../styles/DashboardView.css';

const DashboardView = ({ showIssues, setShowIssues, notificationSelectId, onNotificationHandled }) => {
  const [ideas, setIdeas] = useState([]);
  const pendingIdeas = ideas.filter(i => i.status === 'Pending');
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueReply, setIssueReply] = useState('');
  const [loading, setLoading] = useState(true);

  // Load student issues from backend
  const [studentIssues, setStudentIssues] = useState([]);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const result = await getAllIssues();
        if (result.success) {
          setStudentIssues(result.issues || []);
        }
      } catch (error) {
        console.error('Error loading issues:', error);
      }
    };

    loadIssues();
    
    // Check for new issues every 2 seconds
    const interval = setInterval(loadIssues, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const issuesByCategory = studentIssues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {});
  
  // Load pending ideas from backend on component mount
  useEffect(() => {
    const loadPendingIdeas = async () => {
      try {
        setLoading(true);
        const result = await getPendingIdeas();
        if (result.success) {
          setIdeas(result.ideas || []);
        }
      } catch (error) {
        console.error('Error loading pending ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPendingIdeas();
    
    // Set up interval to check for new submissions
    const interval = setInterval(loadPendingIdeas, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Select idea when opened from a notification
  useEffect(() => {
    if (!notificationSelectId) return;
    const idea = pendingIdeas.find((i) => i._id === notificationSelectId || i.id === notificationSelectId);
    if (idea) {
      setSelectedId(notificationSelectId);
      setFeedback('');
      onNotificationHandled?.();
    }
  }, [notificationSelectId, pendingIdeas, onNotificationHandled]);

  // Auto-select first item if none selected or current selection is no longer pending
  useEffect(() => {
    if (notificationSelectId) return;
    if (pendingIdeas.length > 0) {
      if (!selectedId || !pendingIdeas.find(i => i._id === selectedId || i.id === selectedId)) {
        setSelectedId(pendingIdeas[0]._id || pendingIdeas[0].id);
        setFeedback('');
      }
    } else {
      setSelectedId(null);
    }
  }, [pendingIdeas, selectedId, notificationSelectId]);

  const selectedIdea = pendingIdeas.find(i => i._id === selectedId || i.id === selectedId);

  const onUpdateStatus = async (ideaId, newStatus, feedbackText = '') => {
    try {
      const idea = ideas.find(i => i._id === ideaId || i.id === ideaId);
      if (!idea) return;

      // Use MongoDB _id for API call
      const mongoId = idea._id || idea.id;

      // Call backend API to review idea
      const result = await reviewIdea(mongoId, newStatus, feedbackText, 'Teacher');

      if (result.success) {
        // Update local state
        const updatedIdeas = ideas.map(i =>
          (i._id === mongoId || i.id === mongoId) ? { ...i, status: newStatus } : i
        );
        setIdeas(updatedIdeas);

        // Clear feedback
        setFeedback('');

        // Auto-select next pending idea
        const updatedPendingIdeas = updatedIdeas.filter(i => i.status === 'Pending' && (i._id !== mongoId && i.id !== mongoId));
        if (updatedPendingIdeas.length > 0) {
          setSelectedId(updatedPendingIdeas[0]._id || updatedPendingIdeas[0].id);
        } else {
          setSelectedId(null);
        }

        alert(`Idea ${newStatus.toLowerCase()} successfully!`);
      } else {
        alert('Error updating idea status: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating idea status');
    }
  };

  
  return (
    <div className="dash-page">
      <div className="dash-header-row">
        <div className="dash-header-text">
          <h2 className="dash-title">Pending Submissions</h2>
          <p className="dash-subtitle">Review new student project proposals requiring your approval.</p>
        </div>

              </div>

      {pendingIdeas.length === 0 ? (
        <div className="dash-empty">
          <span className="material-symbols-outlined dash-empty-icon">check_circle</span>
          <p className="dash-empty-title">All caught up!</p>
          <p className="dash-empty-subtitle">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="dash-main-grid">
          <div className="dash-list-card">
            <div className="dash-list-scroll">
              <table className="dash-table">
                <thead className="dash-table-head">
                  <tr>
                    <th className="dash-th dash-th-idea">Idea Name</th>
                    <th className="dash-th">Description</th>
                    <th className="dash-th dash-th-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingIdeas.map((idea) => {
                    const ideaId = idea._id || idea.id;
                    const isSelected = selectedId === ideaId;
                    return (
                      <tr
                        key={ideaId}
                        onClick={() => { setSelectedId(ideaId); setFeedback(''); }}
                        className={`dash-tr dash-tr-hover ${isSelected ? 'dash-tr-selected' : ''}`}
                      >
                        <td className="dash-td dash-td-idea">
                          <div className="dash-idea-meta">
                            <span className="dash-idea-title">{idea.title}</span>
                            <span className="dash-idea-submeta">{idea.leader.name} • {idea.session}</span>
                          </div>
                        </td>
                        <td className="dash-td">
                          <p className="dash-idea-desc">{idea.shortDescription}</p>
                        </td>
                        <td className="dash-td">
                          <span className="dash-status-pill dash-status-pill-pending">{idea.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-detail-column">
            {selectedIdea && (
              <div className="dash-detail-card">
                <div className="dash-detail-hero">
                  <div className="dash-detail-avatar-wrapper">
                    <div className="dash-detail-avatar">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                  </div>
                </div>

                <div className="dash-detail-body">
                  <div>
                    <div className="dash-detail-title-row">
                      <h3 className="dash-detail-title">{selectedIdea.title}</h3>
                      <span className="dash-session-pill">{selectedIdea.session} Session</span>
                    </div>
                    <p className="dash-detail-leader">
                      Leader: <span className="dash-detail-leader-name">{selectedIdea.leader.name}</span>
                    </p>
                  </div>

                  <div className="dash-detail-section">
                    <h4 className="dash-section-label">Full Description</h4>
                    <div className="dash-detail-description">
                      <p className="dash-section-text">{selectedIdea.fullDescription}</p>
                    </div>
                  </div>

                  <div className="dash-detail-section">
                    <h4 className="dash-section-label">Team Members</h4>
                    <div className="dash-team-list">
                      {selectedIdea.team.length > 0 ? selectedIdea.team.map((member, idx) => (
                        <span key={idx} className="dash-team-pill">
                          <span className="material-symbols-outlined dash-team-pill-icon">person</span>
                          {member.name}
                        </span>
                      )) : (
                        <span className="dash-team-empty">No additional team members</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dash-feedback-section">
                  <label className="dash-feedback-label-wrapper">
                    <span className="dash-feedback-label">
                      Feedback <span className="dash-feedback-label-note">(Remarks/Reason for decision)</span>
                    </span>
                    <div className="dash-feedback-input-wrap">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="dash-feedback-input"
                        placeholder="Enter feedback for the students..."
                      ></textarea>
                      <button
                        onClick={async () => {
                          if (feedback.trim()) {
                            try {
                              const result = await sendFeedback(
                                selectedIdea._id || selectedIdea.id,
                                selectedIdea.title,
                                selectedIdea.leader.name,
                                feedback,
                                'Teacher',
                                selectedIdea.projectName || '',
                                selectedIdea.groupId || ''
                              );

                              if (result.success) {
                                alert('Feedback sent to student!');
                                setFeedback('');
                              } else {
                                alert('Error sending feedback: ' + result.message);
                              }
                            } catch (error) {
                              console.error('Error sending feedback:', error);
                              alert('Error sending feedback');
                            }
                          } else {
                            alert('Please enter feedback before sending');
                          }
                        }}
                        className="dash-feedback-send-btn"
                        type="button"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                        Send
                      </button>
                    </div>
                  </label>
                </div>

                <div className="dash-actions-row">
                  <button
                    onClick={() => onUpdateStatus(selectedIdea.id, 'Rejected', feedback)}
                    className="dash-btn dash-btn-outline dash-btn-reject"
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                    Reject
                  </button>
                  <button
                    onClick={() => onUpdateStatus(selectedIdea.id, 'Accepted')}
                    className="dash-btn dash-btn-accept"
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    Accept
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issues Panel */}
      {showIssues && (
        <div className="issues-overlay">
          <div className="issues-panel">
            <div className="issues-header">
              <h2 className="issues-title">Student Issues</h2>
              <button 
                onClick={() => setShowIssues(false)}
                className="issues-close-btn"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="issues-content">
              {Object.entries(issuesByCategory).map(([category, issues]) => (
                <div key={category} className="issues-category">
                  <h3 className="issues-category-title">{category}</h3>
                  <div className="issues-list">
                    {issues.map(issue => (
                      <div 
                        key={issue.id}
                        className="issues-item"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="issues-item-header">
                          <span className="issues-item-title">{issue.category} Issue</span>
                          <span className="issues-urgency issues-urgency-pending">
                            {issue.status}
                          </span>
                        </div>
                        <p className="issues-item-desc">{issue.description}</p>
                        <div className="issues-item-meta">
                          <span>{issue.studentName}</span>
                          <span>{new Date(issue.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Issue Reply Section */}
            {selectedIssue && (
              <div className="issues-reply-section">
                <h4>Reply to: {selectedIssue.category} Issue</h4>
                <textarea
                  value={issueReply}
                  onChange={(e) => setIssueReply(e.target.value)}
                  className="issues-reply-input"
                  placeholder="Type your reply to the student..."
                ></textarea>
                <div className="issues-reply-actions">
                  <button 
                    onClick={async () => {
                      if (issueReply.trim()) {
                        try {
                          const result = await replyToIssue(selectedIssue.id, issueReply);
                          
                          if (result.success) {
                            // Update local state
                            const updatedIssues = studentIssues.map(issue => 
                              issue.id === selectedIssue.id 
                                ? { ...issue, teacherReply: issueReply, status: 'Replied' }
                                : issue
                            );
                            setStudentIssues(updatedIssues);
                            
                            alert(`Reply sent to ${selectedIssue.studentName}: ${issueReply}`);
                            setIssueReply('');
                            setSelectedIssue(null);
                          } else {
                            alert('Error sending reply: ' + result.message);
                          }
                        } catch (error) {
                          console.error('Error sending reply:', error);
                          alert('Error sending reply');
                        }
                      } else {
                        alert('Please enter a reply before sending');
                      }
                    }}
                    className="issues-send-btn"
                  >
                    <span className="material-symbols-outlined">send</span>
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
