import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Mic, Square, Save } from 'lucide-react';
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
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [saving, setSaving] = useState(false);
  const prompt = useState(getRandomPrompt)[0];
  const quote = getQuoteOfDay();
  const mediaRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const form = new FormData();
    form.append('content', content);
    form.append('title', title || content.slice(0, 50));
    form.append('mood', mood);
    form.append('reflectionPrompt', prompt);
    form.append('reflectionAnswer', reflectionAnswer);
    form.append('date', new Date().toISOString());
    if (photo) form.append('photo', photo);
    if (voiceBlob) form.append('voice', voiceBlob, 'voice-note.webm');

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
          <input
            value={reflectionAnswer}
            onChange={(e) => setReflectionAnswer(e.target.value)}
            className="input-field mt-2"
            placeholder="Your reflection..."
          />
        </div>

        <div className="mt-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dear diary..."
            rows={10}
            className="w-full rounded-xl border-l-4 border-[#d4c4b0] bg-[#faf8f5] p-4 font-serif text-lg leading-relaxed focus:outline-none"
            style={{ borderLeftColor: 'var(--accent)' }}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 rounded-full border border-[#d4c4b0] px-4 py-2 text-sm"
            >
              <Mic className="h-4 w-4" /> Voice journal
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm text-red-800"
            >
              <Square className="h-4 w-4" /> Stop recording
            </button>
          )}
          {voiceBlob && <span className="text-sm text-green-700">Voice note ready</span>}
          {voiceBlob && <audio ref={mediaRef} src={URL.createObjectURL(voiceBlob)} controls className="h-8" />}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </PaperCard>
    </div>
  );
}
