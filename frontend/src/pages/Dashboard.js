import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CodeforceLink from '../components/CodeforceLink';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const { user, cfProfile, cfStats, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  // If user hasn't linked their Codeforces account yet
  if (!user?.codeforcesId) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Link Your Codeforces Account</h2>
        <p className="text-gray-600 mb-4">
          To access all features, please link your Codeforces account.
        </p>
        <CodeforceLink />
      </div>
    );
  }

  if (!cfProfile || !cfStats) {
    return <div className="text-center mt-8">Loading Codeforces data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      {/* Profile Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={cfProfile.titlePhoto}
            alt={cfProfile.handle}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{cfProfile.handle}</h1>
            <p className={`text-lg ${getRankColor(cfProfile.rank)}`}>
              {cfProfile.rank}
            </p>
            <p className="text-gray-600">
              Current Rating: {cfProfile.rating} (max: {cfProfile.maxRating})
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Problems Solved"
          value={cfStats.solvedCount}
          icon="📝"
        />
        <StatCard
          title="Contests Participated"
          value={cfStats.contestCount}
          icon="🏆"
        />
        <StatCard
          title="Current Rating"
          value={cfStats.rating}
          icon="⭐"
        />
      </div>

      {/* Rating Graph */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Rating History</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cfStats.ratingDynamics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="newRating" 
                stroke="#8884d8" 
                name="Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Problem Tags Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Problems by Tags</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(cfStats.problemsByTags).map(([tag, count]) => (
            <div key={tag} className="bg-gray-50 p-3 rounded">
              <div className="font-medium">{tag}</div>
              <div className="text-lg">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function getRankColor(rank) {
  const colors = {
    'newbie': 'text-gray-500',
    'pupil': 'text-green-500',
    'specialist': 'text-cyan-500',
    'expert': 'text-blue-500',
    'candidate master': 'text-purple-500',
    'master': 'text-orange-500',
    'international master': 'text-orange-600',
    'grandmaster': 'text-red-500',
    'international grandmaster': 'text-red-600',
    'legendary grandmaster': 'text-red-700'
  };
  return colors[rank.toLowerCase()] || 'text-gray-500';
}

export default Dashboard; 