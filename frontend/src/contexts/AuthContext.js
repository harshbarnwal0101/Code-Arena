import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { codeforcesService } from '../services/codeforcesService';

const AuthContext = createContext(null);

// Hardcode the API URL for local development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50000/api';

// Log the API URL being used
console.log('Using API URL:', API_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cfProfile, setCfProfile] = useState(null);
  const [cfStats, setCfStats] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Verifying token...');
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Token verification response:', response.data);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  useEffect(() => {
    if (user?.codeforcesId) {
      fetchCodeforcesData(user.codeforcesId);
    }
  }, [user?.codeforcesId]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return user.codeforcesId ? '/dashboard' : '/link-codeforces';
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Registering with:', { username, email });
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });
      
      console.log('Registration response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const linkCodeforces = async (codeforcesId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_URL}/auth/link-codeforces`,
        { codeforcesId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUser(response.data.user);
      await fetchCodeforcesData(codeforcesId);
      return response.data;
    } catch (error) {
      console.error('Linking error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to link Codeforces account');
    }
  };

  const fetchCodeforcesData = async (handle) => {
    try {
      console.log('Fetching Codeforces data for:', handle);
      const [profile, contests, submissions] = await Promise.all([
        codeforcesService.getUserInfo(handle),
        codeforcesService.getUserContests(handle),
        codeforcesService.getUserSubmissions(handle)
      ]);

      setCfProfile(profile);
      
      // Calculate statistics
      const stats = {
        rating: profile.rating,
        maxRating: profile.maxRating,
        rank: profile.rank,
        contestCount: contests.length,
        solvedCount: new Set(submissions.map(sub => 
          `${sub.problem.contestId}-${sub.problem.index}`
        )).size,
        problemsByTags: submissions.reduce((acc, sub) => {
          if (sub.verdict === 'OK') {
            sub.problem.tags.forEach(tag => {
              acc[tag] = (acc[tag] || 0) + 1;
            });
          }
          return acc;
        }, {}),
        ratingDynamics: contests.map(contest => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          date: new Date(contest.ratingUpdateTimeSeconds * 1000)
        }))
      };

      setCfStats(stats);
      return { profile, stats };
    } catch (error) {
      console.error('Failed to fetch Codeforces data:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setCfProfile(null);
    setCfStats(null);
  };

  const value = {
    user,
    cfProfile,
    cfStats,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    linkCodeforces
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};