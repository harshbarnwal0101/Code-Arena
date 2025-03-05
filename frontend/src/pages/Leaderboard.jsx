import React, { useState } from 'react';
import { motion } from 'framer-motion';

const UserRow = ({ rank, username, rating, solved, streak }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center p-4 hover:bg-background-paper rounded-lg transition-colors"
    >
      <span className="w-12 text-xl font-bold text-text-secondary">{rank}</span>
      <div className="flex-1">
        <h3 className="text-lg font-medium">{username}</h3>
        <div className="flex gap-4 mt-1 text-sm text-text-secondary">
          <span>🏆 {rating} rating</span>
          <span>✅ {solved} solved</span>
          <span>🔥 {streak} day streak</span>
        </div>
      </div>
      <button className="text-primary hover:text-primary-light transition-colors">
        View Profile
      </button>
    </motion.div>
  );
};

const Leaderboard = () => {
  const [timeFrame, setTimeFrame] = useState('all');
  
  const users = [
    { rank: 1, username: "CodeMaster", rating: 2400, solved: 450, streak: 15 },
    { rank: 2, username: "AlgoNinja", rating: 2350, solved: 425, streak: 20 },
    { rank: 3, username: "ByteWarrior", rating: 2300, solved: 400, streak: 10 },
    { rank: 4, username: "QuantumCoder", rating: 2250, solved: 380, streak: 8 },
    { rank: 5, username: "CyberPro", rating: 2200, solved: 350, streak: 12 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeFrame('all')}
            className={`px-4 py-2 rounded-lg ${
              timeFrame === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Time
          </button>
          <button 
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded-lg ${
              timeFrame === 'month' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            This Month
          </button>
          <button 
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 rounded-lg ${
              timeFrame === 'week' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-12">
        {users.slice(0, 3).map((user, index) => (
          <motion.div
            key={user.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card text-center ${
              index === 0 ? 'h-48 bg-gradient-to-b from-yellow-500/20' :
              index === 1 ? 'h-40 bg-gradient-to-b from-gray-400/20' :
              'h-32 bg-gradient-to-b from-orange-800/20'
            }`}
          >
            <div className="text-2xl font-bold mb-2">#{user.rank}</div>
            <div className="text-lg font-medium">{user.username}</div>
            <div className="text-primary">{user.rating}</div>
          </motion.div>
        ))}
      </div>

      {/* Full Rankings */}
      <div className="space-y-2">
        {users.map((user) => (
          <UserRow key={user.rank} {...user} />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 