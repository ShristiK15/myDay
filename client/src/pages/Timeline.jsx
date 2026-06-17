import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Calendar } from 'lucide-react';
import api from '../services/api';
import { MOOD_EMOJI, formatShortDate } from '../utils/constants';

const FILTERS = ['Today', 'This Week', 'This Month', 'This Year'];

export default function Timeline() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('Today');

  useEffect(() => {
    api.get('/entries/timeline').then((r) => setData(r.data));
  }, []);

  const sections = [
    { key: 'today', label: 'Today', icon: Sun, items: data?.today },
    { key: 'week', label: 'This Week', icon: Calendar, items: data?.week },
    { key: 'month', label: 'This Month', icon: Calendar, items: data?.month },
    { key: 'year', label: 'This Year', icon: Calendar, items: data?.year },
  ];

  const filterMap = { Today: 'today', 'This Week': 'week', 'This Month': 'month', 'This Year': 'year' };
  const activeKey = filterMap[filter];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[#ebe4d3]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-sm opacity-60">{data?.total ?? 0} memories</span>
      </div>

      {sections
        .filter((s) => !activeKey || s.key === activeKey)
        .map((section) => (
          <div key={section.key} className="mb-12">
            <div className="dotted-line mb-6 flex items-center gap-2">
              <section.icon className="h-4 w-4" />
              <h2 className="font-serif text-xl font-bold">{section.label}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(section.items || []).map((entry) => (
                <Link
                  key={entry._id}
                  to={`/entries/${entry._id}`}
                  className="app-card overflow-hidden rounded-xl transition hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={entry.photoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                      {formatShortDate(entry.date)}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-serif font-bold line-clamp-1">{entry.title || 'Memory'}</p>
                    <p className="text-lg">{MOOD_EMOJI[entry.mood]}</p>
                  </div>
                </Link>
              ))}
            </div>
            {!section.items?.length && (
              <p className="py-8 text-center font-serif italic opacity-50">No memories in this period</p>
            )}
          </div>
        ))}

      <div className="text-center">
        <button
          onClick={() => setFilter('This Year')}
          className="rounded-full border border-[#d4c4b0] px-6 py-2 text-sm"
        >
          Load this year&apos;s memories ↓
        </button>
      </div>
    </div>
  );
}
