import { useState } from 'react';
import { Camera, Bell, Flame, Save } from 'lucide-react';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { useAuth } from '../context/AuthContext';

const THEMES = [
  { id: 'parchment', name: 'Parchment', bg: '#f5f1e6', dot: '#4a3728' },
  { id: 'midnight', name: 'Midnight Ink', bg: '#1a1814', dot: '#c9a962' },
  { id: 'linen', name: 'Linen Blue', bg: '#eef4f7', dot: '#3d6b7a' },
];

export default function Profile() {
  const { user, updateUserLocal, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    theme: user?.theme || 'parchment',
    reminders: user?.reminders || { dailyReminder: false, reminderTime: '20:00', streakAlerts: true },
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('theme', form.theme);
    fd.append('reminders', JSON.stringify(form.reminders));
    try {
      const { data } = await api.put('/users/profile', fd);
      updateUserLocal(data);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full transition ${checked ? 'bg-[var(--accent)]' : 'bg-[#d4c4b0]'}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaperCard className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-full bg-[#ebe4d3]">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-3xl">
                {user?.name?.[0]}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 rounded-full bg-[var(--accent)] p-1.5 text-white">
            <Camera className="h-4 w-4" />
          </span>
        </div>
        <label className="mt-4 cursor-pointer text-sm underline">
          Change photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const fd = new FormData();
              fd.append('avatar', e.target.files[0]);
              fd.append('name', form.name);
              const { data } = await api.put('/users/profile', fd);
              updateUserLocal(data);
            }}
          />
        </label>
      </PaperCard>

      <PaperCard>
        <h3 className="mb-4 font-serif font-bold">Your Name</h3>
        <label className="text-xs opacity-60">Display name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field mb-3"
        />
        <label className="text-xs opacity-60">Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
      </PaperCard>

      <PaperCard>
        <h3 className="mb-4 font-serif font-bold">Reminder Settings</h3>
        {[
          { key: 'dailyReminder', icon: Bell, label: 'Daily reminder', sub: 'A nudge each evening' },
          { key: 'streakAlerts', icon: Flame, label: 'Streak alerts', sub: "Don't break the chain" },
        ].map(({ key, icon: Icon, label, sub }) => (
          <div key={key} className="mb-4 flex items-center justify-between">
            <div className="flex gap-3">
              <Icon className="h-5 w-5 opacity-50" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs opacity-50">{sub}</p>
              </div>
            </div>
            <Toggle
              checked={form.reminders[key]}
              onChange={(v) => setForm({ ...form, reminders: { ...form.reminders, [key]: v } })}
            />
          </div>
        ))}
        <input
          type="time"
          value={form.reminders.reminderTime}
          onChange={(e) =>
            setForm({ ...form, reminders: { ...form.reminders, reminderTime: e.target.value } })
          }
          className="input-field w-auto"
        />
      </PaperCard>

      <PaperCard>
        <h3 className="mb-4 font-serif font-bold">Theme</h3>
        <div className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setForm({ ...form, theme: t.id })}
              className={`flex-1 rounded-xl border-2 p-3 text-center ${
                form.theme === t.id ? 'border-[var(--accent)]' : 'border-transparent'
              }`}
              style={{ background: t.bg }}
            >
              <span className="mx-auto mb-1 block h-4 w-4 rounded-full" style={{ background: t.dot }} />
              <p className="text-xs font-medium" style={{ color: t.dot }}>
                {t.name}
              </p>
            </button>
          ))}
        </div>
      </PaperCard>

      <div className="md:col-span-2 flex justify-end gap-4">
        <button className="text-sm opacity-60">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>
    </div>
  );
}
