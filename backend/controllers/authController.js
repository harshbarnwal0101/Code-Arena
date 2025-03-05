import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed for new user');

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    console.log('User created successfully:', { id: user._id, username: user.username });

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
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? { id: user._id, email: user.email } : 'No user');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password check:', {
      provided: password,
      stored: user.password.substring(0, 20) + '...',
      match: isMatch
    });

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful, token generated for user:', user._id);

    // Send response
    res.json({
      token,
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
    console.log('Verifying token for user:', req.user._id);
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    
    if (!user) {
      console.log('User not found during verification');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User verified:', user._id);
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
};