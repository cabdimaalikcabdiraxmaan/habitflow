import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    computeStreak,
    formatDate,
    getCompletionCount,
    getLogDateKeys,
    getTargetProgress,
    isCompletedOnDate,
    todayKey,
} from '../../api/client'
import { useHabits } from '../../context/HabitsContext'
import type { Habit } from '../../types'

export default function HabitDetailsView() {
    const { id } = useParams()
    const { getHabit, toggleComplete } = useHabits()
    const [habit, setHabit] = useState<Habit | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const today = todayKey()

    useEffect(() => {
        if (!id) return
        setLoading(true)
        getHabit(Number(id))
            .then(setHabit)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load habit'))
            .finally(() => setLoading(false))
    }, [id, getHabit])

    async function handleToggle() {
        if (!habit || isCompletedOnDate(habit, today)) return
        await toggleComplete(habit.id)
        const updated = await getHabit(habit.id)
        setHabit(updated)
    }

    if (loading) return <div className="dash-loading">Loading habit…</div>
    if (error || !habit) return <div className="dash-error">{error || 'Habit not found'}</div>

    const doneToday = isCompletedOnDate(habit, today)
    const streak = computeStreak(getLogDateKeys(habit))
    const completionCount = getCompletionCount(habit)
    const targetProgress = getTargetProgress(habit)

    return (
        <section className="dash-details">
            <Link className="dash-back-link" to="/dashboard">← Back to habits</Link>

            <div className="dash-details-header">
                <div>
                    {habit.category && <span className="dash-tag">{habit.category}</span>}
                    <h1>{habit.title}</h1>
                    {habit.description && <p className="dash-details-desc">{habit.description}</p>}
                </div>
                <button
                    className={`dash-check-btn large ${doneToday ? 'checked' : ''}`}
                    type="button"
                    disabled={doneToday}
                    onClick={handleToggle}
                >
                    {doneToday ? '✓ Done today' : 'Mark done today'}
                </button>
            </div>

            <div className="dash-details-grid">
                <div className="dash-info-card">
                    <span>Current streak</span>
                    <strong>{streak} day{streak !== 1 ? 's' : ''}</strong>
                </div>
                <div className="dash-info-card">
                    <span>Frequency</span>
                    <strong>{habit.frequency}</strong>
                </div>
                <div className="dash-info-card">
                    <span>Target progress</span>
                    <strong>
                        {targetProgress
                            ? `${targetProgress.completed} / ${targetProgress.target} days`
                            : '—'}
                    </strong>
                </div>
                <div className="dash-info-card">
                    <span>Total completions</span>
                    <strong>{completionCount}</strong>
                </div>
            </div>

            {targetProgress && (
                <div className="dash-panel dash-target-progress">
                    <div className="dash-target-progress-head">
                        <strong>Goal progress</strong>
                        <span>{targetProgress.percent}%</span>
                    </div>
                    <div className="dash-progress-bar">
                        <div
                            className="dash-progress-fill"
                            style={{ width: `${targetProgress.percent}%` }}
                        />
                    </div>
                    <p className="dash-muted">
                        {targetProgress.completed >= targetProgress.target
                            ? 'Target reached — great work!'
                            : `${targetProgress.target - targetProgress.completed} more completion${targetProgress.target - targetProgress.completed !== 1 ? 's' : ''} to hit your goal.`}
                    </p>
                </div>
            )}

            <div className="dash-log-section">
                <h2>Recent activity</h2>
                {!habit.logs?.length ? (
                    <p className="dash-muted">No completions yet. Mark this habit done to start your streak.</p>
                ) : (
                    <ul className="dash-log-list">
                        {habit.logs.map(log => (
                            <li key={log.id}>
                                <span className="dash-log-dot" />
                                Completed on {formatDate(log.completedDate)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
