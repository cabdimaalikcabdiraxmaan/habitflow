const API = import.meta.env.VITE_API_URL || 'http://localhost:7001'

type ApiOptions = RequestInit & { token?: string | null }

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options
    const res = await fetch(`${API}${path}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(headers as Record<string, string> | undefined),
        },
    })

    if (res.status === 204) return undefined as T

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.message || 'Request failed')
    return data as T
}

export function localDateKey(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function todayKey() {
    return localDateKey()
}

export function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function isCompletedOnDate(habit: { logs?: { completedDate: string }[] }, date: string) {
    return habit.logs?.some(l => l.completedDate.slice(0, 10) === date) ?? false
}

export function getLogDateKeys(habit: { logs?: { completedDate: string }[] }) {
    return habit.logs?.map(l => l.completedDate.slice(0, 10)) ?? []
}

export function getCompletionCount(habit: { logs?: { completedDate: string }[]; _count?: { logs: number } }) {
    return habit._count?.logs ?? habit.logs?.length ?? 0
}

export function computeStreak(logDateKeys: string[]) {
    if (!logDateKeys.length) return 0

    const dates = new Set(logDateKeys)
    let streak = 0
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)

    while (dates.has(localDateKey(cursor))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
    }

    return streak
}

export function getTargetProgress(habit: { targetDays?: number | null; logs?: { completedDate: string }[]; _count?: { logs: number } }) {
    if (!habit.targetDays) return null
    const completed = getCompletionCount(habit)
    const percent = Math.min(100, Math.round((completed / habit.targetDays) * 100))
    return { completed, target: habit.targetDays, percent }
}
