import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiFetch, todayKey } from '../api/client'
import { useAuth } from './AuthContext'
import type { Habit, HabitInput } from '../types'

type HabitModalMode = 'create' | 'edit' | null

type HabitsContextValue = {
    habits: Habit[]
    loading: boolean
    error: string | null
    modalMode: HabitModalMode
    editingHabit: Habit | null
    refreshHabits: () => Promise<void>
    openCreateModal: () => void
    openEditModal: (habit: Habit) => void
    closeModal: () => void
    createHabit: (input: HabitInput) => Promise<void>
    updateHabit: (id: number, input: Partial<HabitInput>) => Promise<void>
    deleteHabit: (id: number) => Promise<void>
    toggleComplete: (id: number, date?: string) => Promise<void>
    getHabit: (id: number) => Promise<Habit>
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined)

export function HabitsProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth()
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalMode, setModalMode] = useState<HabitModalMode>(null)
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

    const refreshHabits = useCallback(async () => {
        if (!token) return
        setLoading(true)
        setError(null)
        try {
            const data = await apiFetch<Habit[]>('/api/habits', { token })
            setHabits(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habits')
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        refreshHabits()
    }, [refreshHabits])

    function openCreateModal() {
        setEditingHabit(null)
        setModalMode('create')
    }

    function openEditModal(habit: Habit) {
        setEditingHabit(habit)
        setModalMode('edit')
    }

    function closeModal() {
        setModalMode(null)
        setEditingHabit(null)
    }

    async function createHabit(input: HabitInput) {
        await apiFetch<Habit>('/api/habits', {
            method: 'POST',
            token,
            body: JSON.stringify(input),
        })
        closeModal()
        await refreshHabits()
    }

    async function updateHabit(id: number, input: Partial<HabitInput>) {
        await apiFetch<Habit>(`/api/habits/${id}`, {
            method: 'PUT',
            token,
            body: JSON.stringify(input),
        })
        closeModal()
        await refreshHabits()
    }

    async function deleteHabit(id: number) {
        await apiFetch(`/api/habits/${id}`, { method: 'DELETE', token })
        await refreshHabits()
    }

    async function toggleComplete(id: number, date = todayKey()) {
        await apiFetch(`/api/habits/${id}/logs`, {
            method: 'POST',
            token,
            body: JSON.stringify({ date }),
        })
        await refreshHabits()
    }

    async function getHabit(id: number) {
        return apiFetch<Habit>(`/api/habits/${id}`, { token })
    }

    return (
        <HabitsContext.Provider
            value={{
                habits,
                loading,
                error,
                modalMode,
                editingHabit,
                refreshHabits,
                openCreateModal,
                openEditModal,
                closeModal,
                createHabit,
                updateHabit,
                deleteHabit,
                toggleComplete,
                getHabit,
            }}
        >
            {children}
        </HabitsContext.Provider>
    )
}

export function useHabits() {
    const ctx = useContext(HabitsContext)
    if (!ctx) throw new Error('useHabits must be used within HabitsProvider')
    return ctx
}
