import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxBodyLength: 20 * 1024 * 1024,
  maxContentLength: 20 * 1024 * 1024,
});

// Teacher Dashboard API
export const getPendingIdeas = async () => {
  try {
    const response = await api.get('/api/teacher/dashboard/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending ideas:', error);
    return { success: false, message: 'Error fetching pending ideas', error: error.message };
  }
};

export const getAllIdeasFiltered = async (filters = {}) => {
  try {
    const response = await api.get('/api/teacher/dashboard/all', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered ideas:', error);
    return { success: false, message: 'Error fetching filtered ideas', error: error.message };
  }
};

export const reviewIdea = async (ideaId, status, feedback = '', teacherName = 'Teacher') => {
  try {
    const response = await api.put(`/api/teacher/dashboard/review/${ideaId}`, {
      status,
      feedback,
      teacherName
    });
    return response.data;
  } catch (error) {
    console.error('Error reviewing idea:', error);
    return { success: false, message: 'Error reviewing idea', error: error.message };
  }
};

export const sendFeedback = async (ideaId, ideaTitle, leaderName, feedback, teacherName = 'Teacher', projectName = '', groupId = '') => {
  try {
    const response = await api.post('/api/teacher/dashboard/feedback', {
      ideaId,
      ideaTitle,
      leaderName,
      projectName,
      groupId,
      feedback,
      teacherName
    });
    return response.data;
  } catch (error) {
    console.error('Error sending feedback:', error);
    return { success: false, message: 'Error sending feedback', error: error.message };
  }
};

export const getIdeaStatistics = async () => {
  try {
    const response = await api.get('/api/teacher/dashboard/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching idea statistics:', error);
    return { success: false, message: 'Error fetching idea statistics', error: error.message };
  }
};

// Teacher Progress API
export const getAllStudentProgress = async () => {
  try {
    const response = await api.get('/api/teacher/progress/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all student progress:', error);
    return { success: false, message: 'Error fetching all student progress', error: error.message };
  }
};

export const getProgressByProject = async (projectName) => {
  try {
    const response = await api.get(`/api/teacher/progress/project/${encodeURIComponent(projectName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress by project:', error);
    return { success: false, message: 'Error fetching progress by project', error: error.message };
  }
};

export const getActiveProjectsProgress = async () => {
  try {
    const response = await api.get('/api/teacher/progress/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active projects progress:', error);
    return { success: false, message: 'Error fetching active projects progress', error: error.message };
  }
};

export const updateStudentProgress = async (progressData) => {
  try {
    const response = await api.put('/api/teacher/progress/update', progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating student progress:', error);
    return { success: false, message: 'Error updating student progress', error: error.message };
  }
};

export const getLatestProgress = async () => {
  try {
    const response = await api.get('/api/teacher/progress/latest');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest progress:', error);
    return { success: false, message: 'Error fetching latest progress', error: error.message };
  }
};

// Teacher Issues API
export const submitIssue = async (issueData) => {
  try {
    const response = await api.post('/api/teacher/issues/submit', issueData);
    return response.data;
  } catch (error) {
    console.error('Error submitting issue:', error);
    return { success: false, message: 'Error submitting issue', error: error.message };
  }
};

export const getAllIssues = async () => {
  try {
    const response = await api.get('/api/teacher/issues/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all issues:', error);
    return { success: false, message: 'Error fetching all issues', error: error.message };
  }
};

export const getIssuesByCategory = async (category) => {
  try {
    const response = await api.get(`/api/teacher/issues/category/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching issues by category:', error);
    return { success: false, message: 'Error fetching issues by category', error: error.message };
  }
};

export const replyToIssue = async (issueId, reply) => {
  try {
    const response = await api.put(`/api/teacher/issues/reply/${issueId}`, { reply });
    return response.data;
  } catch (error) {
    console.error('Error replying to issue:', error);
    return { success: false, message: 'Error replying to issue', error: error.message };
  }
};

export const resolveIssue = async (issueId) => {
  try {
    const response = await api.put(`/api/teacher/issues/resolve/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error resolving issue:', error);
    return { success: false, message: 'Error resolving issue', error: error.message };
  }
};

export const deleteIssue = async (issueId) => {
  try {
    const response = await api.delete(`/api/teacher/issues/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting issue:', error);
    return { success: false, message: 'Error deleting issue', error: error.message };
  }
};

// Notifications API (reusing existing notification routes)
export const notifications = {
  getAllNotifications: async (userName) => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const response = await api.get(`/api/notifications/all${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, message: 'Error fetching notifications', error: error.message };
    }
  },

  markAsRead: async (notificationId, userName) => {
    try {
      const response = await api.put(`/api/notifications/read/${notificationId}`, { userName });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Error marking notification as read', error: error.message };
    }
  }
};

// Teacher Uploads API (reusing existing teacher upload routes)
export const uploads = {
  getAllUploads: async () => {
    try {
      const response = await api.get('/api/teacher-uploads/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching uploads:', error);
      return { success: false, message: 'Error fetching uploads', error: error.message };
    }
  },

  uploadFile: async (fileData) => {
    try {
      const response = await api.post('/api/teacher-uploads/upload', fileData);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, message: 'Error uploading file', error: error.message };
    }
  },

  deleteUpload: async (uploadId) => {
    try {
      const response = await api.delete(`/api/teacher-uploads/${uploadId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting upload:', error);
      return { success: false, message: 'Error deleting upload', error: error.message };
    }
  }
};
