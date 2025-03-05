import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { codeforcesService } from '../services/codeforcesService.js';

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const { q, minRating, maxRating, tags } = req.query;
    console.log('Search request:', { q, minRating, maxRating, tags });

    const filters = {
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined,
      tags: tags ? tags.split(',') : []
    };

    console.log('Applying filters:', filters);

    const problems = await codeforcesService.searchProblems(q, filters);
    console.log(`Found ${problems.length} problems`);
    
    res.json(problems);
  } catch (error) {
    console.error('Problem search error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router; 