import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Contest from './models/Contest.js';
import { createServer } from 'http';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import { updateContestStatuses } from './utils/contestUpdater.js';
import { Server } from 'socket.io';
import problemRoutes from './routes/problemRoutes.js';
import morgan from 'morgan';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n--------------------');
  console.log('New request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Bearer [hidden]' : 'none'
    }
  });
  
  // Log response
  const oldSend = res.send;
  res.send = function(data) {
    console.log('Response:', {
      status: res.statusCode,
      body: data
    });
    console.log('--------------------\n');
    return oldSend.apply(res, arguments);
  };
  
  next();
});

// Logging middleware
app.use(morgan('dev'));

// MongoDB Connection
import connectDB from './config/db.js';
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        solved: user.solved
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    // For testing purposes
    if (email === 'test@test.com' && password === 'test123') {
      const token = jwt.sign(
        { userId: 'test-id' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: 'test-id',
          email: 'test@test.com',
          username: 'testuser',
          codeforcesId: null
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        solved: user.solved
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route example
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      rating: user.rating,
      solved: user.solved
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Test route to check database collections
app.get('/api/test/db-status', async (req, res) => {
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Get counts for each collection
    const userCount = await User.countDocuments();
    const contestCount = await Contest.countDocuments();

    // Get sample data
    const recentUsers = await User.find().limit(3).select('-password');
    const recentContests = await Contest.find().limit(3);

    res.json({
      status: 'Connected',
      database: mongoose.connection.name,
      collections: collectionNames,
      stats: {
        users: userCount,
        contests: contestCount
      },
      samples: {
        users: recentUsers,
        contests: recentContests
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route to create sample data
app.post('/api/test/create-samples', async (req, res) => {
  try {
    // Create a test user if none exists
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('test123', 10);
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        codeforcesId: 'tourist',
        rating: 1500
      });
    }

    // Create a test contest if none exists
    const testContest = await Contest.findOne({ title: 'Test Contest' });
    if (!testContest) {
      await Contest.create({
        title: 'Test Contest',
        creator: 'tourist',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        duration: 120, // 2 hours
        problems: [
          {
            problemId: 'A',
            contestId: '1234',
            name: 'Test Problem',
            rating: 800,
            tags: ['implementation', 'math']
          }
        ],
        participants: [
          {
            codeforcesId: 'tourist',
            joinedAt: new Date()
          }
        ]
      });
    }

    res.json({ message: 'Sample data created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route after your other routes
app.get('/api/test/all-data', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    const contests = await Contest.find();
    
    res.json({
      users,
      contests,
      counts: {
        users: users.length,
        contests: contests.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a route to clear test data
app.delete('/api/test/clear-data', async (req, res) => {
  try {
    await User.deleteMany({});
    await Contest.deleteMany({});
    
    res.json({ message: 'All test data cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contest statuses periodically
setInterval(updateContestStatuses, 60000); // Check every minute

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('joinContest', (contestId) => {
    socket.join(`contest:${contestId}`);
  });

  socket.on('leaveContest', (contestId) => {
    socket.leave(`contest:${contestId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Export io instance for use in other files
export { io };

// Server startup with port handling
const startServer = async (retries = 0) => {
  const maxRetries = 5;
  const basePort = process.env.PORT || 5000;
  const port = basePort + retries;

  try {
    const server = createServer(app);
    
    await new Promise((resolve, reject) => {
      server.listen(port);
      
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}...`);
          server.close();
          if (retries < maxRetries) {
            startServer(retries + 1);
          } else {
            console.error('No available ports found after maximum retries');
            process.exit(1);
          }
        } else {
          reject(error);
        }
      });

      server.on('listening', () => {
        console.log(`Server running on port ${port}`);
        // Update the port in a way that the frontend can access it
        app.set('port', port);
        resolve();
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Add a route to get the current port
app.get('/api/server-info', (req, res) => {
  res.json({ port: app.get('port') });
}); 