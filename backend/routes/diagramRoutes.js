// routes/diagramRoutes.js
import express from 'express';
const router = express.Router();
import { 
  saveDiagram, 
  getDiagram, 
  getAllDiagrams, 
  updateDiagram, 
  deleteDiagram 
} from '../controllers/diagramController.js';

// Route for saving diagram (create or update)
// POST /api/diagrams/save
router.post('/save', saveDiagram);

// Route for creating a new diagram
// POST /api/diagrams
router.post('/', saveDiagram);

// Route for getting all diagrams
// GET /api/diagrams
router.get('/', getAllDiagrams);

// Route for getting a specific diagram by ID
// GET /api/diagrams/:id
router.get('/:id', getDiagram);

// Alternative route for getting diagram by studentId and projectId (legacy support)
// GET /api/diagrams/student/:studentId/project/:projectId
router.get('/student/:studentId/project/:projectId', getDiagram);

// Route for updating a diagram
// PUT /api/diagrams/:id
router.put('/:id', updateDiagram);

// Route for deleting a diagram
// DELETE /api/diagrams/:id
router.delete('/:id', deleteDiagram);

export default router;