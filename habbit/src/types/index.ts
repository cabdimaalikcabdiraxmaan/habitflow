export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export type HabitLog = {
    id: number
    completedDate: string
    createdAt: string
    habitId: number
}

export type Habit = {
    id: number
    title: string
    description: string | null
    category: string | null
    frequency: HabitFrequency
    targetDays: number | null
    createdAt: string
    updatedAt: string
    userId: number
    logs?: HabitLog[]
    _count?: { logs: number }
}

export type HabitInput = {
    title: string
    description?: string
    category?: string
    frequency: HabitFrequency
    targetDays?: number
}

export type CalendarLog = HabitLog & {
    habit: { id: number; title: string; category: string | null }
}

export type Stats = {
    totalHabits: number
    completedToday: number
    longestStreak: number
    weeklyCompletion: number
    byCategory: { category: string; count: number; completed: number }[]
    recentActivity: (HabitLog & { habitTitle: string; habitId: number })[]
}

export type Profile = {
    id: number
    avatarUrl: string | null
    theme: string
    notificationEnabled: boolean
    userId: number
}

export type ProfileData = {
    user: { id: number; name: string; email: string }
    profile: Profile
}
