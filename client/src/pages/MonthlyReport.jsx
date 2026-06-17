import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lightbulb, Mountain, Heart, Download } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { MOOD_EMOJI } from '../utils/constants';

export default function MonthlyReport() {
  const [report, setReport] = useState(null);
  const now = new Date();

  useEffect(() => {
    api
      .get('/reflections/monthly/report', {
        params: { year: now.getFullYear(), month: now.getMonth() + 1 },
      })
      .then((r) => setReport(r.data));
  }, []);

  if (!report) return <p className="font-serif italic">Generating your story...</p>;

  const { reflection, stats, title } = report;
  const cards = [
    { icon: Trophy, title: 'Biggest Achievement', text: reflection?.achievement },
    { icon: Lightbulb, title: 'Biggest Lesson', text: reflection?.lesson },
    { icon: Mountain, title: 'Biggest Challenge', text: reflection?.challenge },
    { icon: Heart, title: 'Favorite Memory', text: reflection?.favoriteMemory },
  ];

  return (
    <div className="space-y-6">
      <PaperCard className="text-center">
        <p className="text-xs tracking-widest uppercase text-[#b35a38]">Your monthly story</p>
        <h2 className="font-serif text-3xl font-bold">{title}</h2>
        <p className="mt-2 font-serif italic opacity-70">
          Your month, distilled into one beautiful page.
        </p>
      </PaperCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, title: t, text }) => (
          <PaperCard key={t}>
            <Icon className="mb-2 h-5 w-5" />
            <h3 className="font-serif font-bold">{t}</h3>
            <p className="mt-2 font-serif text-sm leading-relaxed opacity-80">{text || '—'}</p>
          </PaperCard>
        ))}
      </div>

      <PaperCard>
        <div className="grid grid-cols-3 divide-x divide-[#d4c4b0] text-center">
          <div className="px-4">
            <p className="font-serif text-3xl font-bold">{stats?.entriesWritten ?? 0}</p>
            <p className="text-xs opacity-60">pages this month</p>
          </div>
          <div className="px-4">
            <p className="text-3xl">{MOOD_EMOJI[stats?.dominantMood] || '—'}</p>
            <p className="text-xs opacity-60">
              {stats?.dominantMood} on {stats?.dominantMoodDays} days
            </p>
          </div>
          <div className="px-4">
            <p className="font-serif text-3xl font-bold">{stats?.writingStreak ?? 0} Days</p>
            <p className="text-xs opacity-60">writing streak</p>
          </div>
        </div>
      </PaperCard>

      <div className="flex justify-between">
        <Link to="/reflection" className="text-sm underline">
          ← Back to questions
        </Link>
        <button className="btn-primary flex items-center gap-2">
          <Download className="h-4 w-4" /> Save Report
        </button>
      </div>
    </div>
  );
}
