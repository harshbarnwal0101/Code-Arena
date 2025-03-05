import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemIndex: {
    type: String,
    required: true
  },
  verdict: {
    type: String,
    required: true
  },
  submissionTime: {
    type: Date,
    required: true
  },
  // Time in minutes from contest start
  timeFromStart: {
    type: Number,
    required: true
  }
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  solvedProblems: [{
    problemIndex: String,
    solvedAt: Date,
    attempts: Number,
    penalty: Number // In minutes
  }],
  totalSolved: {
    type: Number,
    default: 0
  },
  totalPenalty: {
    type: Number,
    default: 0
  }
});

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // in minutes
    required: true,
    min: 30,
    max: 300
  },
  problems: [{
    contestId: String,
    problemIndex: String,
    name: String,
    rating: Number,
    tags: [String]
  }],
  participants: [participantSchema],
  submissions: [submissionSchema],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  accessCode: {
    type: String,
    required: function() {
      return this.isPrivate;
    }
  },
}, {
  timestamps: true
});

// Add index for efficient querying
contestSchema.index({ startTime: 1, status: 1 });

export default mongoose.model('Contest', contestSchema); 