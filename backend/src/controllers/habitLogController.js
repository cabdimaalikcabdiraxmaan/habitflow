import prisma from '../utils/prisma.js';
import { z } from 'zod';

const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

async function getOwnedHabit(id, userId) {
  const habit = await prisma.habit.findFirst({ where: { id: Number(id), userId: Number(userId) } });
  return habit;
}

export async function listHabitLogs(req, res) {
  try {
    const habit = await getOwnedHabit(req.params.id, req.userId);
    if (!habit) return res.status(404).json({ message: 'Not found' });

    const logs = await prisma.habitLog.findMany({
      where: { habitId: habit.id },
      orderBy: { completedDate: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function toggleHabitLog(req, res) {
  try {
    const habit = await getOwnedHabit(req.params.id, req.userId);
    if (!habit) return res.status(404).json({ message: 'Not found' });

    const { date } = logSchema.parse(req.body);
    const completedDate = parseDate(date);

    const existing = await prisma.habitLog.findFirst({
      where: { habitId: habit.id, completedDate },
    });

    if (existing) {
      return res.json({ completed: true, log: existing });
    }

    const log = await prisma.habitLog.create({
      data: { habitId: habit.id, completedDate },
    });
    res.status(201).json({ completed: true, log });
  } catch (err) {
    if (err?.errors) return res.status(400).json({ message: 'Invalid input', details: err.errors });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getCalendarLogs(req, res) {
  try {
    const userId = Number(req.userId);
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const logs = await prisma.habitLog.findMany({
      where: {
        completedDate: { gte: start, lt: end },
        habit: { userId },
      },
      include: { habit: { select: { id: true, title: true, category: true } } },
      orderBy: { completedDate: 'asc' },
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
