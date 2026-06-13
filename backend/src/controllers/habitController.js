import prisma from '../utils/prisma.js';
import { z } from 'zod';

const habitSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetDays: z.number().int().positive().optional(),
});

export async function listHabits(req, res) {
  try {
    const userId = Number(req.userId);
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: { orderBy: { completedDate: 'desc' }, take: 7 },
        _count: { select: { logs: true } },
      },
    });
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createHabit(req, res) {
  try {
    const data = habitSchema.parse(req.body);
    const userId = Number(req.userId);
    const habit = await prisma.habit.create({ data: { ...data, userId } });
    res.status(201).json(habit);
  } catch (err) {
    if (err?.errors) return res.status(400).json({ message: 'Invalid input', details: err.errors });
    console.error('createHabit error:', err?.message || err, err?.stack);
    const payload = { message: 'Server error' };
    if (process.env.NODE_ENV === 'development') payload.error = err?.message;
    res.status(500).json(payload);
  }
}

export async function getHabit(req, res) {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.findFirst({
      where: { id: Number(id), userId: Number(req.userId) },
      include: { logs: { orderBy: { completedDate: 'desc' } } },
    });
    if (!habit) return res.status(404).json({ message: 'Not found' });
    res.json(habit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateHabit(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.habit.findFirst({
      where: { id: Number(id), userId: Number(req.userId) },
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const data = habitSchema.partial().parse(req.body);
    const habit = await prisma.habit.update({ where: { id: Number(id) }, data });
    res.json(habit);
  } catch (err) {
    if (err?.errors) return res.status(400).json({ message: 'Invalid input', details: err.errors });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteHabit(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.habit.findFirst({
      where: { id: Number(id), userId: Number(req.userId) },
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    await prisma.habit.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
