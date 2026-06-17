import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StreakBadge from '../ui/StreakBadge';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ title, subtitle, icon: Icon }) {
  const { user } = useAuth();

  return (
    <div className="app-shell min-h-screen pl-64">
      <Sidebar />
      <main className="min-h-screen px-8 py-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-4xl font-bold">
              {Icon && <Icon className="h-8 w-8 opacity-70" />}
              {title}
            </h1>
            {subtitle && <p className="mt-1 font-serif text-lg italic opacity-70">{subtitle}</p>}
          </div>
          <StreakBadge streak={user?.currentStreak} />
        </header>
        <Outlet />
      </main>
    </div>
  );
}
