import express from 'express';
import {
  submitIdea,
  getAllIdeas,
  getIdeasByLeader,
  updateIdeaStatus,
  getIdeaStats,
  getIdeaStatsByGroup,
  getFirstIdeaByGroup,
  getIdeasByGroupId
} from '../controllers/studentIdeaController.js';

const router = express.Router();

// Submit a new student idea
router.post('/submit', submitIdea);

// Get all student ideas
router.get('/all', getAllIdeas);

// Get ideas by leader name
router.get('/leader/:leaderName', getIdeasByLeader);

// Update idea status (for teacher)
router.put('/status/:id', updateIdeaStatus);

// Get idea statistics
router.get('/stats', getIdeaStats);

// Get idea statistics by group ID
router.get('/stats/group/:groupId', getIdeaStatsByGroup);

// Get first idea by group ID (for validation)
router.get('/first/:groupId', getFirstIdeaByGroup);

// Get ideas by group ID
router.get('/group/:groupId', getIdeasByGroupId);

export default router;
