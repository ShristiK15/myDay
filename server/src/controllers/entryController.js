import Entry from '../models/Entry.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import { updateUserStreak, getLast7DaysActivity } from '../utils/streak.js';
import { getMoodAnalytics, getMonthlyStats } from '../utils/analytics.js';

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const createEntry = asyncHandler(async (req, res) => {
  const body = { ...req.body, userId: req.user._id };
  if (req.files?.photo?.[0]) {
    body.photoUrl = await uploadToCloudinary(req.files.photo[0].path, 'image');
  }
  if (req.files?.voice?.[0]) {
    body.voiceNoteUrl = await uploadToCloudinary(req.files.voice[0].path, 'audio');
  }
  body.date = new Date();

  const entry = await Entry.create(body);
  await updateUserStreak(req.user, entry.date, Entry);
  res.status(201).json(entry);
});

export const getEntries = asyncHandler(async (req, res) => {
  const { search, mood, hasPhoto, hasVoice, startDate, endDate, limit = 50, skip = 0 } = req.query;
  const filter = { userId: req.user._id };

  if (mood) filter.mood = mood;
  if (hasPhoto === 'true') filter.photoUrl = { $ne: '' };
  if (hasVoice === 'true') filter.voiceNoteUrl = { $ne: '' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = startOfDay(startDate);
    if (endDate) filter.date.$lte = endOfDay(endDate);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const entries = await Entry.find(filter).sort({ date: -1 }).skip(Number(skip)).limit(Number(limit));
  const total = await Entry.countDocuments(filter);
  res.json({ entries, total });
});

export const getEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  res.json(entry);
});

export const updateEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  const updates = { ...req.body };
  if (req.files?.photo?.[0]) {
    updates.photoUrl = await uploadToCloudinary(req.files.photo[0].path, 'image');
  }
  if (req.files?.voice?.[0]) {
    updates.voiceNoteUrl = await uploadToCloudinary(req.files.voice[0].path, 'audio');
  }
  delete updates.date;

  Object.assign(entry, updates);
  await entry.save();
  await updateUserStreak(req.user, entry.date, Entry);
  res.json(entry);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  await updateUserStreak(req.user, new Date(), Entry);
  res.json({ message: 'Entry deleted' });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const period = req.query.period || 'week';

  const [analytics, last7, totalEntries, totalPhotos, totalVoice, calendarEntries] = await Promise.all([
    getMoodAnalytics(userId, period),
    getLast7DaysActivity(userId, Entry),
    Entry.countDocuments({ userId }),
    Entry.countDocuments({ userId, photoUrl: { $ne: '' } }),
    Entry.countDocuments({ userId, voiceNoteUrl: { $ne: '' } }),
    Entry.find({ userId }).select('date mood photoUrl title content').sort({ date: -1 }).limit(400).lean(),
  ]);

  const user = await User.findById(userId);
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
  else if (hour >= 17) greeting = 'Good Evening';

  res.json({
    greeting: `${greeting}, ${user.name.split(' ')[0]}`,
    analytics,
    streak: {
      current: user.currentStreak,
      longest: user.longestStreak,
      last7,
    },
    stats: { totalEntries, totalPhotos, totalVoice },
    calendarEntries,
  });
});

export const getCalendarMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || new Date().getMonth() + 1;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const entries = await Entry.find({
    userId: req.user._id,
    date: { $gte: start, $lte: end },
  })
    .select('date mood photoUrl title content')
    .lean();

  res.json(entries);
});

export const getTimeline = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const baseFilter = { userId: req.user._id, photoUrl: { $ne: '' } };
  const [today, week, month, year, total] = await Promise.all([
    Entry.find({ ...baseFilter, date: { $gte: todayStart } }).sort({ date: -1 }).limit(12),
    Entry.find({ ...baseFilter, date: { $gte: weekStart, $lt: todayStart } }).sort({ date: -1 }).limit(12),
    Entry.find({ ...baseFilter, date: { $gte: monthStart, $lt: weekStart } }).sort({ date: -1 }).limit(12),
    Entry.find({ ...baseFilter, date: { $gte: yearStart, $lt: monthStart } }).sort({ date: -1 }).limit(12),
    Entry.countDocuments({ userId: req.user._id, photoUrl: { $ne: '' } }),
  ]);

  res.json({ today, week, month, year, total });
});

export const getGallery = asyncHandler(async (req, res) => {
  const { year, month, mood } = req.query;
  const filter = { userId: req.user._id, photoUrl: { $ne: '' } };
  if (mood) filter.mood = mood;
  if (year || month) {
    const y = Number(year) || new Date().getFullYear();
    const m = month ? Number(month) - 1 : 0;
    const start = month ? new Date(y, m, 1) : new Date(y, 0, 1);
    const end = month ? new Date(y, m + 1, 0, 23, 59, 59) : new Date(y, 11, 31, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const photos = await Entry.find(filter).sort({ date: -1 }).select('_id photoUrl title mood date');
  res.json(photos);
});
