import React, { useEffect, useState } from "react";

const AssignTask = ({ onAddTask, leaderName, members, leaderPassword, groupId }) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [isAssignUnlocked, setIsAssignUnlocked] = useState(false);
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    setIsAssignUnlocked(false);
    setGatePassword("");
    setGateError("");
  }, [leaderName, leaderPassword]);

  if (!leaderName) {
    return (
      <div className="assign-access-wrapper">
        <div className="assign-access-icon">
          <span className="material-symbols-outlined assign-access-lock">
            lock
          </span>
        </div>
        <h2 className="assign-access-title">Access Restricted</h2>
        <p className="assign-access-text">
          Only the Group Leader can assign tasks.
          The leader must enter the same password from the Progress Tracking page to unlock this page.
        </p>
      </div>
    );
  }

  if (!leaderPassword) {
    return (
      <div className="assign-access-wrapper">
        <div className="assign-access-icon">
          <span className="material-symbols-outlined assign-access-lock">
            lock
          </span>
        </div>
        <h2 className="assign-access-title">Set a leader password</h2>
        <p className="assign-access-text">
          Go to <strong>Progress Tracking</strong> and use{" "}
          <strong>Save team</strong> so your leader password is stored. Then
          return here and enter that password to assign tasks.
        </p>
      </div>
    );
  }

  const handleUnlockAssign = () => {
    if (gatePassword !== leaderPassword) {
      setGateError("Password does not match the one you saved with your team.");
      return;
    }
    setGateError("");
    setIsAssignUnlocked(true);
  };

  if (!isAssignUnlocked) {
    return (
      <div className="assign-page">
        <div className="assign-header">
          <h1 className="assign-title">Confirm leader access</h1>
          <p className="assign-subtitle">
            Enter the same password you saved for{" "}
            <span className="assign-leader-name">{leaderName}</span> on
            Progress Tracking.
          </p>
        </div>

        <div className="assign-card">
          <div className="assign-card-border" />
          <div className="assign-card-header">
            <h2 className="assign-card-header-title">
              <span className="material-symbols-outlined assign-card-header-icon">
                verified_user
              </span>
              Leader password
            </h2>
          </div>
          <div className="assign-card-body assign-gate-body">
            <div className="assign-field assign-field-full">
              <label className="assign-label" htmlFor="assign-gate-password">
                Password <span className="assign-required">*</span>
              </label>
              <input
                id="assign-gate-password"
                type="password"
                value={gatePassword}
                onChange={(e) => {
                  setGatePassword(e.target.value);
                  setGateError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlockAssign()}
                className="assign-input"
                placeholder="Type your leader password"
                autoComplete="current-password"
              />
              {gateError ? (
                <p className="assign-gate-error" role="alert">
                  {gateError}
                </p>
              ) : null}
            </div>
            <div className="assign-footer assign-footer-narrow">
              <button
                type="button"
                onClick={handleUnlockAssign}
                className="assign-submit-btn"
                disabled={!gatePassword.trim()}
              >
                <span className="material-symbols-outlined assign-submit-icon">
                  lock_open
                </span>
                Continue to assign tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      alert("Please enter a Task Description.");
      return;
    }

    if (!newTaskAssignee) {
      alert("Please select a member to assign the task to.");
      return;
    }

    const newTask = {
      id: Date.now(),
      name: newTaskName,
      assignedTo: newTaskAssignee,
      deadline: newTaskDate || "TBD",
      status: "Pending",
      initials: newTaskAssignee.charAt(0).toUpperCase(),
      colorClass: "bg-slate-200 text-slate-700",
      groupId,
    };

    onAddTask(newTask);

    setNewTaskName("");
    setNewTaskDate("");
    setNewTaskAssignee("");

    alert(`Task assigned to ${newTaskAssignee}!`);
  };

  return (
    <div className="assign-page">
      <div className="assign-header">
        <h1 className="assign-title">Assign New Task</h1>
        <p className="assign-subtitle">
          Logged in as Leader:{" "}
          <span className="assign-leader-name">{leaderName}</span>
        </p>
      </div>

      <div className="assign-card">
        <div className="assign-card-border" />
        <div className="assign-card-header">
          <h2 className="assign-card-header-title">
            <span className="material-symbols-outlined assign-card-header-icon">
              assignment_add
            </span>
            Task Details
          </h2>
        </div>

        <div className="assign-card-body">
          {/* Task Name */}
          <div className="assign-field assign-field-full">
            <label className="assign-label">
              Task Description <span className="assign-required">*</span>
            </label>
            <input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="assign-input"
              placeholder="Enter task description like 'Design the homepage'..."
              type="text"
            />
          </div>

          {/* Assign To */}
          <div className="assign-field">
            <label className="assign-label">
              Assign To <span className="assign-required">*</span>
            </label>
            <div className="assign-select-wrapper">
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="assign-select"
              >
                <option value="">Select a member...</option>
                <option value={leaderName}>{leaderName} (leader)</option>
                {members.map((member, idx) => (
                  <option key={idx} value={member}>
                    {member}
                  </option>
                ))}
              </select>
              <span className="assign-select-icon-wrapper">
                <span className="material-symbols-outlined assign-select-icon">
                  expand_more
                </span>
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="assign-field">
            <label className="assign-label">Deadline</label>
            <div className="assign-date-wrapper">
              <input
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="assign-input assign-input-date"
                type="date"
              />
              <span className="material-symbols-outlined assign-date-icon">
                calendar_today
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="assign-footer">
            <button type="button" onClick={handleAddTask} className="assign-submit-btn">
              <span className="material-symbols-outlined assign-submit-icon">
                add_task
              </span>
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTask;
