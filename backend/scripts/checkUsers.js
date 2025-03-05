import mongoose from 'mongoose';
import User from '../models/User.js';

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb+srv://harsh:9340825636@code-arena.sh3hs.mongodb.net/code-arena?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    const users = await User.find().select('-password');
    console.log('Users found:', users);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

checkUsers();
