import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CodeEditor } from '../components/editor/CodeEditor';
import { fetchProblemDetails } from '../utils/codeforcesApi';

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        const contestId = id.match(/\d+/)[0];
        const index = id.match(/[A-Z]+/)[0];
        const problemData = await fetchProblemDetails(contestId, index);
        setProblem(problemData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            {error || 'Problem Not Found'}
          </h2>
          <Link to="/problems" className="btn-primary">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Problem Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card">
            {/* Problem Title and Difficulty */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{problem.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${
                problem.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' :
                problem.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' :
                'text-red-500 bg-red-500/10'
              }`}>
                {problem.difficulty}
              </span>
            </div>

            {/* View on Codeforces Button */}
            <a 
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center block"
            >
              View Problem on Codeforces
            </a>
          </div>
        </motion.div>

        {/* Right Column - Code Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-[calc(100vh-12rem)] sticky top-24"
        >
          <CodeEditor />
        </motion.div>
      </div>
    </div>
  );
};

export default ProblemDetails; 