import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Save, Maximize2, X } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { MOODS, MOOD_EMOJI, formatDate, getQuoteOfDay, getRandomPrompt } from '../utils/constants';

export default function WriteEntry() {
  const navigate = useNavigate();
  const [mood, setMood] = useState('Happy');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const prompt = useState(getRandomPrompt)[0];
  const quote = getQuoteOfDay();

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (contentError) setContentError(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setContentError(true);
      setExpanded(false);
      contentRef.current?.focus();
      return;
    }
    setContentError(false);

    setSaving(true);
    const form = new FormData();
    form.append('content', content.trim());
    form.append('title', title || reflectionAnswer.slice(0, 50));
    form.append('mood', mood);
    form.append('reflectionPrompt', prompt);
    form.append('reflectionAnswer', reflectionAnswer);
    form.append('date', new Date().toISOString());
    if (photo) form.append('photo', photo);

    try {
      const { data } = await api.post('/entries', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/entries/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-2xl">
          <Sparkles className="h-5 w-5" /> Today&apos;s Entry
        </h2>
      </div>

      <PaperCard tape>
        <div className="mb-6 rounded-xl bg-[#ebe4d3]/60 p-4 font-serif italic">
          <span className="text-4xl leading-none opacity-30">&ldquo;</span>
          {quote.text} — {quote.author}
        </div>

        <p className="text-xs tracking-widest uppercase opacity-60">Today</p>
        <p className="font-serif text-2xl font-bold">{formatDate(new Date())}</p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Photo of the Day</p>
          <div className="relative mx-auto max-w-xs">
            <div className="tape" />
            <div className="rotate-[-1deg] rounded bg-white p-3 shadow-md">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center bg-[#f0ebe3] text-center">
                  <Upload className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">Tape in your photo</p>
                </div>
              )}
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d4c4b0] py-2 text-sm">
                <Upload className="h-4 w-4" /> Browse files
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium">Mood of the Day</p>
          <div className="grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`rounded-xl border p-3 text-center transition ${
                  mood === m ? 'border-[var(--accent)] bg-[#ebe4d3]' : 'border-[#d4c4b0]/50'
                }`}
              >
                <span className="text-2xl">{MOOD_EMOJI[m]}</span>
                <p className="mt-1 text-xs">{m}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="font-serif text-lg font-bold">{prompt}</p>
          <textarea
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            className="input-field mt-2"
            placeholder="Your reflection..."
            rows={3}
          />  
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              Your Entry <span className="text-red-500">*</span>
            </p>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-sm opacity-60 transition hover:opacity-100"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Expand
            </button>
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Dear diary..."
            rows={10}
            className="w-full rounded-xl border-l-4 bg-[#faf8f5] p-4 font-serif text-lg leading-relaxed focus:outline-none"
            style={{ borderLeftColor: contentError ? '#dc2626' : 'var(--accent)' }}
          />
          {contentError && (
            <p className="mt-2 text-sm text-red-600">Please write something before saving.</p>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </PaperCard>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2420]/50 p-4 backdrop-blur-sm sm:p-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative flex h-full w-full max-w-3xl flex-col rounded-2xl bg-[#faf8f5] p-10 shadow-2xl"
            >
              <button
                onClick={() => setExpanded(false)}
                className="absolute right-5 top-5 rounded-full p-2 opacity-50 transition hover:bg-black/5 hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="text-xs tracking-widest uppercase opacity-50">{formatDate(new Date())}</p>
              <h3 className="mb-6 font-serif text-2xl font-bold">Dear Diary...</h3>

              <textarea
                autoFocus
                value={content}
                onChange={handleContentChange}
                placeholder="Let your thoughts flow..."
                className="flex-1 w-full resize-none border-none bg-transparent font-serif text-xl leading-relaxed focus:outline-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}