import axios from 'axios';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

export const codeforcesService = {
  // Verify if user exists and get their info
  async getUserInfo(handle) {
    try {
      const response = await axios.get(`${CODEFORCES_API_BASE}/user.info`, {
        params: { handles: handle }
      });
      
      if (response.data.status === 'OK') {
        return response.data.result[0];
      }
      throw new Error('User not found');
    } catch (error) {
      throw new Error('Invalid Codeforces handle');
    }
  },

  // Get user's contest history
  async getUserContests(handle) {
    try {
      const response = await axios.get(`${CODEFORCES_API_BASE}/user.rating`, {
        params: { handle }
      });
      
      if (response.data.status === 'OK') {
        return response.data.result;
      }
      throw new Error('Contest history not found');
    } catch (error) {
      throw new Error('Failed to fetch contest history');
    }
  },

  // Get user's solved problems
  async getUserSubmissions(handle) {
    try {
      const response = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
        params: { handle, from: 1, count: 100 }
      });
      
      if (response.data.status === 'OK') {
        return response.data.result.filter(sub => sub.verdict === 'OK');
      }
      throw new Error('Submissions not found');
    } catch (error) {
      throw new Error('Failed to fetch submissions');
    }
  },

  // Get problem info
  async getProblemInfo(contestId, problemId) {
    try {
      const response = await axios.get(`${CODEFORCES_API_BASE}/contest.standings`, {
        params: {
          contestId,
          from: 1,
          count: 1
        }
      });
      
      if (response.data.status === 'OK') {
        const problem = response.data.result.problems.find(p => p.index === problemId);
        if (!problem) {
          throw new Error('Problem not found');
        }
        return {
          problemId: problem.index,
          contestId: contestId.toString(),
          name: problem.name,
          rating: problem.rating,
          tags: problem.tags
        };
      }
      throw new Error('Failed to fetch problem info');
    } catch (error) {
      throw new Error('Invalid problem');
    }
  }
}; 