// backend/routes/contestRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createContest,
  getContests,
  getContestById,
  joinContest,
  updateContestStatus,
  getContestStandings,
  processSubmission
} from '../controllers/contestController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

router.post('/create', createContest);
router.get('/', getContests);
router.get('/:id', getContestById);
router.post('/:id/join', joinContest);
router.put('/:id/status', updateContestStatus);
router.get('/:id/standings', getContestStandings);
router.post('/:id/submissions', processSubmission);


export default router; // src/services/contestService.js
