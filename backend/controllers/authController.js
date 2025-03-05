import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { codeforcesService } from '../services/codeforcesService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

const TEST_USER = {
  email: 'test@test.com',
  password: '$2a$10$YourHashedPasswordHere', // Will update this
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        codeforcesId: user.codeforcesId
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token with consistent ID field
    const token = jwt.sign(
      { id: user._id }, // Use 'id' consistently
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('Generated token for user:', { userId: user._id, token }); // Debug log

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        codeforcesId: user.codeforcesId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const linkCodeforces = async (req, res) => {
  try {
    const { codeforcesId } = req.body;
    console.log('Linking request:', { userId: req.user.id, codeforcesId });

    // First verify if the Codeforces handle exists
    const cfUserInfo = await codeforcesService.getUserInfo(codeforcesId);
    console.log('CF User Info:', cfUserInfo);

    // Check if handle is already linked
    const existingUser = await User.findOne({ codeforcesId });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
        message: 'This Codeforces handle is already linked to another account'
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        codeforcesId,
        rating: cfUserInfo.rating || 0,
        rank: cfUserInfo.rank || 'unrated'
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        codeforcesId: user.codeforcesId,
        rating: user.rating,
        rank: user.rank
      }
    });
  } catch (error) {
    console.error('Linking error:', error);
    res.status(400).json({
      message: error.message || 'Failed to link Codeforces account'
    });
  }
};

// Verify JWT token
export const verifyToken = async (req, res) => {
  try {
    // User is already attached by protect middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
}; 