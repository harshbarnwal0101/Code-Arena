import React, { useState, useEffect } from 'react';
import { contestService } from '../services/contestService';

function ContestStandings({ contestId }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStandings();
    // Update standings every minute for ongoing contests
    const interval = setInterval(fetchStandings, 60000);
    return () => clearInterval(interval);
  }, [contestId]);

  const fetchStandings = async () => {
    try {
      const data = await contestService.getContestStandings(contestId);
      setStandings(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPenaltyTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-4">Loading standings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Solved
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Penalty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Problems
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((standing, index) => (
            <tr key={standing.user._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {standing.user.username}
                </div>
                <div className="text-sm text-gray-500">
                  CF: {standing.user.codeforcesId}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {standing.solved}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPenaltyTime(standing.penalty)}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  {standing.problems.map((problem, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        problem.solvedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                      title={`Attempts: ${problem.attempts}\nTime: ${formatPenaltyTime(problem.penalty)}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContestStandings; 