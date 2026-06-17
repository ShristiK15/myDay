import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <aside className="app-sidebar fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-tan/40 px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--accent) text-white">
          <Icons.BookOpen className="h-5 w-5" />
        </div>
        <span className="font-serif text-2xl font-bold">MyDay</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const Icon = Icons[icon];
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-(--accent) text-white'
                    : 'text-(--text-primary)/80 hover:bg-black/5'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="my-4 rounded-xl border-2 border-dashed border-[#b8a99a] p-3 text-center text-xs italic opacity-80">
        <Icons.Sparkles className="mx-auto mb-1 h-4 w-4" />
        Keep your streak alive today
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-tan/60 bg-white/40 px-3 py-2.5 text-sm text-(--text-primary)/80 transition-colors hover:bg-black/5"
      >
        <Icons.LogOut className="h-4 w-4" />
        Logout
      </button>

      <div className="flex items-center gap-3 border-t border-tan/50 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent) text-sm font-medium text-white">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs opacity-60">{user?.email}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-terracotta">
            <Icons.Flame className="h-3 w-3" />
            {user?.currentStreak ?? 0} day streak
          </p>
        </div>
      </div>
    </aside>
  );
}
