import Contest from '../models/Contest.js';

export const updateContestStatuses = async () => {
  try {
    const now = new Date();

    // Update upcoming contests to ongoing
    await Contest.updateMany(
      {
        status: 'upcoming',
        startTime: { $lte: now }
      },
      { status: 'ongoing' }
    );

    // Update ongoing contests to completed
    await Contest.updateMany(
      {
        status: 'ongoing',
        $expr: {
          $lte: [
            { $add: ['$startTime', { $multiply: ['$duration', 60000] }] },
            now
          ]
        }
      },
      { status: 'completed' }
    );
  } catch (error) {
    console.error('Error updating contest statuses:', error);
  }
}; 