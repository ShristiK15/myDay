import { useState } from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaperCard from '../components/ui/PaperCard';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState('');

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return setMsg('Passwords do not match');
    try {
      await api.put('/users/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setMsg('Password updated');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  const exportJSON = async () => {
    const { data } = await api.get('/users/export/json');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'myday-journal.json';
    a.click();
  };

  const exportPDF = () => {
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/users/export/pdf`, '_blank');
  };

  const deleteAccount = async () => {
    const password = prompt('Enter your password to confirm deletion:');
    if (!password) return;
    await api.delete('/users/account', { data: { password } });
    logout();
    navigate('/sign-in');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PaperCard>
        <h3 className="mb-4 font-serif text-xl font-bold">Change Password</h3>
        {msg && <p className="mb-2 text-sm">{msg}</p>}
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            className="input-field"
          />
          <input
            type="password"
            placeholder="New password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="input-field"
          />
          <button type="submit" className="btn-primary w-full">
            Update Password
          </button>
        </form>
      </PaperCard>

      <PaperCard>
        <h3 className="mb-4 font-serif text-xl font-bold">Export Journal</h3>
        <div className="flex flex-col gap-3">
          <button onClick={exportJSON} className="flex items-center gap-2 rounded-lg border border-[#d4c4b0] px-4 py-3 text-sm">
            <Download className="h-4 w-4" /> Export as JSON
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 rounded-lg border border-[#d4c4b0] px-4 py-3 text-sm">
            <FileText className="h-4 w-4" /> Export as PDF
          </button>
        </div>
      </PaperCard>

      <PaperCard className="border-red-200">
        <h3 className="mb-2 font-serif text-xl font-bold text-red-800">Danger Zone</h3>
        <p className="mb-4 text-sm opacity-70">Permanently delete your account and all journal data.</p>
        <button
          onClick={deleteAccount}
          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800"
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      </PaperCard>
    </div>
  );
}
