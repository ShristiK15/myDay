import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, Trash2, ArrowLeft, Lock } from 'lucide-react';
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

  const isEditable = entry
    ? (() => {
        const created = new Date(entry.createdAt);
        const now = new Date();
        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === now.getMonth() &&
          created.getDate() === now.getDate()
        );
      })()
    : false;

  const handleDelete = async () => {
    if (!confirm('Delete this entry permanently?')) return;
    await api.delete(`/entries/${id}`);
    navigate('/entries');
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put(`/entries/${id}`, form);
      setEntry(data);
      setEditing(false);
    } catch (err) {
      if (err.response?.status === 403) {
        alert(err.response.data?.message || 'This entry can no longer be edited.');
        setEditing(false);
      } else {
        alert('Something went wrong while saving.');
      }
    }
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

        {/* Header: date + action buttons only — title hidden */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm opacity-60">{formatDate(entry.date)}</p>

          <div className="flex gap-2">
            {isEditable ? (
              <button onClick={() => setEditing(!editing)} className="rounded-lg p-2 hover:bg-black/5">
                <Pencil className="h-4 w-4" />
              </button>
            ) : (
              <button
                disabled
                title="Entries can only be edited on the day they were written"
                className="cursor-not-allowed rounded-lg p-2 opacity-30"
              >
                <Lock className="h-4 w-4" />
              </button>
            )}
            <button onClick={handleDelete} className="rounded-lg p-2 text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mood selector (edit mode only) */}
        {editing && (
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
        )}

        {/* Main content */}
        {editing ? (
          <>
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={12}
              className="input-field font-serif text-lg"
            />
          </>
        ) : (
          <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{entry.content}</p>
        )}

        {/* Reflection block */}
        {entry.reflectionPrompt && (
          <div className="mt-6 rounded-xl bg-[#ebe4d3]/50 p-4">
            <p className="font-serif font-bold">{entry.reflectionPrompt}</p>
            {editing ? (
              <textarea
                value={form.reflectionAnswer || ''}
                onChange={(e) => setForm({ ...form, reflectionAnswer: e.target.value })}
                rows={4}
                placeholder="Write your reflection…"
                className="input-field mt-2 w-full font-serif italic text-base"
              />
            ) : (
              <p className="mt-2 font-serif italic">{entry.reflectionAnswer}</p>
            )}
          </div>
        )}

        {/* Save button */}
        {editing && (
          <button onClick={handleSave} className="btn-primary mt-4">
            Save changes
          </button>
        )}
      </PaperCard>
    </div>
  );
}