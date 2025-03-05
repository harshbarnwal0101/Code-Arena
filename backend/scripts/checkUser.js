import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log('\nAll users in database:');
    users.forEach(user => {
      console.log({
        id: user._id,
        email: user.email,
        username: user.username,
        passwordHash: user.password ? user.password.substring(0, 20) + '...' : 'none'
      });
    });

    // Check for specific user
    const user = await User.findOne({ email: 'test@gmail.com' });
    if (user) {
      console.log('\nFound test@gmail.com user:', {
        id: user._id,
        email: user.email,
        username: user.username,
        passwordHash: user.password ? user.password.substring(0, 20) + '...' : 'none'
      });
    } else {
      console.log('\nNo user found with email: test@gmail.com');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

checkUser();
