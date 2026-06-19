export const MOODS = ['Sad', 'Neutral', 'Okay', 'Happy', 'Amazing'];
export const MOOD_EMOJI = { Sad: '😢', Neutral: '😐', Okay: '🙂', Happy: '😊', Amazing: '🤩' };
export const MOOD_SCORES = { Sad: 1, Neutral: 2, Okay: 3, Happy: 4, Amazing: 5 };
export const REFLECTION_PROMPTS = [
  'What made you smile today?',
  'What challenged you today?',
  'What are you grateful for?',
  'What lesson did you learn today?',
  'What do you want to remember about today?',
  'Who made a difference in your day?',
  'What surprised you today?',
];

export const QUOTES = [
  { text: 'Fill your paper with the breathings of your heart.', author: 'William Wordsworth' },
  { text: 'The little things? The little moments? They aren\'t little.', author: 'Jon Kabat-Zinn' },
  { text: 'Every page you turn is a day you get to keep.', author: 'MyDay' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/entries', label: 'Entries', icon: 'BookOpen' },
  { path: '/write', label: 'Write', icon: 'PenLine' },
  // { path: '/timeline', label: 'Memories Timeline', icon: 'Images' },
  { path: '/gallery', label: 'Photo Gallery', icon: 'Camera' },
  { path: '/letters', label: 'Future Letters', icon: 'Mail' },
  // { path: '/reflection', label: 'Monthly Reflection', icon: 'Calendar' },
  // { path: '/yearly', label: 'Yearly Review', icon: 'TrendingUp' },
  { path: '/profile', label: 'Profile', icon: 'User' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export const formatShortDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const getQuoteOfDay = () => {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
};

export const getRandomPrompt = () =>
  REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
