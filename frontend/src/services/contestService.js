import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const contestService = {
  // Search Codeforces problems
  searchProblems: async (query, filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        q: query || '',
        minRating: filters.minRating || '',
        maxRating: filters.maxRating || '',
        tags: filters.selectedTags?.join(',') || ''
      });

      console.log('Making API request to:', `${API_URL}/problems/search?${params}`);
      console.log('With headers:', { Authorization: `Bearer ${token}` });

      const response = await axios.get(
        `${API_URL}/problems/search?${params}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      );

      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Problem search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Failed to search problems');
    }
  },

  // Create a new contest
  createContest: async (contestData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_URL}/contests/create`,
        contestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create contest');
    }
  },

  // Get all contests
  getContests: async (status = 'all') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contests?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contests');
    }
  },

  // Get contest by ID
  getContestById: async (contestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contests/${contestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contest');
    }
  },

  // Join a contest
  joinContest: async (contestId, accessCode = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/contests/${contestId}/join`,
        { accessCode },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join contest');
    }
  },

  // Get contest standings
  getContestStandings: async (contestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contests/${contestId}/standings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch standings');
    }
  }
}; 