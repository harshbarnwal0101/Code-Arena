import React, { useState, useEffect } from 'react';
import { contestService } from '../services/contestService';

const COMMON_TAGS = [
  'implementation', 'dp', 'math', 'greedy', 'data structures',
  'graphs', 'brute force', 'constructive algorithms'
];

function ProblemSearch({ onProblemSelect, existingProblems = [] }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    selectedTags: []
  });

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2 || filters.selectedTags.length > 0) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Searching with query:', query);
      console.log('Filters:', filters);
      
      const results = await contestService.searchProblems(query, filters);
      console.log('Search results:', results);
      
      const filteredResults = results.filter(problem => 
        !existingProblems.some(p => 
          p.contestId === problem.contestId && p.problemIndex === problem.index
        )
      );
      
      setProblems(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to search problems');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow">
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems by name or tag..."
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minRating}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                minRating: e.target.value
              }))}
              className="w-24 px-2 py-1 border rounded"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxRating}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                maxRating: e.target.value
              }))}
              className="w-24 px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 text-xs rounded-full ${
                  filters.selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-4">Searching...</div>
      ) : (
        <div className="mt-4 space-y-2">
          {problems.map((problem) => (
            <div key={`${problem.contestId}${problem.index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">{problem.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Rating: {problem.rating}</span>
                  <span className="mx-2">•</span>
                  <span>{problem.tags.join(', ')}</span>
                </div>
              </div>
              <button onClick={() => onProblemSelect(problem)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Add
              </button>
            </div>
          ))}
          {problems.length === 0 && !loading && query && (
            <div className="text-center text-gray-500 py-4">No problems found matching your criteria</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProblemSearch; 