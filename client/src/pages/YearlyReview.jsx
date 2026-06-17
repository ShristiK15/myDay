import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Flame, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { MOOD_EMOJI } from '../utils/constants';

export default function YearlyReview() {
  const year = new Date().getFullYear();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reflections/yearly', { params: { year } }).then((r) => setData(r.data));
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-serif text-2xl italic">
        Unwrapping your year...
      </div>
    );
  }

  const chartData = data.moodTrend?.map((t) => ({ name: t.label, score: t.score })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PaperCard className="text-center py-12" tape>
        <p className="text-xs tracking-[0.3em] text-[#b35a38]">MY YEAR IN REVIEW</p>
        <h1 className="font-serif text-5xl font-bold">Your {year} Journey</h1>
        <p className="mx-auto mt-4 max-w-lg font-serif italic opacity-70">
          Three hundred and sixty-five days, captured one page at a time. Here is the story your diary tells.
        </p>
      </PaperCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, value: data.entriesWritten, label: 'pages filled this year' },
          { icon: Calendar, value: data.bestMonth, label: 'your most written month' },
          { icon: Flame, value: `${data.longestStreak} Days`, label: 'longest streak of devotion' },
        ].map(({ icon: Icon, value, label }) => (
          <PaperCard key={label} className="text-center">
            <Icon className="mx-auto mb-3 h-6 w-6 opacity-50" />
            <p className="font-serif text-3xl font-bold">{value}</p>
            <p className="text-sm opacity-60">{label}</p>
          </PaperCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PaperCard className="lg:col-span-1 text-center">
          <p className="text-4xl">{MOOD_EMOJI[data.dominantMood]}</p>
          <p className="font-serif text-xl font-bold">{data.dominantMood || '—'}</p>
          <p className="text-sm opacity-60">felt on most of your days</p>
        </PaperCard>

        <PaperCard className="lg:col-span-2">
          <div className="flex flex-wrap gap-6">
            {data.favoriteEntry && (
              <div className="rotate-[-2deg] rounded bg-white p-2 shadow-md">
                {data.favoriteEntry.photoUrl && (
                  <img src={data.favoriteEntry.photoUrl} alt="" className="h-32 w-32 object-cover" />
                )}
                <p className="mt-1 text-center font-serif text-xs italic">Summer memory</p>
              </div>
            )}
            <div>
              <Heart className="mb-2 h-5 w-5" />
              <h3 className="font-serif text-xl font-bold">
                {data.favoriteEntry?.title || 'Favorite Memory'}
              </h3>
              <p className="mt-2 max-w-md text-sm opacity-80 line-clamp-4">
                {data.favoriteEntry?.content}
              </p>
              {data.favoriteEntry && (
                <Link to={`/entries/${data.favoriteEntry._id}`} className="mt-3 inline-block text-sm underline">
                  Read this entry →
                </Link>
              )}
            </div>
          </div>
        </PaperCard>
      </div>

      {chartData.length > 0 && (
        <PaperCard>
          <h3 className="mb-4 font-serif text-xl font-bold">Mood through the year</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} hide />
              <Area type="monotone" dataKey="score" stroke="#4a3728" fill="#4a3728" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </PaperCard>
      )}
    </motion.div>
  );
}
