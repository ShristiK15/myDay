import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lightbulb, Mountain, Heart } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';

const QUESTIONS = [
  { key: 'achievement', icon: Trophy, label: 'What was your biggest achievement this month?' },
  { key: 'lesson', icon: Lightbulb, label: 'What was your biggest lesson?' },
  { key: 'challenge', icon: Mountain, label: 'What was your biggest challenge?' },
  { key: 'favoriteMemory', icon: Heart, label: 'What is your favorite memory?' },
];

export default function MonthlyReflection() {
  const now = new Date();
  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(0);

  useEffect(() => {
    api
      .get('/reflections/monthly', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } })
      .then((r) => setAnswers(r.data || {}));
  }, []);

  const answered = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;

  const handleSave = async () => {
    await api.post('/reflections/monthly', {
      ...answers,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    setSaved(answered);
  };

  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PaperCard className="border-2 border-dashed border-[#d4c4b0] text-center" tape>
        <p className="text-xs tracking-widest uppercase opacity-60">End of month check-in</p>
        <h2 className="font-serif text-2xl font-bold">How was your {now.toLocaleString('default', { month: 'long' })}?</h2>
        <p className="mt-1 text-sm italic opacity-70">Answer honestly — this becomes part of your story.</p>
      </PaperCard>

      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span>{answered} of {QUESTIONS.length} answered</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#ebe4d3]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {QUESTIONS.map((q, i) => {
        const Icon = q.icon;
        const words = (answers[q.key] || '').split(/\s+/).filter(Boolean).length;
        return (
          <PaperCard key={q.key} delay={i * 0.05}>
            <div className="mb-3 flex items-center gap-2">
              <Icon className="h-5 w-5 opacity-60" />
              <h3 className="font-serif text-lg font-bold">{q.label}</h3>
            </div>
            <textarea
              value={answers[q.key] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
              rows={4}
              className="input-field font-serif"
              placeholder="Write your thoughts..."
            />
            <p className="mt-1 text-right text-xs opacity-40">{words} words</p>
          </PaperCard>
        );
      })}

      <div className="flex items-center justify-between">
        <Link to="/reflection/report" className="text-sm underline">
          View monthly report →
        </Link>
        <button onClick={handleSave} className="btn-primary">
          Save reflection
        </button>
      </div>
    </div>
  );
}
