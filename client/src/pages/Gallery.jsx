import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MOODS, MOOD_EMOJI } from '../utils/constants';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('');
  const [mood, setMood] = useState('');

  useEffect(() => {
    api
      .get('/entries/gallery', {
        params: { year, month: month || undefined, mood: mood || undefined },
      })
      .then((r) => setPhotos(r.data));
  }, [year, month, mood]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field w-auto">
          {[2026, 2025, 2024].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field w-auto">
          <option value="">All months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <select value={mood} onChange={(e) => setMood(e.target.value)} className="input-field w-auto">
          <option value="">All moods</option>
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {MOOD_EMOJI[m]} {m}
            </option>
          ))}
        </select>
      </div>

      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((p) => (
          <Link
            key={p._id}
            to={`/entries/${p._id}`}
            className="mb-4 block break-inside-avoid overflow-hidden rounded-xl shadow-md transition hover:shadow-lg"
          >
            <img src={p.photoUrl} alt={p.title} className="w-full object-cover" />
            <div className="bg-white/90 p-2 text-xs">
              <span>{MOOD_EMOJI[p.mood]}</span> {p.title}
            </div>
          </Link>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="py-16 text-center font-serif text-xl italic opacity-50">No photos yet</p>
      )}
    </div>
  );
}
