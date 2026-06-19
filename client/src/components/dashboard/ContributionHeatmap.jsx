import { Fragment, useMemo, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

// Monday=0 ... Sunday=6
const dayIndexMonFirst = (d) => (d.getDay() + 6) % 7;

const formatDate = (d) =>
  d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const intensity = (count) => {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
};


const INTENSITY_CLASSES = [
  'bg-[#f2ede3] border-[#d4c4b0]/60',  // original - untouched
  'bg-[#c8b898] border-[#d4c4b0]/70',  // darker from here
  'bg-[#a8895e] border-[#d4c4b0]/80',
  'bg-[#7a5c35] border-[#d4c4b0]/90',
  'bg-[#4a3728] border-[#4a3728]',
];

export default function ContributionHeatmap({ activity = [] }) {
  const [hover, setHover] = useState(null);

  const activityMap = useMemo(() => {
    const map = new Map();
    activity.forEach((a) => {
      const d = startOfDay(a.date);
      map.set(d.getTime(), {
        entryCount: a.entryCount ?? 0,
        averageMood: a.averageMood ?? null,
      });
    });
    return map;
  }, [activity]);

  const { weeks, monthLabels } = useMemo(() => {
    const end = startOfDay(new Date());
    const start365 = addDays(end, -364);

    // Build a full-week grid (Mon-first) with leading/trailing padding for alignment.
    const startGrid = addDays(start365, -dayIndexMonFirst(start365));
    const endGrid = addDays(end, 6 - dayIndexMonFirst(end));

    const days = [];
    for (let d = new Date(startGrid); d <= endGrid; d = addDays(d, 1)) {
      const day = startOfDay(d);
      const isInRange = day >= start365 && day <= end;
      const stats = activityMap.get(day.getTime()) || { entryCount: 0, averageMood: null };
      days.push({
        date: day,
        isInRange,
        ...stats,
      });
    }

    const weeksArr = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArr.push(days.slice(i, i + 7));
    }

    // Month labels at the top, placed on the first week that contains a day 1.
    const labels = [];
    weeksArr.forEach((week, wi) => {
      const firstOfMonth = week.find((d) => d.isInRange && d.date.getDate() === 1);
      if (firstOfMonth) labels.push({ weekIndex: wi, label: MONTHS[firstOfMonth.date.getMonth()] });
    });

    return { weeks: weeksArr, monthLabels: labels };
  }, [activityMap]);

  const weekdayLabels = [
    { row: 0, label: 'Mon' },
    { row: 1, label: 'Tue' },
    { row: 2, label: 'Wed' },
    { row: 3, label: 'Thu' },
    { row: 4, label: 'Fri' },
    { row: 5, label: 'Sat' },
    { row: 6, label: 'Sun' },
  ];

  

  const weekCount = weeks.length;
  const gridTemplate = `2.75rem repeat(${weekCount}, minmax(11px, 1fr))`;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold">Journal Activity</h3>
          <p className="text-sm opacity-60">Last 365 days</p>
        </div>
        <div className="hidden items-center gap-1.5 text-xs opacity-60 sm:flex">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-[5px] border ${INTENSITY_CLASSES[i]}`}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <div className="w-full">
          <div
            className="grid w-full gap-1"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {/* Month labels */}
            <div className="h-4" aria-hidden="true" />
            {weeks.map((week, wi) => {
              const monthLabel = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={`month-${wi}`} className="h-4 truncate text-xs opacity-60">
                  {monthLabel?.label ?? ''}
                </div>
              );
            })}

            {/* Day rows — shared grid rows keep labels aligned with cells */}
            {[0, 1, 2, 3, 4, 5, 6].map((row) => {
              const weekdayLabel = weekdayLabels.find((w) => w.row === row)?.label ?? '';
              return (
                <Fragment key={`row-${row}`}>
                  <div className="flex items-center text-xs opacity-60">{weekdayLabel}</div>
                  {weeks.map((week, wi) => {
                    const d = week[row];
                    const i = intensity(d.entryCount);
                    const disabled = !d.isInRange;
                    const labelParts = [
                      formatDate(d.date),
                      `${d.entryCount} entr${d.entryCount === 1 ? 'y' : 'ies'}`,
                      `Avg mood: ${d.averageMood == null ? '—' : d.averageMood.toFixed(1)}/5`,
                    ];

                    return (
                      <button
                        key={d.date.toISOString()}
                        type="button"
                        className={[
                          'aspect-square w-full min-h-[11px] rounded-[5px] border transition-transform',
                          disabled ? 'opacity-30' : 'hover:scale-[1.08]',
                          INTENSITY_CLASSES[i],
                        ].join(' ')}
                        onMouseEnter={(e) => {
                          if (disabled) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHover({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            date: d.date,
                            entryCount: d.entryCount,
                            averageMood: d.averageMood,
                          });
                        }}
                        onMouseLeave={() => setHover(null)}
                        aria-label={labelParts.join(', ')}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </div>

        {hover && (
          <div
            className="pointer-events-none fixed z-50 w-[220px] -translate-x-1/2 -translate-y-2 rounded-lg border border-[#d4c4b0]/60 bg-white px-3 py-2 text-xs shadow-lg"
            style={{ left: hover.x, top: hover.y }}
          >
            <p className="font-medium">{formatDate(hover.date)}</p>
            <p className="opacity-80">
              {hover.entryCount} entr{hover.entryCount === 1 ? 'y' : 'ies'}
            </p>
            <p className="opacity-80">
              Avg mood: {hover.averageMood == null ? '—' : `${hover.averageMood.toFixed(1)}/5`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

