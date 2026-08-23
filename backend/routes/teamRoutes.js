import express from 'express';
import {
  saveTeam,
  getTeamByProject,
  getTeamByGroupId,
  verifyLeaderPassword,
  updateProjectName,
  deleteTeam
} from '../controllers/teamController.js';

const router = express.Router();

// Create or update a team
router.post('/save', saveTeam);

// Get team by project name
router.get('/project/:projectName', getTeamByProject);

// Get team by groupId
router.get('/group/:groupId', getTeamByGroupId);

// Verify leader password
router.post('/verify', verifyLeaderPassword);

// Update project name
router.put('/project-name', updateProjectName);

// Delete team
router.delete('/:projectName', deleteTeam);

export default router;
