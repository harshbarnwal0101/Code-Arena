const CF_API_BASE = 'https://codeforces.com/api';

// API Methods
const API_METHODS = {
  PROBLEM_SET: '/problemset.problems',
  CONTEST_LIST: '/contest.list',
  USER_INFO: '/user.info',
  USER_RATING: '/user.rating',
  PROBLEM_STATUS: '/problemset.status'
};

// Fetch with error handling
const fetchFromCF = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CF_API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    }
    
    throw new Error(data.comment || 'Failed to fetch from Codeforces API');
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Fetch problems with optional filters
export const fetchProblems = async (tags = [], minRating = 0, maxRating = 3500) => {
  try {
    const data = await fetchFromCF(API_METHODS.PROBLEM_SET);
    let problems = data.problems.map(problem => ({
      id: `${problem.contestId}${problem.index}`,
      title: problem.name,
      tags: problem.tags,
      difficulty: getDifficulty(problem.rating),
      acceptance: calculateAcceptance(problem),
      contestId: problem.contestId,
      index: problem.index,
      rating: problem.rating
    }));

    // Apply filters
    if (tags.length > 0) {
      problems = problems.filter(problem => 
        tags.every(tag => problem.tags.includes(tag))
      );
    }

    problems = problems.filter(problem => 
      (!problem.rating || (problem.rating >= minRating && problem.rating <= maxRating))
    );

    return problems;
  } catch (error) {
    console.error('Error in fetchProblems:', error);
    return [];
  }
};

// Fetch contests with status
export const fetchContests = async () => {
  try {
    const contests = await fetchFromCF(API_METHODS.CONTEST_LIST);
    return contests
      .filter(contest => contest.phase !== 'FINISHED')
      .map(contest => ({
        id: contest.id,
        title: contest.name,
        status: getContestStatus(contest.phase),
        duration: formatDuration(contest.durationSeconds),
        startTime: new Date(contest.startTimeSeconds * 1000).toLocaleString(),
        participants: contest.participantCount || 0,
        difficulty: getContestDifficulty(contest)
      }));
  } catch (error) {
    console.error('Error in fetchContests:', error);
    return [];
  }
};

// Fetch problem details by contest ID and index
export const fetchProblemDetails = async (contestId, index) => {
  try {
    const data = await fetchFromCF(API_METHODS.PROBLEM_SET);
    
    const problem = data.problems.find(p => 
      p.contestId === parseInt(contestId) && p.index === index
    );

    if (!problem) {
      throw new Error('Problem not found');
    }

    return {
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      difficulty: getDifficulty(problem.rating),
      url: CF_URLS.PROBLEM(problem.contestId, problem.index)
    };
  } catch (error) {
    console.error('Error in fetchProblemDetails:', error);
    throw new Error('Failed to fetch problem details');
  }
};

// Helper functions
const getDifficulty = (rating) => {
  if (!rating) return 'Unrated';
  if (rating < 1200) return 'Easy';
  if (rating < 2000) return 'Medium';
  return 'Hard';
};

const calculateAcceptance = (problem) => {
  return Math.round(Math.random() * 40 + 40); // Placeholder
};

const getContestStatus = (phase) => {
  switch (phase) {
    case 'BEFORE': return 'Upcoming';
    case 'CODING': return 'Live';
    default: return phase;
  }
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const getContestDifficulty = (contest) => {
  const name = contest.name.toLowerCase();
  if (name.includes('div. 1')) return 'Hard';
  if (name.includes('div. 2')) return 'Medium';
  if (name.includes('div. 3')) return 'Easy';
  return 'Medium';
};

// Helper function to format problem description
const formatProblemDescription = (problem) => {
  return `
    <div class="problem-statement">
      <div class="header">
        <div class="title">${problem.name}</div>
        ${problem.timeLimit ? `<div class="time-limit">time limit per test: ${problem.timeLimit} seconds</div>` : ''}
        ${problem.memoryLimit ? `<div class="memory-limit">memory limit per test: ${problem.memoryLimit} megabytes</div>` : ''}
      </div>
      <div class="problem-description">
        ${problem.description || 'Please view the complete problem statement on Codeforces.'}
      </div>
    </div>
  `;
};

// Update CF_URLS to include both contest and problemset URLs
export const CF_URLS = {
  PROBLEM: (contestId, index) => {
    // Try both URLs since some problems might be in contests or problemset
    const urls = [
      `https://codeforces.com/contest/${contestId}/problem/${index}`,
      `https://codeforces.com/problemset/problem/${contestId}/${index}`
    ];
    return urls[0]; // Return the first URL as default
  },
  CONTEST: (contestId) => `https://codeforces.com/contest/${contestId}`,
  USER: (handle) => `https://codeforces.com/profile/${handle}`,
  SUBMISSION: (contestId, submissionId) => `https://codeforces.com/contest/${contestId}/submission/${submissionId}`
}; 