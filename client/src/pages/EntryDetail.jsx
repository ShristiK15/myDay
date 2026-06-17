import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { MOOD_EMOJI, formatDate, MOODS } from '../utils/constants';

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/entries/${id}`).then((r) => {
      setEntry(r.data);
      setForm(r.data);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this entry permanently?')) return;
    await api.delete(`/entries/${id}`);
    navigate('/entries');
  };

  const handleSave = async () => {
    const { data } = await api.put(`/entries/${id}`, form);
    setEntry(data);
    setEditing(false);
  };

  if (!entry) return <p className="font-serif italic">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/entries" className="mb-6 inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100">
        <ArrowLeft className="h-4 w-4" /> Back to entries
      </Link>

      <PaperCard>
        {entry.photoUrl && (
          <img src={entry.photoUrl} alt="" className="mb-6 w-full rounded-xl object-cover max-h-96" />
        )}

        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm opacity-60">{formatDate(entry.date)}</p>
            {editing ? (
              <input
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field mt-1 font-serif text-2xl font-bold"
              />
            ) : (
              <h1 className="font-serif text-3xl font-bold">
                {entry.title} {MOOD_EMOJI[entry.mood]}
              </h1>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="rounded-lg p-2 hover:bg-black/5">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="rounded-lg p-2 text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {editing ? (
          <>
            <div className="mb-4 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, mood: m })}
                  className={`rounded-lg px-2 py-1 ${form.mood === m ? 'bg-[var(--accent)] text-white' : 'bg-[#ebe4d3]'}`}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="input-field font-serif text-lg"
            />
            <button onClick={handleSave} className="btn-primary mt-4">Save changes</button>
          </>
        ) : (
          <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{entry.content}</p>
        )}

        {entry.voiceNoteUrl && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium">Voice note</p>
            <audio controls src={entry.voiceNoteUrl} className="w-full" />
          </div>
        )}

        {entry.reflectionPrompt && (
          <div className="mt-6 rounded-xl bg-[#ebe4d3]/50 p-4">
            <p className="font-serif font-bold">{entry.reflectionPrompt}</p>
            <p className="mt-2 font-serif italic">{entry.reflectionAnswer}</p>
          </div>
        )}
      </PaperCard>
    </div>
  );
}
