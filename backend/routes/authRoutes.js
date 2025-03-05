import express from "express";
import { register, login, verifyToken, linkCodeforces } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', protect, async (req, res) => {
  try {
    console.log('Verifying user with ID:', req.user._id); // Debug log
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', req.user._id); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User verified:', user); // Debug log
    res.json({ user });
  } catch (error) {
    console.error('Verify route error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
});
router.post('/link-codeforces', protect, linkCodeforces);

export default router; 