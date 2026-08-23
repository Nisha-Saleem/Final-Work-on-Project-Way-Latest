import express from 'express';
import {
  createTask,
  getTasksByProject,
  getTasksByAssignee,
  getTasksByGroupId,
  toggleTaskStatus,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';

const router = express.Router();

// Create a new task
router.post('/create', createTask);

// Get all tasks for a project
router.get('/project/:projectName', getTasksByProject);

// Get tasks by assignee
router.get('/assignee/:assignee', getTasksByAssignee);

// Get tasks by groupId
router.get('/group/:groupId', getTasksByGroupId);

// Toggle task status
router.put('/toggle/:id', toggleTaskStatus);

// Delete task
router.delete('/:id', deleteTask);

// Get task statistics for a project
router.get('/stats/:projectName', getTaskStats);

export default router;
