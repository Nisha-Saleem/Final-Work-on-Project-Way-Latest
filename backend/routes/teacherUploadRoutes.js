import express from 'express';
import {
  uploadFile,
  getAllUploads,
  getUploadById,
  deleteUpload
} from '../controllers/teacherUploadController.js';

const router = express.Router();

// Upload a new file (for teacher)
router.post('/upload', uploadFile);

// Get all teacher uploads
router.get('/all', getAllUploads);

// Get upload by ID
router.get('/:id', getUploadById);

// Delete upload (for teacher)
router.delete('/:id', deleteUpload);

export default router;
