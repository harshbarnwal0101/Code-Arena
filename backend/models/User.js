import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    default: null
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
}, {
  timestamps: true
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User; 