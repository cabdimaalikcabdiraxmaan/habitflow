import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  theme: z.enum(['light', 'dark']).optional(),
  notificationEnabled: z.boolean().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
}).refine(
  (data) => Boolean(data.currentPassword) === Boolean(data.newPassword),
  { message: 'Both current and new password are required to change password' }
);

export async function getProfile(req, res) {
  try {
    const userId = Number(req.userId);
    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId } });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = Number(req.userId);
    const data = profileSchema.parse(req.body);
    const { name, currentPassword, newPassword, ...profileData } = data;

    if (currentPassword && newPassword) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) return res.status(404).json({ message: 'User not found' });

      const ok = await bcrypt.compare(currentPassword, existingUser.password);
      if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    }

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId, ...profileData } });
    } else if (Object.keys(profileData).length) {
      profile = await prisma.profile.update({ where: { userId }, data: profileData });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    res.json({ user, profile });
  } catch (err) {
    if (err?.errors) return res.status(400).json({ message: 'Invalid input', details: err.errors });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = Number(req.userId);

    await prisma.$transaction(async (tx) => {
      const habits = await tx.habit.findMany({
        where: { userId },
        select: { id: true },
      });
      const habitIds = habits.map((habit) => habit.id);

      if (habitIds.length) {
        await tx.habitLog.deleteMany({ where: { habitId: { in: habitIds } } });
        await tx.habit.deleteMany({ where: { userId } });
      }

      await tx.profile.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
