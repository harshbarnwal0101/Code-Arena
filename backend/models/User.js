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

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('Comparing passwords:', { 
    entered: enteredPassword,
    stored: this.password,
  });
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }

  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;