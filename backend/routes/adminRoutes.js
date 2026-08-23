import express from 'express';
import {
  getDashboard,
  getTeachers,
  addTeacher,
  getStudents,
  addStudent,
  getRoles,
  updateRole,
} from '../controllers/adminController.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateJWT, requireAdmin);
router.get('/dashboard', getDashboard);
router.get('/teachers', getTeachers);
router.post('/teachers', addTeacher);
router.get('/students', getStudents);
router.post('/students', addStudent);
router.get('/roles', getRoles);
router.put('/roles/:roleId', updateRole);

export default router;
