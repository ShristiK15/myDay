import { Flame } from 'lucide-react';

export default function StreakBadge({ streak }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm text-white">
      <Flame className="h-4 w-4 text-amber-300" />
      {streak ?? 0} day streak
    </span>
  );
}
