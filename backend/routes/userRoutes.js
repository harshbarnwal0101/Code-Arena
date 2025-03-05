import express from 'express';
import { updateUserData, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update-data', protect, updateUserData);
router.get('/profile/:codeforcesId', protect, getUserProfile);

export default router; 