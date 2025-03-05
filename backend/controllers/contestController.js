import Contest from '../models/Contest.js';
import { codeforcesService } from '../services/codeforcesService.js';
import { calculatePenalty } from '../utils/contestScoring.js';
import { submissionMonitor } from '../services/submissionMonitor.js';

// Create a new contest
const createContest = async (req, res) => {
  try {
    const { title, startTime, duration, isPrivate, accessCode, problems } = req.body;

    // Verify all problems exist on Codeforces
    const verifiedProblems = await Promise.all(
      problems.map(async (problem) => {
        try {
          const problemInfo = await codeforcesService.getProblemInfo(
            problem.contestId,
            problem.problemIndex
          );
          return {
            ...problemInfo,
            points: problem.points || calculatePoints(problemInfo.rating)
          };
        } catch (error) {
          throw new Error(`Failed to verify problem ${problem.contestId}${problem.problemIndex}`);
        }
      })
    );

    const contest = await Contest.create({
      title,
      startTime,
      duration,
      isPrivate,
      accessCode: isPrivate ? accessCode : undefined,
      problems: verifiedProblems,
      creator: req.user._id
    });

    res.status(201).json(contest);
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Helper function to calculate points based on rating
const calculatePoints = (rating) => {
  if (!rating) return 100;
  return Math.max(100, Math.min(500, Math.floor(rating / 4)));
};

// Get all contests (with filters)
const getContests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    // Only filter by status if explicitly provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Show private contests if:
    // 1. User is the creator
    // 2. User is a participant
    // 3. Contest is public
    query = {
      $or: [
        { creator: req.user._id },
        { participants: { $elemMatch: { user: req.user._id } } },
        { isPrivate: false }
      ],
      ...query
    };

    const contests = await Contest.find(query)
      .populate('creator', 'username')
      .populate('participants.user', 'username')
      .sort({ startTime: -1 }); // Show newest contests first

    res.json(contests);
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get a specific contest
const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id)
      .populate('creator', 'username')
      .populate('participants.user', 'username codeforcesId');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if contest is private and user is not a participant
    if (contest.isPrivate && 
        !contest.participants.some(p => p.user._id.toString() === req.user.id) && 
        contest.creator._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This is a private contest' });
    }

    res.json(contest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join a contest
const joinContest = async (req, res) => {
  try {
    const { contestId, accessCode } = req.body;
    const contest = await Contest.findById(contestId);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if contest is private and validate access code
    if (contest.isPrivate && contest.accessCode !== accessCode) {
      return res.status(403).json({ message: 'Invalid access code' });
    }

    // Check if user is already a participant
    if (contest.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered for this contest' });
    }

    // Add user to participants
    contest.participants.push(req.user.id);
    await contest.save();

    res.json({ message: 'Successfully joined the contest' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update contest status
const updateContestStatus = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { status } = req.body;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contest.status = status;
    await contest.save();

    // Start/stop submission monitoring based on status
    if (status === 'ongoing') {
      await submissionMonitor.startMonitoring(contestId);
    } else if (status === 'completed') {
      await submissionMonitor.stopMonitoring(contestId);
    }

    res.json(contest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process a new submission
const processSubmission = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { problemIndex, verdict, submissionTime } = req.body;
    const userId = req.user.id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user is a participant
    const participant = contest.participants.find(p => p.user.toString() === userId);
    if (!participant) {
      return res.status(403).json({ message: 'Not a participant in this contest' });
    }

    // Calculate time from contest start in minutes
    const startTime = new Date(contest.startTime);
    const submissionDateTime = new Date(submissionTime);
    const timeFromStart = Math.floor((submissionDateTime - startTime) / (1000 * 60));

    // Add submission to contest
    const submission = {
      userId,
      problemIndex,
      verdict,
      submissionTime: submissionDateTime,
      timeFromStart
    };
    contest.submissions.push(submission);

    // Update participant's score if submission is accepted
    if (verdict === 'OK') {
      const problemStats = participant.solvedProblems.find(p => p.problemIndex === problemIndex);
      if (!problemStats) {
        // First time solving this problem
        const attempts = contest.submissions.filter(s => 
          s.userId.toString() === userId && 
          s.problemIndex === problemIndex &&
          s.submissionTime < submissionDateTime
        ).length;

        participant.solvedProblems.push({
          problemIndex,
          solvedAt: submissionDateTime,
          attempts: attempts + 1,
          penalty: calculatePenalty(timeFromStart, attempts + 1)
        });

        participant.totalSolved += 1;
        participant.totalPenalty += calculatePenalty(timeFromStart, attempts + 1);
      }
    }

    await contest.save();
    res.json({ message: 'Submission processed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get contest standings with ICPC scoring
const getContestStandings = async (req, res) => {
  try {
    const { contestId } = req.params;
    const contest = await Contest.findById(contestId)
      .populate('participants.user', 'username codeforcesId');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Sort participants by solved problems (desc) and penalty time (asc)
    const standings = contest.participants
      .map(participant => ({
        user: participant.user,
        solved: participant.totalSolved,
        penalty: participant.totalPenalty,
        problems: participant.solvedProblems,
        submissions: contest.submissions.filter(s => 
          s.userId.toString() === participant.user._id.toString()
        )
      }))
      .sort((a, b) => {
        if (a.solved !== b.solved) {
          return b.solved - a.solved; // More problems solved first
        }
        return a.penalty - b.penalty; // Less penalty time first
      });

    res.json(standings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export all functions in one place
export {
  createContest,
  getContests,
  getContestById,
  joinContest,
  updateContestStatus,
  getContestStandings,
  processSubmission
}; 