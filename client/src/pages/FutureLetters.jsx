import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Bell, Calendar, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';

export default function FutureLetters() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState({ drafts: [], waiting: [], openable: [], opened: [] });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [draftId, setDraftId] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');

  const load = () => api.get('/letters').then((r) => setLetters(r.data));

  const defaultOpenDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    load();
    setOpenDate(defaultOpenDate());
  }, []);

  const resetComposer = () => {
    setTitle('');
    setContent('');
    setDraftId(null);
    setOpenDate(defaultOpenDate());
  };

  const editDraft = (letter) => {
    setDraftId(letter._id);
    setTitle(letter.title || '');
    setContent(letter.content || '');
    setOpenDate(letter.openDate.split('T')[0]);
  };

const saveDraft = async () => {
  if (!title.trim() || !content.trim()) {
    alert('Title and content are required');
    return;
  }

  try {
    if (draftId) {
      await api.put(`/letters/${draftId}`, { title, content, openDate });
    } else {
      const { data } = await api.post('/letters', {
        title,
        content,
        openDate,
        status: 'Draft',
      });
      setDraftId(data._id);
    }

    setSavedMessage('Draft saved');
    setTimeout(() => setSavedMessage(''), 2000);
    load();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save draft');
  }
};

const seal = async () => {
  if (!title.trim() || !content.trim()) {
    alert('Title and content are required');
    return;
  }

  try {
    let id = draftId;

    if (!id) {
      const { data } = await api.post('/letters', {
        title,
        content,
        openDate,
        status: 'Draft',
      });
      id = data._id;
    } else {
      await api.put(`/letters/${id}`, {
        title,
        content,
        openDate,
      });
    }

    await api.post(`/letters/${id}/seal`, { openDate });

    resetComposer();
    load();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to seal letter');
  }
};

  const openLetter = async (id) => {
    await api.post(`/letters/${id}/open`);
    navigate(`/letters/${id}`);
  };

  const quickDates = [
    { label: 'In 1 year', years: 1 },
    { label: 'Jan 1, 2027', fixed: '2027-01-01' },
    { label: 'In 5 years', years: 5 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <PaperCard tape>
          <p className="text-xs tracking-widest text-[#b35a38]">A LETTER TO THE FUTURE</p>
          <h2 className="font-serif text-3xl font-bold">Dear future me,</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this letter a title..."
            className="mt-3 w-full rounded-lg bg-[#4a3728]/80 px-3 py-2 font-serif text-base text-[#f5f1e6] placeholder:text-[#d4c4b0]/50 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Write what your future self needs to hear..."
            className="mt-3 w-full rounded-xl bg-[#4a3728] p-4 font-serif text-lg italic text-[#f5f1e6] placeholder:text-[#d4c4b0]/50 focus:outline-none"
          />
          <p className="mt-2 flex items-center gap-2 text-xs opacity-60">
            <Lock className="h-3 w-3" /> Sealed until the date you choose — even from you
          </p>
          <p className="text-right text-xs opacity-40">{content.split(/\s+/).filter(Boolean).length} words</p>
        </PaperCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <PaperCard>
            <Calendar className="mb-2 h-5 w-5" />
            <p className="font-serif font-bold">Open this on</p>
            <input type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} className="input-field mt-2" />
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDates.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    if (q.fixed) setOpenDate(q.fixed);
                    else {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + q.years);
                      setOpenDate(d.toISOString().split('T')[0]);
                    }
                  }}
                  className="rounded-full bg-[#ebe4d3] px-3 py-1 text-xs"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </PaperCard>
          <PaperCard>
            <Bell className="mb-2 h-5 w-5" />
            <p className="font-serif font-bold">Remind me it&apos;s coming</p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" /> Enable reminder
            </label>
          </PaperCard>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={saveDraft} className="text-sm underline">
              {draftId ? 'Update draft' : 'Save as draft'}
            </button>
            {savedMessage && <span className="text-xs text-green-700">{savedMessage}</span>}
          </div>
          <button onClick={seal} className="rounded-full bg-[#b35a38] px-6 py-3 text-white flex items-center gap-2">
            <Lock className="h-4 w-4" /> Seal & Schedule
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <PaperCard>
          <img
            src="https://images.unsplash.com/photo-1568667256549-094345857637?w=400"
            alt=""
            className="mb-3 w-full rounded-lg object-cover aspect-video"
          />
          <p className="font-serif italic text-sm">&ldquo;The future depends on what you do today.&rdquo;</p>
        </PaperCard>

        {letters.drafts?.length > 0 && (
          <PaperCard>
            <h3 className="mb-3 font-serif font-bold">Drafts</h3>
            <div className="space-y-2">
              {letters.drafts.map((l) => (
                <button
                  key={l._id}
                  onClick={() => editDraft(l)}
                  className="flex w-full items-center gap-3 rounded-lg bg-[#ebe4d3]/50 p-3 text-left text-sm"
                >
                  <Pencil className="h-4 w-4 opacity-60" />
                  <div>
                    <p className="line-clamp-1 font-medium">{l.title || 'Untitled letter'}</p>
                    <p className="text-xs opacity-60">Not yet sealed</p>
                  </div>
                </button>
              ))}
            </div>
          </PaperCard>
        )}

        <PaperCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif font-bold">Sealed Capsules</h3>
            <span className="rounded-full bg-[#ebe4d3] px-2 py-0.5 text-xs">{letters.waiting?.length} waiting</span>
          </div>
          <div className="space-y-2">
            {letters.openable?.map((l) => (
              <motion.button
                key={l._id}
                onClick={() => openLetter(l._id)}
                className="flex w-full items-center gap-3 rounded-lg bg-green-50 p-3 text-left text-sm"
              >
                <Mail className="h-4 w-4 text-green-700" />
                <div>
                  <p className="font-medium line-clamp-1">{l.title || l.content.slice(0, 30)}</p>
                  <p className="text-xs text-green-700">Ready to open now</p>
                </div>
              </motion.button>
            ))}
            {letters.waiting?.map((l) => (
              <div key={l._id} className="flex items-center gap-3 rounded-lg bg-[#ebe4d3]/50 p-3 text-sm">
                <Lock className="h-4 w-4" />
                <div>
                  <p className="line-clamp-1">{l.title || l.content.slice(0, 30)}</p>
                  <p className="text-xs opacity-60">Opens {new Date(l.openDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </PaperCard>

        {letters.opened?.length > 0 && (
          <PaperCard>
            <h3 className="mb-3 font-serif font-bold">Opened Letters</h3>
            <div className="space-y-2">
              {letters.opened.map((l) => (
                <button
                  key={l._id}
                  onClick={() => navigate(`/letters/${l._id}`)}
                  className="flex w-full items-center gap-3 rounded-lg bg-[#ebe4d3]/50 p-3 text-left text-sm"
                >
                  <Mail className="h-4 w-4 opacity-60" />
                  <div>
                    <p className="line-clamp-1 font-medium">{l.title || l.content.slice(0, 30)}</p>
                    <p className="text-xs opacity-60">Opened {new Date(l.updatedAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </PaperCard>
        )}
      </div>
    </div>
  );
}