import prisma from '../utils/prisma.js';

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeStreak(logDates) {
  if (!logDates.size) return 0;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (logDates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getStats(req, res) {
  try {
    const userId = Number(req.userId);
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const todayKey = localDateKey();

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    let completedToday = 0;
    let weeklyCompleted = 0;
    let weeklyPossible = habits.length * 7;
    let longestStreak = 0;

    const byCategory = {};

    for (const habit of habits) {
      const logDates = new Set(habit.logs.map(l => localDateKey(new Date(l.completedDate))));
      if (logDates.has(todayKey)) completedToday += 1;

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        if (logDates.has(localDateKey(d))) weeklyCompleted += 1;
      }

      longestStreak = Math.max(longestStreak, computeStreak(logDates));

      const cat = habit.category || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { category: cat, count: 0, completed: 0 };
      byCategory[cat].count += 1;
      if (logDates.has(todayKey)) byCategory[cat].completed += 1;
    }

    const weeklyCompletion = weeklyPossible
      ? Math.round((weeklyCompleted / weeklyPossible) * 100)
      : 0;

    res.json({
      totalHabits: habits.length,
      completedToday,
      longestStreak,
      weeklyCompletion,
      byCategory: Object.values(byCategory),
      recentActivity: habits
        .flatMap(h => h.logs.map(l => ({ ...l, habitTitle: h.title, habitId: h.id })))
        .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
        .slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
