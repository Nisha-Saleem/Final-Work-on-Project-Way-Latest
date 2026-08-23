import React, { useState, useEffect } from 'react';
import { getActiveProjectsProgress, getAllStudentProgress } from '../api/teacherPanelApi';
import '../styles/ProgressView.css';

const ProgressView = () => {
  const [projects, setProjects] = useState([]);
  const [studentProgressData, setStudentProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActiveProjects = async () => {
      try {
        setLoading(true);
        const result = await getActiveProjectsProgress();
        if (result.success) {
          setProjects(result.projects || []);
        }
      } catch (error) {
        console.error('Error loading active projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveProjects();
    const interval = setInterval(loadActiveProjects, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadAllProgress = async () => {
      try {
        const result = await getAllStudentProgress();
        if (result.success) {
          setStudentProgressData(result.progressData || []);
        }
      } catch (error) {
        console.error('Error loading all progress:', error);
      }
    };

    loadAllProgress();
    const interval = setInterval(loadAllProgress, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeIdeas = projects
    .filter(p => p.idea && p.idea.status === 'Accepted' && p.progress && p.progress.leaderName && (p.progress.progress > 0 || (p.progress.tasks && p.progress.tasks.length > 0)))
    .map(p => ({
      ...p.idea,
      progress: p.progress?.progress || 0,
      milestones: p.progress?.milestones || { current: 'Not started', next: 'In progress' },
      members: p.progress?.members || p.idea?.team?.map(t => t.name) || []
    }));

  const hasLiveProgress = studentProgressData && studentProgressData.length > 0;

  const displayStudentProgress = () => {
    if (!hasLiveProgress) return null;

    return studentProgressData.map((progress, index) => (
      <div key={`student-progress-${index}`} className="prog-card" style={{ border: '2px solid #4f46e5' }}>
        <div className="prog-card-main">
          <div className={`prog-group-label prog-group-label-primary`}>
            Student Progress
          </div>
          <h3 className="prog-card-title">
            {progress.projectName?.trim() || 'Student Project'}
          </h3>
          <div className="prog-card-leader-progress">
            <div className="prog-live-team">
              <p className="prog-card-leader">
                Leader: <span>{progress.leaderName?.trim() || 'Not set'}</span>
              </p>
              {progress.members && progress.members.length > 0 && (
                <p className="prog-card-leader prog-live-members">
                  Members: <span>{progress.members.join(', ')}</span>
                </p>
              )}
            </div>
            <div className="prog-card-progress">
              <div className="prog-progress-header">
                <span className="prog-progress-label">Completion</span>
                <span className="prog-progress-value">{progress.progress ?? 0}%</span>
              </div>
              <div className="prog-progress-bar-bg">
                <div
                  className={`prog-progress-bar-fill ${
                    (progress.progress ?? 0) > 80
                      ? 'prog-progress-bar-emerald'
                      : (progress.progress ?? 0) > 50
                        ? 'prog-progress-bar-primary'
                        : 'prog-progress-bar-amber'
                  }`}
                  style={{ width: `${progress.progress ?? 0}%` }}
                ></div>
              </div>
              <div className="prog-progress-milestones">
                <span>
                  {progress.tasks?.filter((t) => t.status === 'Completed').length || 0}{' '}
                  Tasks Completed
                </span>
                <span>{progress.tasks?.length || 0} Total Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="prog-page">
      <div className="prog-header">
        <div className="prog-header-text">
          <h2 className="prog-title">Student Progress</h2>
          <p className="prog-subtitle">Track project progress of all student groups.</p>
        </div>
      </div>

      <div className="prog-list">
        {loading ? (
          <div className="prog-empty">
            <p className="prog-empty-text">Loading progress data...</p>
          </div>
        ) : !hasLiveProgress ? (
          <div className="prog-empty">
            <p className="prog-empty-text">No live student progress found yet. Students need to set up their project and track progress in the student panel.</p>
          </div>
        ) : (
          displayStudentProgress()
        )}
      </div>
    </div>
  );
};

export default ProgressView;
