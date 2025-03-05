import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchContests } from '../utils/codeforcesApi';

const ContestCard = ({ title, date, participants, difficulty, duration, status }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-primary">{title}</h3>
        <span className={`text-sm px-2 py-1 rounded-full ${
          status === 'Upcoming' ? 'bg-yellow-500/20 text-yellow-500' :
          status === 'Live' ? 'bg-green-500/20 text-green-500' :
          'bg-red-500/20 text-red-500'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-text-secondary">{date}</p>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>⏱️ {duration}</span>
          <span>👥 {participants} participants</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className={`text-sm ${
          difficulty === 'Easy' ? 'text-green-500' :
          difficulty === 'Medium' ? 'text-yellow-500' : 
          'text-red-500'
        }`}>
          {difficulty}
        </span>
        <button className="btn-primary text-sm">
          {status === 'Live' ? 'Join Now' : 'Register'}
        </button>
      </div>
    </motion.div>
  );
};

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadContests = async () => {
      setLoading(true);
      const contestsData = await fetchContests();
      setContests(contestsData);
      setLoading(false);
    };

    loadContests();
  }, []);

  const filteredContests = contests.filter(contest => {
    const matchesFilter = filter === 'all' || contest.status.toLowerCase() === filter;
    const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Contests</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search contests..."
            className="bg-background-paper text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'live' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Live
            </button>
            <button 
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'upcoming' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest, index) => (
            <ContestCard key={contest.id} {...contest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Contests;