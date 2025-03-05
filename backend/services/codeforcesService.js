import axios from 'axios';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

export const codeforcesService = {
  async getUserInfo(handle) {
    try {
      console.log('Fetching Codeforces user info for:', handle);
      const response = await axios.get(`${CODEFORCES_API_BASE}/user.info`, {
        params: { handles: handle }
      });
      
      if (response.data.status === 'OK') {
        console.log('Codeforces API response:', response.data.result[0]);
        return response.data.result[0];
      }
      throw new Error('User not found on Codeforces');
    } catch (error) {
      console.error('Codeforces API error:', error.response?.data || error.message);
      throw new Error('Invalid Codeforces handle');
    }
  },
  async searchProblems(query = '', filters = {}) {
    try {
      console.log('Making request to Codeforces API with:', { query, filters });
      const response = await axios.get(`${CODEFORCES_API_BASE}/problemset.problems`);
      
      if (response.data.status !== 'OK') {
        console.error('Codeforces API error:', response.data);
        throw new Error('Failed to fetch problems from Codeforces');
      }

      let problems = response.data.result.problems;
      console.log(`Total problems fetched: ${problems.length}`);

      // Apply filters
      if (query) {
        const searchQuery = query.toLowerCase();
        problems = problems.filter(problem =>
          problem.name.toLowerCase().includes(searchQuery) ||
          (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchQuery)))
        );
        console.log(`After query filter: ${problems.length} problems`);
      }

      if (filters.minRating) {
        const minRating = parseInt(filters.minRating);
        problems = problems.filter(problem => 
          problem.rating && problem.rating >= minRating
        );
        console.log(`After minRating filter (${minRating}): ${problems.length} problems`);
      }

      if (filters.maxRating) {
        const maxRating = parseInt(filters.maxRating);
        problems = problems.filter(problem => 
          problem.rating && problem.rating <= maxRating
        );
        console.log(`After maxRating filter (${maxRating}): ${problems.length} problems`);
      }

      if (filters.tags && filters.tags.length > 0) {
        problems = problems.filter(problem =>
          problem.tags && filters.tags.every(tag => problem.tags.includes(tag))
        );
        console.log(`After tags filter (${filters.tags.join(',')}): ${problems.length} problems`);
      }

      // Format problems for frontend
      const formattedProblems = problems.map(problem => ({
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || 0,
        tags: problem.tags || []
      })).slice(0, 50); // Limit to 50 results

      console.log(`Returning ${formattedProblems.length} problems`);
      return formattedProblems;

    } catch (error) {
      console.error('Codeforces API error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error('Failed to fetch problems from Codeforces');
    }
  },
  async getProblemInfo(contestId, problemIndex) {
    try {
      console.log('Fetching problem info:', { contestId, problemIndex });
      
      // Get problem from problemset
      const response = await axios.get(`${CODEFORCES_API_BASE}/problemset.problems`);
      
      if (response.data.status !== 'OK') {
        throw new Error('Failed to fetch problems from Codeforces');
      }

      const problem = response.data.result.problems.find(
        p => p.contestId === parseInt(contestId) && p.index === problemIndex
      );

      if (!problem) {
        throw new Error('Problem not found');
      }

      return {
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        rating: problem.rating || 0,
        tags: problem.tags
      };
    } catch (error) {
      console.error('Error fetching problem info:', error);
      throw new Error('Failed to fetch problem information');
    }
  },
  async getUserContests(handle) {
    // ... existing getUserContests method ...
  },
  async getUserSubmissions(handle) {
    // ... existing getUserSubmissions method ...
  }
}; 