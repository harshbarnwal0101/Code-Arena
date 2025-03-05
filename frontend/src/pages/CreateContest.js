import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ProblemSearch from '../components/ProblemSearch';
import { useContestValidation } from '../hooks/useContestValidation';
import { contestService } from '../services/contestService';

function CreateContest() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProblemSearch, setShowProblemSearch] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    duration: 120,
    isPrivate: true,
    accessCode: '',
    problems: []
  });

  const { errors, isValid } = useContestValidation(formData);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleProblemSelect = (problem) => {
    if (!problem) return;

    // Check for duplicate problems
    if (formData.problems.some(p => 
      p.contestId === problem.contestId && p.problemIndex === problem.index
    )) {
      setError('Problem already added');
      return;
    }

    // Add the problem
    setFormData(prev => ({
      ...prev,
      problems: [...prev.problems, {
        contestId: problem.contestId,
        problemIndex: problem.index,
        name: problem.name,
        rating: problem.rating,
        tags: problem.tags
      }]
    }));

    console.log('Problem added:', problem.name);
    setError(''); // Clear any previous errors
  };

  const removeProblem = (index) => {
    setFormData(prev => ({
      ...prev,
      problems: prev.problems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      setError('Contest title is required');
      return;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return;
    }
    if (formData.problems.length === 0) {
      setError('At least one problem is required');
      return;
    }
    if (formData.isPrivate && !formData.accessCode.trim()) {
      setError('Access code is required for private contests');
      return;
    }
    if (!isValid) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating contest with data:', formData);
      const contest = await contestService.createContest(formData);
      console.log('Contest created successfully:', contest);
      navigate('/contests');
    } catch (error) {
      console.error('Contest creation error:', error);
      setError(error.message || 'Failed to create contest');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Contest</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contest Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : ''
            }`}
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            min="30"
            max="300"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Private Contest</span>
          </label>
        </div>

        {formData.isPrivate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Code
            </label>
            <input
              type="text"
              value={formData.accessCode}
              onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Add Problems</h2>
          <ProblemSearch
            existingProblems={formData.problems}
            onProblemSelect={handleProblemSelect}
          />
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Selected Problems:</h3>
            {formData.problems.map((problem, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                <div>
                  <span className="font-medium">{problem.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({problem.contestId}{problem.problemIndex})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeProblem(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || formData.problems.length === 0}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${loading || formData.problems.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {loading ? 'Creating...' : 'Create Contest'}
        </button>
      </form>
    </div>
  );
}

export default CreateContest; 