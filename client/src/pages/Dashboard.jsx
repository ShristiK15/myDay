import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
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
import { Flame, BookOpen, Camera, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { MOOD_EMOJI } from '../utils/constants';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');
  const [calMonth, setCalMonth] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() + 1 };
  });
  const [hoverEntry, setHoverEntry] = useState(null);

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

  const daysInMonth = new Date(calMonth.year, calMonth.month, 0).getDate();
  const firstDay = new Date(calMonth.year, calMonth.month - 1, 1).getDay();
  const entryMap = {};
  (data.calendarEntries || []).forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === calMonth.year && d.getMonth() + 1 === calMonth.month) {
      entryMap[d.getDate()] = e;
    }
  });

  const periods = ['week', 'month', 'year'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-serif text-3xl font-bold">{data.greeting}</h2>
        <p className="text-sm opacity-70">Welcome back, here is your reflection summary.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PaperCard className="lg:col-span-2" tape delay={0.1}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold">Mood Over Time</h3>
              <p className="text-sm opacity-60">Average mood: {data.analytics?.average || '—'}/5</p>
            </div>
            <div className="flex rounded-full bg-[#ebe4d3] p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-3 py-1 text-xs capitalize ${
                    period === p ? 'bg-[var(--accent)] text-white' : ''
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
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#4a3728" fill="url(#moodGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="score" stroke="#4a3728" dot={{ fill: '#4a3728', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </PaperCard>

        <PaperCard delay={0.15}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">
              {new Date(calMonth.year, calMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setCalMonth((m) => {
                    const d = new Date(m.year, m.month - 2);
                    return { year: d.getFullYear(), month: d.getMonth() + 1 };
                  })
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setCalMonth((m) => {
                    const d = new Date(m.year, m.month);
                    return { year: d.getFullYear(), month: d.getMonth() + 1 };
                  })
                }
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} className="py-1 font-medium opacity-50">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const entry = entryMap[day];
              const isToday =
                day === new Date().getDate() &&
                calMonth.month === new Date().getMonth() + 1 &&
                calMonth.year === new Date().getFullYear();
              return (
                <div
                  key={day}
                  className="relative"
                  onMouseEnter={() => entry && setHoverEntry(entry)}
                  onMouseLeave={() => setHoverEntry(null)}
                >
                  {entry ? (
                    <Link
                      to={`/entries/${entry._id}`}
                      className={`flex h-8 w-full flex-col items-center justify-center rounded ${
                        isToday ? 'ring-2 ring-[var(--accent)]' : ''
                      }`}
                    >
                      <span>{day}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                    </Link>
                  ) : (
                    <span className={`flex h-8 items-center justify-center ${isToday ? 'font-bold' : 'opacity-50'}`}>
                      {day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {hoverEntry && (
            <div className="mt-3 rounded-lg bg-[#ebe4d3] p-2 text-xs">
              {hoverEntry.photoUrl && (
                <img src={hoverEntry.photoUrl} alt="" className="mb-1 h-16 w-full rounded object-cover" />
              )}
              <p>{MOOD_EMOJI[hoverEntry.mood]} {hoverEntry.mood}</p>
              <p className="italic line-clamp-2">{hoverEntry.content || hoverEntry.title}</p>
            </div>
          )}
          <div className="mt-3 flex gap-4 text-xs opacity-60">
            <span>● Has entry</span>
            <span>○ No entry</span>
          </div>
        </PaperCard>
      </div>

      <PaperCard delay={0.2}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebe4d3]">
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
                    d.hasEntry ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[#d4c4b0] bg-transparent'
                  }`}
                  title={new Date(d.date).toLocaleDateString()}
                />
              ))}
            </div>
          </div>
        </div>
      </PaperCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: 'Total entries', value: data.stats?.totalEntries },
          { icon: Camera, label: 'Photos captured', value: data.stats?.totalPhotos },
          { icon: Mic, label: 'Voice journals', value: data.stats?.totalVoice },
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
