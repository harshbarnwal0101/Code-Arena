import axios from 'axios';
import Contest from '../models/Contest.js';

class SubmissionMonitor {
  constructor() {
    this.activeContests = new Map(); // contestId -> Set of participant codeforcesIds
    this.lastCheckedTime = new Map(); // contestId -> timestamp
  }

  async startMonitoring(contestId) {
    const contest = await Contest.findById(contestId)
      .populate('participants.user', 'codeforcesId');
    
    if (!contest || contest.status !== 'ongoing') return;

    const participantIds = new Set(
      contest.participants
        .map(p => p.user.codeforcesId)
        .filter(id => id) // Filter out null/undefined
    );

    this.activeContests.set(contestId, participantIds);
    this.lastCheckedTime.set(contestId, Date.now());

    // Start checking submissions
    this.checkSubmissions(contestId);
  }

  async stopMonitoring(contestId) {
    this.activeContests.delete(contestId);
    this.lastCheckedTime.delete(contestId);
  }

  async checkSubmissions(contestId) {
    try {
      const contest = await Contest.findById(contestId);
      if (!contest || contest.status !== 'ongoing') {
        this.stopMonitoring(contestId);
        return;
      }

      const participantIds = this.activeContests.get(contestId);
      const lastChecked = this.lastCheckedTime.get(contestId);

      // Get recent submissions from Codeforces
      const submissions = await this.getCodeforcesSubmissions(Array.from(participantIds));
      
      // Filter submissions after last check
      const newSubmissions = submissions.filter(sub => 
        new Date(sub.creationTimeSeconds * 1000) > lastChecked
      );

      // Process new submissions
      for (const submission of newSubmissions) {
        const problemId = `${submission.contestId}${submission.problem.index}`;
        const contestProblem = contest.problems.find(p => 
          `${p.contestId}${p.problemIndex}` === problemId
        );

        if (contestProblem) {
          await this.processSubmission(contest, submission);
        }
      }

      this.lastCheckedTime.set(contestId, Date.now());

      // Schedule next check
      setTimeout(() => this.checkSubmissions(contestId), 30000); // Check every 30 seconds
    } catch (error) {
      console.error('Error checking submissions:', error);
      // Retry after delay
      setTimeout(() => this.checkSubmissions(contestId), 60000);
    }
  }

  async getCodeforcesSubmissions(handles) {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.status?handle=${handles.join(';')}&from=1&count=100`
      );
      return response.data.result;
    } catch (error) {
      console.error('Codeforces API error:', error);
      return [];
    }
  }

  async processSubmission(contest, cfSubmission) {
    const participant = contest.participants.find(p => 
      p.user.codeforcesId === cfSubmission.author.members[0].handle
    );

    if (!participant) return;

    const submissionTime = new Date(cfSubmission.creationTimeSeconds * 1000);
    const startTime = new Date(contest.startTime);
    const timeFromStart = Math.floor((submissionTime - startTime) / (1000 * 60));

    // Add submission to contest
    contest.submissions.push({
      userId: participant.user._id,
      problemIndex: cfSubmission.problem.index,
      verdict: cfSubmission.verdict,
      submissionTime,
      timeFromStart
    });

    // Update score if accepted
    if (cfSubmission.verdict === 'OK') {
      const problemStats = participant.solvedProblems.find(p => 
        p.problemIndex === cfSubmission.problem.index
      );

      if (!problemStats) {
        const attempts = contest.submissions.filter(s => 
          s.userId.toString() === participant.user._id.toString() &&
          s.problemIndex === cfSubmission.problem.index &&
          s.submissionTime < submissionTime
        ).length;

        participant.solvedProblems.push({
          problemIndex: cfSubmission.problem.index,
          solvedAt: submissionTime,
          attempts: attempts + 1,
          penalty: calculatePenalty(timeFromStart, attempts + 1)
        });

        participant.totalSolved += 1;
        participant.totalPenalty += calculatePenalty(timeFromStart, attempts + 1);
      }
    }

    await contest.save();
  }
}

export const submissionMonitor = new SubmissionMonitor(); 