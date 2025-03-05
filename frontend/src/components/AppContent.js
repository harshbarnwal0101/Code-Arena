import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavBar from './layout/NavBar';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Contests from '../pages/Contests';
import CreateContest from '../pages/CreateContest';
import ContestDetails from '../pages/ContestDetails';
import Problems from '../pages/Problems';
import Dashboard from '../pages/Dashboard';
import Leaderboard from '../pages/Leaderboard';
import ProblemDetails from '../pages/ProblemDetails';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar />
      <div className="container mx-auto px-4 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/profile/:codeforcesId" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/contests" element={isAuthenticated ? <Contests /> : <Navigate to="/login" />} />
          <Route path="/contests/create" element={isAuthenticated ? <CreateContest /> : <Navigate to="/login" />} />
          <Route path="/contests/:id" element={isAuthenticated ? <ContestDetails /> : <Navigate to="/login" />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={isAuthenticated ? <ProblemDetails /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppContent; 