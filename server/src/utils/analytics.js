import Entry from '../models/Entry.js';

const MOOD_SCORES = { Sad: 1, Neutral: 2, Okay: 3, Happy: 4, Amazing: 5 };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getMoodScore = (mood) => MOOD_SCORES[mood] || null;

export const getDateRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  if (period === 'week') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'month') {
    start.setMonth(start.getMonth() - 1);
  } else if (period === 'year') {
    start.setFullYear(start.getFullYear() - 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

export const getMoodAnalytics = async (userId, period = 'week') => {
  const { start, end } = getDateRange(period);
  const entries = await Entry.find({
    userId,
    date: { $gte: start, $lte: end },
    mood: { $exists: true, $ne: null },
  })
    .sort({ date: 1 })
    .lean();

  const trend = entries.map((e) => ({
    date: e.date,
    label: formatLabel(e.date, period),
    mood: e.mood,
    score: getMoodScore(e.mood),
  }));

  const scores = entries.map((e) => getMoodScore(e.mood)).filter(Boolean);
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const frequency = {};
  entries.forEach((e) => {
    frequency[e.mood] = (frequency[e.mood] || 0) + 1;
  });

  const byDay = {};
  const byMonth = {};
  entries.forEach((e) => {
    const d = new Date(e.date);
    const day = DAY_NAMES[d.getDay()];
    const month = MONTH_NAMES[d.getMonth()];
    if (!byDay[day]) byDay[day] = [];
    if (!byMonth[month]) byMonth[month] = [];
    byDay[day].push(getMoodScore(e.mood));
    byMonth[month].push(getMoodScore(e.mood));
  });

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  let bestDay = null;
  let bestMonth = null;
  let bestDayScore = 0;
  let bestMonthScore = 0;

  Object.entries(byDay).forEach(([day, arr]) => {
    const s = avg(arr);
    if (s > bestDayScore) {
      bestDayScore = s;
      bestDay = day;
    }
  });
  Object.entries(byMonth).forEach(([month, arr]) => {
    const s = avg(arr);
    if (s > bestMonthScore) {
      bestMonthScore = s;
      bestMonth = month;
    }
  });

  const dominantMood = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    trend,
    average: Math.round(average * 10) / 10,
    frequency,
    bestDay,
    bestMonth,
    dominantMood,
    totalEntries: entries.length,
  };
};

function formatLabel(date, period) {
  const d = new Date(date);
  if (period === 'week') return DAY_NAMES[d.getDay()];
  if (period === 'month') return `${d.getDate()}`;
  return MONTH_NAMES[d.getMonth()];
}

export const getYearlyReview = async (userId, year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const entries = await Entry.find({
    userId,
    date: { $gte: start, $lte: end },
  }).lean();

  const monthCounts = Array(12).fill(0);
  const moodFreq = {};
  let favoriteEntry = null;
  let topPhotoEntry = null;

  entries.forEach((e) => {
    const m = new Date(e.date).getMonth();
    monthCounts[m]++;
    if (e.mood) moodFreq[e.mood] = (moodFreq[e.mood] || 0) + 1;
    if (e.photoUrl && (!topPhotoEntry || e.content?.length > topPhotoEntry.content?.length)) {
      topPhotoEntry = e;
    }
    if (!favoriteEntry || (e.content?.length || 0) > (favoriteEntry.content?.length || 0)) {
      favoriteEntry = e;
    }
  });

  const bestMonthIndex = monthCounts.indexOf(Math.max(...monthCounts));
  const dominantMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const moodTrend = await getMoodAnalytics(userId, 'year');

  return {
    year,
    entriesWritten: entries.length,
    bestMonth: MONTH_NAMES[bestMonthIndex],
    bestMonthCount: monthCounts[bestMonthIndex],
    dominantMood,
    favoriteEntry,
    topPhotoEntry,
    moodTrend: moodTrend.trend,
    monthCounts,
  };
};

export const getMonthlyStats = async (userId, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const entries = await Entry.find({
    userId,
    date: { $gte: start, $lte: end },
  }).lean();

  const moodFreq = {};
  entries.forEach((e) => {
    if (e.mood) moodFreq[e.mood] = (moodFreq[e.mood] || 0) + 1;
  });

  const dominantMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0];

  return {
    entriesWritten: entries.length,
    dominantMood: dominantMood?.[0] || null,
    dominantMoodDays: dominantMood?.[1] || 0,
    photos: entries.filter((e) => e.photoUrl).length,
    voiceNotes: entries.filter((e) => e.voiceNoteUrl).length,
  };
};
