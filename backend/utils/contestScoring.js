// Calculate penalty time according to ICPC rules
export const calculatePenalty = (timeFromStart, attempts) => {
  // 20-minute penalty for each wrong submission
  const wrongSubmissionPenalty = (attempts - 1) * 20;
  // Add the time taken to solve
  return timeFromStart + wrongSubmissionPenalty;
}; 