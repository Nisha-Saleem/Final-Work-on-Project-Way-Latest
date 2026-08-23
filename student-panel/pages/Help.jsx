import React, { useState } from 'react';
import { getUserGroupId, submitIssue } from '../api/studentPanelApi';

const Help = ({ userName, projectName }) => {
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleDescriptionChange = (e) => {
    const text = e.target.value;

      setIssueDescription(text);
      setCharCount(text.length);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueType || !issueDescription.trim()) {
      alert('Please select an issue category and provide a description');
      return;
    }

    // Create new issue
    const newIssue = {
      category: issueType,
      description: issueDescription,
      studentName: userName || 'Student',
      projectName: projectName || 'Student Project',
    };

    // Submit to backend API
    try {
      const groupResult = await getUserGroupId(userName);
      if (!groupResult.groupId) {
        alert('Please submit an idea before reporting an issue.');
        return;
      }

      const result = await submitIssue(newIssue);

      if (result.success) {
        // Reset form
        setIssueType('');
        setIssueDescription('');
        setCharCount(0);

        alert('Your issue has been submitted to the teacher!');
      } else {
        alert('Error submitting issue: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error submitting issue');
    }
  };

  return (
    <div className="help-container">
      <div className="help-header">
        <h1 className="help-title">Need Assistance?</h1>
        <p className="help-subtitle">If you are facing any issues with your project or the dashboard, please let us know.</p>
      </div>

      <div className="help-card">
        <div className="help-card-inner">
          <div className="help-card-header">
            <div className="help-icon-container">
              <span className="material-symbols-outlined help-icon">support_agent</span>
            </div>
            <div>
              <h2 className="help-card-title">Report an Issue</h2>
              <p className="help-card-description">Describe your problem in detail so your teacher can understand and help you effectively.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="help-form-group">
              <label className="help-label" htmlFor="issue-type">
                What type of issue is this?
              </label>
              <select
                className="help-select"
                id="issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="">Select an issue category...</option>
                <option value="Technical">Technical Problem</option>
                <option value="Guidance">Project Guidance</option>
                <option value="Resource">Resource Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="help-form-group">
              <label className="help-label" htmlFor="issue-description">
                Describe your Issue/Problem.
              </label>
              <textarea 
                className="help-textarea" 
                id="issue-description" 
                placeholder="Please provide specific details about what you're experiencing..."
                value={issueDescription}
                onChange={handleDescriptionChange}
                maxLength={1000}
              ></textarea>
              <p className="help-char-count">{charCount}/1000 characters</p>
            </div>

            <div className="help-footer">
              <div className="help-info-text">
                <span className="material-symbols-outlined help-info-icon">info</span>
                Your teacher will be notified immediately.
              </div>
              <div className="help-buttons">
                <button type="button" className="help-cancel-btn" onClick={() => {
                  setIssueType('');
                  setIssueDescription('');
                  setCharCount(0);
                }}>
                  Cancel
                </button>
                <button type="submit" className="help-submit-btn">
                  <span>Submit to Teacher</span>
                  <span className="material-symbols-outlined help-submit-icon">send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Help;
