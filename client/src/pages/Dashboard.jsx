import { useState, useEffect } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Camera } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import ContributionHeatmap from '../components/dashboard/ContributionHeatmap';

const moodLabels = { 1: 'Sad', 2: 'Neutral', 3: 'Okay', 4: 'Happy', 5: 'Amazing' };
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    api.get('/entries/dashboard', { params: { period } }).then((r) => setData(r.data));
  }, [period]);

  if (!data) {
    return <div className="font-serif text-xl opacity-60">Loading your diary...</div>;
  }

  const chartData =
    data.analytics?.trend?.map((t) => ({
      name: t.label,
      score: t.score,
    })) || [];

  const periods = ['week', 'month', 'year'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-serif text-3xl font-bold">{data.greeting}</h2>
        {/* <p className="text-sm opacity-70">Welcome back, here is your reflection summary.</p> */}
      </motion.div>

      <PaperCard tape delay={0.1}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold">Mood Over Time</h3>
            <p className="text-sm opacity-60">Average mood: {data.analytics?.average || '—'}/5</p>
          </div>
          <div className="flex rounded-full bg-cream-dark p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${
                  period === p ? 'bg-(--accent) text-white' : ''
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a3728" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4a3728" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            {/* <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} /> */}
            <YAxis
  domain={[1, 5]}
  ticks={[1, 2, 3, 4, 5]}
  tick={{ fontSize: 11 }}
  tickFormatter={(value) => moodLabels[value] || value}
  width={80}  // increase width so labels don't get clipped
/>
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#4a3728" fill="url(#moodGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="score" stroke="#4a3728" dot={{ fill: '#4a3728', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </PaperCard>

      <PaperCard delay={0.15} className="w-full">
        <ContributionHeatmap activity={data.activity365 || []} />
      </PaperCard>

      <PaperCard delay={0.2}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-dark">
            <Flame className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <p className="font-serif text-2xl font-bold">{data.streak?.current} day streak</p>
            <p className="text-sm opacity-60">Longest: {data.streak?.longest} days — keep writing!</p>
          </div>
          <div className="ml-auto">
            <p className="mb-2 text-xs opacity-60">Last 7 days</p>
            <div className="flex gap-2">
              {data.streak?.last7?.map((d, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 ${
                    d.hasEntry ? 'border-(--accent) bg-(--accent)' : 'border-tan bg-transparent'
                  }`}
                  title={new Date(d.date).toLocaleDateString()}
                />
              ))}
            </div>
          </div>
        </div>
      </PaperCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: BookOpen, label: 'Total entries', value: data.stats?.totalEntries },
          { icon: Camera, label: 'Photos captured', value: data.stats?.totalPhotos },
        ].map(({ icon: Icon, label, value }, i) => (
          <PaperCard key={label} delay={0.25 + i * 0.05} className="text-center">
            <Icon className="mx-auto mb-2 h-6 w-6 opacity-60" />
            <p className="font-serif text-3xl font-bold">{value ?? 0}</p>
            <p className="text-sm opacity-60">{label}</p>
          </PaperCard>
        ))}
      </div>
    </div>
  );
}
