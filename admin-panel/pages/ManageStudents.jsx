import React, { useState, useMemo, useEffect } from 'react';
import adminApi from '../api/adminApi';
import '../styles/ManageStudents.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    session: '',
  });
  const [activeSession, setActiveSession] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await adminApi.getStudents();
        setStudents(response.students || []);
      } catch (error) {
        setErrorMessage('Unable to load student list.');
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (activeSession === 'all') return students;
    return students.filter((student) => student.session === activeSession);
  }, [students, activeSession]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formState.name || !formState.email || !formState.session) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      if (!formState.email.includes('@')) {
        setErrorMessage("Email is missing '@' symbol");
      } else if (!formState.email.includes('.')) {
        setErrorMessage("Email is missing domain extension (e.g., .com)");
      } else if (formState.email.split('@')[1].split('.')[0].length === 0) {
        setErrorMessage("Email is missing domain name after '@'");
      } else if (formState.email.split('.')[1].length < 2) {
        setErrorMessage("Email domain extension is too short (e.g., .com)");
      } else {
        setErrorMessage('Invalid email format. Use format: name@gmail.com');
      }
      return;
    }

    // Additional validation for domain name length and TLD
    const domainParts = formState.email.split('@');
    const domain = domainParts[1];
    const domainName = domain.split('.')[0];
    const tld = domain.split('.')[1];

    if (domainName.length < 3) {
      setErrorMessage('Domain name is too short. Use format: name@gmail.com');
      return;
    }

    const validTLDs = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'io', 'co', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'jp', 'cn', 'in', 'br', 'mx', 'ru', 'za', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'ch', 'at', 'be', 'gr', 'pt', 'ie', 'hu', 'cz', 'sk', 'si', 'hr', 'ba', 'rs', 'bg', 'ro', 'ua', 'by', 'kz', 'uz', 'kg', 'tj', 'tm', 'ge', 'am', 'az', 'tr', 'cy', 'il', 'jo', 'lb', 'sy', 'iq', 'ir', 'pk', 'af', 'bd', 'lk', 'np', 'bt', 'mm', 'th', 'vn', 'kh', 'la', 'my', 'sg', 'id', 'ph', 'tw', 'hk', 'mo', 'kr', 'kp', 'mn'];

    if (!validTLDs.includes(tld.toLowerCase())) {
      setErrorMessage('Invalid domain extension. Use valid TLD like .com, .net, .org, .edu');
      return;
    }

    try {
      const response = await adminApi.addStudent({
        name: formState.name,
        email: formState.email,
        session: formState.session,
      });

      const createdStudent = response.student;
      const initials = createdStudent.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      const colorClasses = [
        'student-avatar-indigo',
        'student-avatar-pink',
        'student-avatar-teal',
        'student-avatar-blue',
      ];
      const randomColorClass =
        colorClasses[Math.floor(Math.random() * colorClasses.length)];

      const isMorning = createdStudent.session === 'Morning';
      const sessionClass = isMorning ? 'session-badge-amber' : 'session-badge-purple';
      const dotClass = isMorning ? 'session-dot-amber' : 'session-dot-purple';

      const newStudent = {
        id: createdStudent.id,
        name: createdStudent.name,
        email: createdStudent.email,
        session: createdStudent.session,
        roll: createdStudent.roll,
        initials,
        colorClass: randomColorClass,
        sessionClass,
        dotClass,
      };

      setStudents((prev) => [newStudent, ...prev]);
      setFormState({ name: '', email: '', session: '' });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || 'Unable to add student. Please try again.'
      );
    }
  };

  return (
    <div className="manage-students-root">
      <div className="manage-students-header-row">
        <div>
          <h2 className="manage-students-title">Manage Students</h2>
          <p className="manage-students-subtitle">
            Easily add, manage and view all student information here.
          </p>
        </div>
      </div>

      {/* Add New Student */}
      <section className="manage-card">
        <div className="manage-card-header">
          <h3 className="manage-card-header-title">
            Add New Student
          </h3>
        </div>
        <div className="manage-card-body">
          <form
            className="manage-form-grid"
            onSubmit={handleAddStudent}
          >
            <div className="manage-form-col">
              <label className="manage-label">Full Name</label>
              <input
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                className="manage-input"
                placeholder="Enter student name"
                type="text"
              />
            </div>
            <div className="manage-form-col">
              <label className="manage-label">Email Address</label>
              <input
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                className="manage-input"
                placeholder="Enter student email"
                type="email"
              />
            </div>
            <div className="manage-form-col">
              <label className="manage-label">Session</label>
              <div className="manage-select-wrapper">
                <select
                  value={formState.session}
                  onChange={(e) =>
                    setFormState({ ...formState, session: e.target.value })
                  }
                  className="manage-select"
                >
                  <option disabled value="">
                    Select Session
                  </option>
                  <option value="morning">Morning Session</option>
                  <option value="evening">Evening Session</option>
                </select>
                <span className="manage-select-icon">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>
            <div className="manage-form-col">
              <button
                className="manage-submit-btn"
                type="submit"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Add Student</span>
              </button>
            </div>
            {errorMessage && (
              <div className="manage-error-message">
                <span className="material-symbols-outlined">error</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Student Directory */}
      <section className="manage-card">
        <div className="manage-card-header manage-table-header">
          <h3 className="manage-card-header-title">Students List</h3>
          <div className="manage-filters">
            <div className="manage-session-toggle">
              <button
                type="button"
                onClick={() => setActiveSession('all')}
                className={
                  'manage-session-btn ' +
                  (activeSession === 'all'
                    ? 'manage-session-btn-active-all'
                    : 'manage-session-btn-inactive')
                }
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveSession('Morning')}
                className={
                  'manage-session-btn ' +
                  (activeSession === 'Morning'
                    ? 'manage-session-btn-active-morning'
                    : 'manage-session-btn-hover')
                }
              >
                Morning
              </button>
              <button
                type="button"
                onClick={() => setActiveSession('Evening')}
                className={
                  'manage-session-btn ' +
                  (activeSession === 'Evening'
                    ? 'manage-session-btn-active-evening'
                    : 'manage-session-btn-hover')
                }
              >
                Evening
              </button>
            </div>
          </div>
        </div>

        <div className="manage-table-wrapper">
          <table className="manage-table">
            <thead className="manage-table-head">
              <tr>
                <th className="manage-table-th">Name</th>
                <th className="manage-table-th">Email</th>
                <th className="manage-table-th">Session</th>
              </tr>
            </thead>
            <tbody className="manage-table-body">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="manage-table-row">
                    <td className="manage-table-td">
                      <div className="manage-student-cell">
                        <div
                          className={
                            'manage-student-avatar ' + student.colorClass
                          }
                        >
                          {student.initials}
                        </div>
                        <div className="manage-student-name">
                          {student.name}
                        </div>
                      </div>
                    </td>
                    <td className="manage-table-td">{student.email}</td>
                    <td className="manage-table-td">
                      <span
                        className={
                          'manage-session-badge ' + student.sessionClass
                        }
                      >
                        <span
                          className={
                            'manage-session-dot ' + student.dotClass
                          }
                        />
                        {student.session}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="manage-table-empty"
                  >
                    {activeSession === 'all'
                      ? 'No students found. Add one above.'
                      : `No ${activeSession.toLowerCase()} session students found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="manage-table-footer">
          <p>
            Showing{' '}
            <span className="manage-footer-count">
              {activeSession === 'all'
                ? students.length
                : filteredStudents.length}
            </span>{' '}
            {activeSession === 'all'
              ? 'students'
              : `${activeSession} session students`}
          </p>
        </div>
      </section>
    </div>
  );
};

export default ManageStudents;