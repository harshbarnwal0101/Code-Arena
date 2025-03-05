import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { codeforcesService } from '../services/codeforcesService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cfProfile, setCfProfile] = useState(null);
  const [cfStats, setCfStats] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.codeforcesId) {
      fetchCodeforcesData(user.codeforcesId);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeforcesData = async (handle) => {
    try {
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
          sub.problem.tags.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
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
    } catch (error) {
      console.error('Failed to fetch Codeforces data:', error);
    }
  };

  const login = async (codeforcesId) => {
    try {
      // First verify if the Codeforces handle exists and get user data
      const cfUserInfo = await codeforcesService.getUserInfo(codeforcesId);
      
      // If user exists, proceed with login/registration
      const response = await axios.post('/api/auth/login', { 
        codeforcesId,
        cfUserInfo
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return true;
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCfProfile(null);
    setCfStats(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      cfProfile, 
      cfStats, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);