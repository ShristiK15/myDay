import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, PenLine, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { MOODS, MOOD_EMOJI, formatShortDate } from '../utils/constants';

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [mood, setMood] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: false });

const [debouncedSearch, setDebouncedSearch] = useState(search);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  const params = { search: debouncedSearch || undefined, mood: mood || undefined, page };
  if (hasPhoto) params.hasPhoto = 'true';
  api.get('/entries', { params }).then((r) => {
    setEntries(r.data.entries);
    setPagination(r.data.pagination);
  });
}, [debouncedSearch, mood, hasPhoto, page]);

  const grouped = entries.reduce((acc, e) => {
    const key = new Date(e.date).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/write" className="btn-primary ml-auto flex items-center gap-2">
          <PenLine className="h-4 w-4" /> New Entry
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search your memories..."
          className="input-field !pl-11"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setMood('');
            setPage(1);
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${!mood ? 'bg-[var(--accent)] text-white' : 'bg-[#ebe4d3]'}`}
        >
          All
        </button>
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMood(mood === m ? '' : m);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm ${mood === m ? 'bg-[var(--accent)] text-white' : 'bg-[#ebe4d3]'}`}
          >
            {MOOD_EMOJI[m]} {m}
          </button>
        ))}
        <button
          onClick={() => {
            setHasPhoto(!hasPhoto);
            setPage(1);
          }}
          className={`rounded-full px-4 py-1.5 text-sm ${hasPhoto ? 'bg-[var(--accent)] text-white' : 'bg-[#ebe4d3]'}`}
        >
          Photos
        </button>
        <button className="ml-auto flex items-center gap-1 text-sm opacity-60">
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </button>
      </div>

      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="mb-10">
          <div className="dotted-line relative mb-6 text-center">
            <span className="relative z-10 bg-[var(--bg-main)] px-4 font-serif text-sm tracking-widest">{month}</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entry) => (
              <Link
                key={entry._id}
                to={`/entries/${entry._id}`}
                className="app-card overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-[#ebe4d3]">
                  {entry.photoUrl ? (
                    <img src={entry.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-serif italic opacity-40">No photo</div>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                    {formatShortDate(entry.date)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-bold">
                    {entry.title || 'Untitled'} {MOOD_EMOJI[entry.mood]}
                  </h3>
                  <p className="mt-2 line-clamp-3 font-serif text-sm italic opacity-70">
                    {entry.content}
                  </p>
                  <span className="mt-3 inline-block text-sm underline">Read entry →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <p className="py-12 text-center font-serif text-xl italic opacity-50">No entries yet. Start writing!</p>
      )}

      {entries.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-full bg-[#ebe4d3] px-4 py-2 text-sm disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm opacity-60">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasMore}
            className="flex items-center gap-1 rounded-full bg-[#ebe4d3] px-4 py-2 text-sm disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}