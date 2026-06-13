import { Link } from 'react-router-dom'
import { useHabits } from '../../context/HabitsContext'
import { getTargetProgress, isCompletedOnDate, todayKey } from '../../api/client'

export default function HabitListView() {
    const { habits, loading, error, toggleComplete } = useHabits()
    const today = todayKey()

    if (loading) return <div className="dash-loading">Loading habits…</div>
    if (error) return <div className="dash-error">{error}</div>

    if (!habits.length) {
        return (
            <section className="dashboard-empty">
                <div className="dashboard-empty-icon static" aria-hidden="true">+</div>
                <h2>No habits yet</h2>
                <p>Open your profile menu and choose <strong>Manage habits</strong> to get started.</p>
            </section>
        )
    }

    return (
        <section className="dash-habit-list">
            <div className="dash-section-header">
                <div>
                    <h2>Your habits</h2>
                    <p>{habits.length} active habit{habits.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="dash-habit-rows">
                {habits.map(habit => {
                    const doneToday = isCompletedOnDate(habit, today)
                    const targetProgress = getTargetProgress(habit)
                    return (
                        <article key={habit.id} className={`dash-habit-row ${doneToday ? 'done' : ''}`}>
                            <div className="dash-habit-row-name">
                                <Link to={`/dashboard/habits/${habit.id}`}>{habit.title}</Link>
                            </div>
                            <div className="dash-habit-row-field">{habit.category || '—'}</div>
                            <div className="dash-habit-row-field dash-habit-row-desc">{habit.description || '—'}</div>
                            <div className="dash-habit-row-field dash-habit-row-capitalize">{habit.frequency}</div>
                            <div className="dash-habit-row-field">
                                {targetProgress
                                    ? `${targetProgress.completed} / ${targetProgress.target} days`
                                    : '—'}
                            </div>
                            <div className="dash-habit-row-action">
                                <Link className="dash-link-btn" to={`/dashboard/habits/${habit.id}`}>
                                    View details
                                </Link>
                            </div>
                            <div className="dash-habit-row-check">
                                <button
                                    className={`dash-check-btn ${doneToday ? 'checked' : ''}`}
                                    type="button"
                                    disabled={doneToday}
                                    onClick={() => !doneToday && toggleComplete(habit.id)}
                                    aria-label={doneToday ? 'Completed for today' : 'Mark complete for today'}
                                >
                                    {doneToday ? '✓' : ''}
                                </button>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
