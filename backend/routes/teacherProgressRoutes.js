import express from 'express';
import {
  getAllStudentProgress,
  getProgressByProject,
  getActiveProjectsProgress,
  updateStudentProgress,
  getLatestProgress
} from '../controllers/teacherProgressController.js';

const router = express.Router();

// Get all student progress data
router.get('/all', getAllStudentProgress);

// Get progress by project name
router.get('/project/:projectName', getProgressByProject);

// Get active projects with their progress
router.get('/active', getActiveProjectsProgress);

// Update student progress
router.put('/update', updateStudentProgress);

// Get latest progress (for real-time updates)
router.get('/latest', getLatestProgress);

export default router;
