import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getReflection,
  saveReflection,
  getMonthlyReport,
  getYearlyReview,
} from '../controllers/reflectionController.js';
import { getMoodAnalytics } from '../utils/analytics.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(protect);

router.get('/monthly', getReflection);
router.post('/monthly', saveReflection);
router.get('/monthly/report', getMonthlyReport);
router.get('/yearly', getYearlyReview);
router.get('/analytics', asyncHandler(async (req, res) => {
  const data = await getMoodAnalytics(req.user._id, req.query.period || 'week');
  res.json(data);
}));

export default router;
