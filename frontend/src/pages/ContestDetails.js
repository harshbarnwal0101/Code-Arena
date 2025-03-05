import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contestService } from '../services/contestService';
import ContestStandings from '../components/ContestStandings';
import io from 'socket.io-client';

function ContestDetails() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'problems', 'standings'
  const [standings, setStandings] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchContestDetails();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchContestDetails, 30000);

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('joinContest', contestId);
    
    socket.on('contestUpdate', (updatedContest) => {
      if (updatedContest._id === contestId) {
        setContest(updatedContest);
      }
    });

    socket.on('standingsUpdate', (standings) => {
      if (activeTab === 'standings') {
        setStandings(standings);
      }
    });

    return () => {
      clearInterval(interval);
      socket.emit('leaveContest', contestId);
      socket.disconnect();
    };
  }, [contestId, activeTab]);

  const fetchContestDetails = async () => {
    try {
      const data = await contestService.getContestById(contestId);
      setContest(data);
    } catch (error) {
      setError('Failed to load contest details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      setError('');
      await contestService.joinContest(contestId, accessCode);
      await fetchContestDetails();
      setShowJoinModal(false);
      setAccessCode('');
    } catch (error) {
      setError(error.message);
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await contestService.updateContestStatus(contestId, newStatus);
      fetchContestDetails();
    } catch (error) {
      setError(error.message);
    }
  };

  const isParticipant = contest?.participants.some(p => p._id === user?.id);
  const isCreator = contest?.creator._id === user?.id;
  const canViewProblems = contest?.status === 'ongoing' && isParticipant;
  const canManageContest = isCreator;

  const getContestStatus = () => {
    if (!contest) return '';
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(startTime.getTime() + contest.duration * 60000);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'completed';
    return 'ongoing';
  };

  const getTimeRemaining = () => {
    if (!contest) return '';
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(startTime.getTime() + contest.duration * 60000);

    let timeLeft;
    if (now < startTime) {
      timeLeft = startTime - now;
      return `Starts in ${Math.floor(timeLeft / 60000)} minutes`;
    } else if (now < endTime) {
      timeLeft = endTime - now;
      return `Ends in ${Math.floor(timeLeft / 60000)} minutes`;
    }
    return 'Contest ended';
  };

  const renderProblemList = () => {
    if (!contest || !contest.problems) return null;

    return (
      <div className="space-y-4">
        {contest.problems.map((problem, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">
                  {String.fromCharCode(65 + index)}. {problem.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Rating: {problem.rating || 'Unrated'} | Tags: {problem.tags?.join(', ')}
                </p>
              </div>
              <a
                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.problemIndex}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Solve
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!contest) {
    return <div className="text-center mt-8">Contest not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold">{contest.title}</h1>
              <div className="text-sm text-gray-500">
                {getTimeRemaining()}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="flex space-x-4 border-b">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500' : ''}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('problems')}
                  className={`py-2 px-4 ${activeTab === 'problems' ? 'border-b-2 border-blue-500' : ''}`}
                  disabled={!canViewProblems && contest.status !== 'completed'}
                >
                  Problems
                </button>
                <button
                  onClick={() => setActiveTab('standings')}
                  className={`py-2 px-4 ${activeTab === 'standings' ? 'border-b-2 border-blue-500' : ''}`}
                >
                  Standings
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Contest Details</h2>
                  <div className="space-y-2 text-gray-600">
                    <p>Status: {getContestStatus()}</p>
                    <p>Start Time: {new Date(contest.startTime).toLocaleString()}</p>
                    <p>Duration: {contest.duration} minutes</p>
                    <p>Created by: {contest.creator.username}</p>
                    <p>Type: {contest.isPrivate ? 'Private' : 'Public'}</p>
                    <p>Participants: {contest.participants.length}</p>
                  </div>

                  {!isParticipant && !isCreator && contest.status !== 'completed' && (
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                      Join Contest
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="space-y-4">
                {canViewProblems || contest.status === 'completed' ? (
                  renderProblemList()
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Problems will be visible when the contest starts
                  </div>
                )}
              </div>
            )}

            {activeTab === 'standings' && (
              <ContestStandings contestId={contestId} standings={standings} />
            )}
          </div>
        </div>
      </div>

      {/* Join Contest Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Join Contest</h2>
            {contest.isPrivate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter access code"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setAccessCode('');
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={joining || (contest.isPrivate && !accessCode)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {joining ? 'Joining...' : 'Join Contest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContestDetails;