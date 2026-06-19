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
  if (req.file) {
    body.photoUrl = await uploadToCloudinary(req.file.path);
  }
  body.date = new Date();

  const entry = await Entry.create(body);
  await updateUserStreak(req.user, entry.date, Entry);
  res.status(201).json(entry);
});

export const getEntries = asyncHandler(async (req, res) => {
  const {
    search,
    mood,
    hasPhoto,
    startDate,
    endDate,
    page = 1,
    limit = 9,
  } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit))); // cap at 50
  const skip = (pageNum - 1) * limitNum;

  const filter = { userId: req.user._id };

  if (mood) filter.mood = mood;
  if (hasPhoto === 'true') filter.photoUrl = { $ne: '' };
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

  const [entries, total] = await Promise.all([
    Entry.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
    Entry.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    entries,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages,
    },
  });
});

export const getEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Entry not found' });
  res.json(entry);
});

export const updateEntry = asyncHandler(async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Entry not found' });

  const now = new Date();
  const createdAt = new Date(entry.createdAt);
  const isSameDay =
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    createdAt.getDate() === now.getDate();

  if (!isSameDay) {
    return res.status(403).json({ message: 'Entries can only be edited on the day they were created' });
  }

  const updates = { ...req.body };
  if (req.file) {
    updates.photoUrl = await uploadToCloudinary(req.file.path);
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

  const today = new Date();
  const activityStart = new Date(today);
  activityStart.setDate(activityStart.getDate() - 364);
  activityStart.setHours(0, 0, 0, 0);

  const [analytics, last7, totalEntries, totalPhotos, calendarEntries, activity365] = await Promise.all([
    getMoodAnalytics(userId, period),
    getLast7DaysActivity(userId, Entry),
    Entry.countDocuments({ userId }),
    Entry.countDocuments({ userId, photoUrl: { $ne: '' } }),
    Entry.find({ userId }).select('date mood photoUrl title content').sort({ date: -1 }).limit(400).lean(),
    Entry.aggregate([
      { $match: { userId, date: { $gte: activityStart } } },
      {
        $group: {
          _id: {
            y: { $year: '$date' },
            m: { $month: '$date' },
            d: { $dayOfMonth: '$date' },
          },
          entryCount: { $sum: 1 },
          moodTotal: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$mood', 'Sad'] }, then: 1 },
                  { case: { $eq: ['$mood', 'Neutral'] }, then: 2 },
                  { case: { $eq: ['$mood', 'Okay'] }, then: 3 },
                  { case: { $eq: ['$mood', 'Happy'] }, then: 4 },
                  { case: { $eq: ['$mood', 'Amazing'] }, then: 5 },
                ],
                default: 0,
              },
            },
          },
          moodCount: {
            $sum: {
              $cond: [{ $ifNull: ['$mood', false] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' },
          },
          entryCount: 1,
          averageMood: {
            $cond: [{ $gt: ['$moodCount', 0] }, { $divide: ['$moodTotal', '$moodCount'] }, null],
          },
        },
      },
      { $sort: { date: 1 } },
    ]),
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
    stats: { totalEntries, totalPhotos },
    calendarEntries,
    activity365,
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
