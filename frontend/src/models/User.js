import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  codeforcesId: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  rating: {
    type: Number,
    default: 0
  },
  rank: String,
  contestHistory: [{
    contestId: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    date: Date
  }],
  solvedProblems: [{
    problemId: String,
    contestId: String,
    rating: Number,
    tags: [String],
    solvedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

export default mongoose.model('User', userSchema);