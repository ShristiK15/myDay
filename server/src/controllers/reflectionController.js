import MonthlyReflection from '../models/MonthlyReflection.js';
import Entry from '../models/Entry.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getMonthlyStats, getYearlyReview as buildYearlyReview } from '../utils/analytics.js';
import User from '../models/User.js';

export const getReflection = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;

  let reflection = await MonthlyReflection.findOne({
    userId: req.user._id,
    year,
    month,
  });

  if (!reflection) {
    reflection = { year, month, achievement: '', lesson: '', challenge: '', favoriteMemory: '', completed: false };
  }

  res.json(reflection);
});

export const saveReflection = asyncHandler(async (req, res) => {
  const year = Number(req.body.year) || new Date().getFullYear();
  const month = Number(req.body.month) || new Date().getMonth() + 1;

  const reflection = await MonthlyReflection.findOneAndUpdate(
    { userId: req.user._id, year, month },
    { ...req.body, userId: req.user._id, year, month, completed: true },
    { upsert: true, new: true }
  );

  res.json(reflection);
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;

  const [reflection, stats, user] = await Promise.all([
    MonthlyReflection.findOne({ userId: req.user._id, year, month }),
    getMonthlyStats(req.user._id, year, month),
    User.findById(req.user._id),
  ]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  res.json({
    reflection,
    stats: { ...stats, writingStreak: user.currentStreak },
    title: `${monthNames[month - 1]} ${year} Report`,
  });
});

export const getYearlyReview = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const user = await User.findById(req.user._id);
  const review = await buildYearlyReview(req.user._id, year);

  res.json({
    ...review,
    longestStreak: user.longestStreak,
    currentStreak: user.currentStreak,
  });
});
