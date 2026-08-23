import express from 'express';
import {
  submitIssue,
  getAllIssues,
  getIssuesByCategory,
  replyToIssue,
  resolveIssue,
  deleteIssue,
  markIssueAsRead
} from '../controllers/teacherIssueController.js';

const router = express.Router();

// Submit a new student issue
router.post('/submit', submitIssue);

// Get all student issues
router.get('/all', getAllIssues);

// Get issues by category
router.get('/category/:category', getIssuesByCategory);

// Reply to student issue
router.put('/reply/:id', replyToIssue);

// Resolve issue
router.put('/resolve/:id', resolveIssue);

// Delete issue
router.delete('/:id', deleteIssue);

// Mark issue as read
router.put('/:id/read', markIssueAsRead);

export default router;
