const dayKey = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x.getTime();
};

export const recalculateStreak = async (userId, Entry) => {
  const entries = await Entry.find({ userId }).sort({ date: -1 }).select('date').lean();
  if (!entries.length) return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };

  const uniqueDays = [...new Set(entries.map((e) => dayKey(e.date)))].sort((a, b) => b - a);
  const oneDay = 86400000;
  const today = dayKey(new Date());

  let longest = 0;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === oneDay) run++;
    else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  let current = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === today - oneDay) {
    current = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      if (uniqueDays[i - 1] - uniqueDays[i] === oneDay) current++;
      else break;
    }
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    lastEntryDate: new Date(uniqueDays[0]),
  };
};

export const updateUserStreak = async (user, entryDate, Entry) => {
  const stats = await recalculateStreak(user._id, Entry);
  user.currentStreak = stats.currentStreak;
  user.longestStreak = Math.max(user.longestStreak || 0, stats.longestStreak);
  user.lastEntryDate = stats.lastEntryDate;
  await user.save();
  return user;
};

export const getLast7DaysActivity = async (userId, Entry) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = await Entry.countDocuments({
      userId,
      date: { $gte: d, $lt: next },
    });
    result.push({ date: d.toISOString(), hasEntry: count > 0 });
  }
  return result;
};
