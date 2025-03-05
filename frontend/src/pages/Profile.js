import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { codeforcesId } = useParams();
  const { user, cfProfile, cfStats, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If trying to access someone else's profile
    if (codeforcesId && codeforcesId !== user?.codeforcesId) {
      navigate('/profile');
    }
  }, [codeforcesId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading profile data...</div>
      </div>
    );
  }

  if (!user?.codeforcesId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">
          Please link your Codeforces account first
        </div>
      </div>
    );
  }

  if (!cfProfile || !cfStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading Codeforces data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <img
            src={cfProfile.titlePhoto}
            alt={cfProfile.handle}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{cfProfile.handle}</h1>
            <p className="text-gray-600">{cfProfile.rank}</p>
            <p className="text-gray-600">
              Rating: {cfProfile.rating} (max: {cfProfile.maxRating})
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600">Problems Solved</p>
              <p className="text-2xl font-bold">{cfStats.solvedCount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-600">Contests Participated</p>
              <p className="text-2xl font-bold">{cfStats.contestCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {cfStats.ratingDynamics.slice(0, 5).map((contest, index) => (
            <div key={index} className="mb-2 p-3 bg-gray-50 rounded">
              <p className="font-medium">{contest.contestName}</p>
              <p className="text-sm text-gray-600">
                Rank: {contest.rank} | Rating Change: {contest.newRating - contest.oldRating}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile; 