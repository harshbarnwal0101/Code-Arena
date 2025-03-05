import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { contestService } from '../services/contestService';

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, completed
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/contests?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContests(response.data);
    } catch (error) {
      setError('Failed to load contests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contests</h1>
        {isAuthenticated && (
          <Link
            to="/contests/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Contest
          </Link>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-md ${
            filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('ongoing')}
          className={`px-4 py-2 rounded-md ${
            filter === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Ongoing
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md ${
            filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          Completed
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests.map(contest => (
          <div key={contest._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{contest.title}</h2>
                <span className={`px-2 py-1 rounded-md text-sm ${getStatusBadgeClass(contest.status)}`}>
                  {contest.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Created by: {contest.creator.username}</p>
                <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
                <p>Duration: {contest.duration} minutes</p>
                <p>Problems: {contest.problems.length}</p>
                {contest.isPrivate && (
                  <p className="text-yellow-600">
                    <span className="mr-1">🔒</span>
                    Private Contest
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/contests/${contest._id}`}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contests.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No contests found
        </div>
      )}
    </div>
  );
}

export default Contests; 