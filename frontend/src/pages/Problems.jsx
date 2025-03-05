import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchProblems } from '../utils/codeforcesApi';

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    Easy: 'text-green-500 bg-green-500/10',
    Medium: 'text-yellow-500 bg-yellow-500/10',
    Hard: 'text-red-500 bg-red-500/10'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

const TagBadge = ({ tag }) => (
  <span className="px-2 py-1 bg-background-paper rounded-lg text-xs text-text-secondary">
    {tag}
  </span>
);

const ProblemRow = ({ id, title, difficulty, acceptance, tags, solved, contestId, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 p-4 hover:bg-background-paper rounded-lg transition-colors cursor-pointer"
      onClick={() => navigate(`/problems/${contestId}${index}`)}
    >
      <div className="w-6 text-text-secondary">
        {solved && <span className="text-green-500">✓</span>}
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-medium hover:text-primary cursor-pointer">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <TagBadge key={index} tag={tag} />
          ))}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-8">
        <DifficultyBadge difficulty={difficulty} />
        <span className="text-text-secondary w-20 text-right">
          {acceptance}% accepted
        </span>
      </div>
    </motion.div>
  );
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const loadProblems = async () => {
      setLoading(true);
      const problemsData = await fetchProblems();
      setProblems(problemsData);
      setLoading(false);
    };

    loadProblems();
  }, []);

  const allTags = Array.from(
    new Set(problems.flatMap(problem => problem.tags))
  ).sort();

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => problem.tags.includes(tag));
    
    return matchesSearch && matchesDifficulty && matchesTags;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Problems</h1>
        <input
          type="text"
          placeholder="Search problems..."
          className="bg-background-paper text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters and Tags */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2">
          {['all', 'Easy', 'Medium', 'Hard'].map(difficulty => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-4 py-2 rounded-lg ${
                selectedDifficulty === difficulty 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-background-paper text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest</option>
          <option value="acceptance">Acceptance Rate</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTags.includes(tag)
                ? 'bg-primary text-white'
                : 'bg-background-paper text-text-secondary hover:text-text-primary'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProblems.map((problem, index) => (
            <ProblemRow key={index} {...problem} contestId={problem.contestId} index={problem.index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Problems; 