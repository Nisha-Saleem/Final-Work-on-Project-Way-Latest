import express from 'express';
import {
  createFeedback,
  getFeedbackByLeader,
  getAllFeedback,
  getFeedbackByIdea,
  getFeedbackByGroup,
  deleteFeedback,
  markFeedbackAsRead
} from '../controllers/feedbackController.js';

const router = express.Router();

// Create feedback (for teacher)
router.post('/create', createFeedback);

// Get all feedback for a student
router.get('/leader/:leaderName', getFeedbackByLeader);

// Get all feedback (for teacher)
router.get('/all', getAllFeedback);

// Get feedback by group ID (for group-specific feedback)
router.get('/group/:groupId', getFeedbackByGroup);

// Get feedback by idea ID
router.get('/idea/:ideaId', getFeedbackByIdea);

// Delete feedback
router.delete('/:id', deleteFeedback);

// Mark feedback as read
router.put('/:id/read', markFeedbackAsRead);

export default router;
