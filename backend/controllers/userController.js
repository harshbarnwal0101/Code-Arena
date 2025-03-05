import User from '../models/User.js';

export const updateUserData = async (req, res) => {
  try {
    const { codeforcesId, contests, submissions } = req.body;
    
    const user = await User.findOne({ codeforcesId });
    if (!user) {
      throw new Error('User not found');
    }

    // Update contest history
    user.contestHistory = contests.map(contest => ({
      contestId: contest.contestId,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      date: new Date(contest.ratingUpdateTimeSeconds * 1000)
    }));

    // Update solved problems
    user.solvedProblems = submissions.map(sub => ({
      problemId: sub.problem.problemId,
      contestId: sub.problem.contestId,
      rating: sub.problem.rating,
      tags: sub.problem.tags,
      solvedAt: new Date(sub.creationTimeSeconds * 1000)
    }));

    await user.save();
    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { codeforcesId } = req.params;
    
    const user = await User.findOne({ codeforcesId });
    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      user: {
        codeforcesId: user.codeforcesId,
        rating: user.rating,
        rank: user.rank,
        contestHistory: user.contestHistory,
        solvedProblems: user.solvedProblems
      }
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}; 