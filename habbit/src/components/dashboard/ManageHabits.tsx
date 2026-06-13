import { Link } from 'react-router-dom'
import { useHabits } from '../../context/HabitsContext'
import HabitModal from './HabitModal'

export default function ManageHabits() {
    const { habits, loading, error, openCreateModal, openEditModal, deleteHabit } = useHabits()

    async function handleDelete(id: number, title: string) {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
        await deleteHabit(id)
    }

    return (
        <>
            <section className="manage-habits-page">
                <Link className="dash-back-link" to="/dashboard">← Back to dashboard</Link>

                <div className="dash-page-hero manage-habits-hero">
                    <div>
                        <span className="dash-page-badge">Manage</span>
                        <h2>Manage habits</h2>
                        <p>Add, edit, or remove your habits in one place.</p>
                    </div>
                    <button
                        className="manage-habits-add-btn"
                        type="button"
                        onClick={openCreateModal}
                        aria-label="Add habit"
                    >
                        +
                    </button>
                </div>

                {loading && <div className="dash-loading">Loading habits…</div>}
                {error && <div className="dash-error">{error}</div>}

                {!loading && !error && !habits.length && (
                    <div className="manage-habits-empty">
                        <p>No habits yet. Click <strong>Add habit</strong> to create your first one.</p>
                    </div>
                )}

                {!loading && habits.length > 0 && (
                    <div className="dash-habit-rows">
                        {habits.map(habit => (
                            <article key={habit.id} className="dash-habit-row manage-habit-row">
                                <div className="dash-habit-row-name">{habit.title}</div>
                                <div className="dash-habit-row-field">{habit.category || '—'}</div>
                                <div className="dash-habit-row-field dash-habit-row-desc">{habit.description || '—'}</div>
                                <div className="dash-habit-row-field dash-habit-row-capitalize">{habit.frequency}</div>
                                <div className="dash-habit-row-field">
                                    {habit.targetDays
                                        ? `${habit._count?.logs ?? habit.logs?.length ?? 0} / ${habit.targetDays} days`
                                        : '—'}
                                </div>
                                <div className="dash-habit-row-action manage-habit-row-actions">
                                    <button className="dash-link-btn" type="button" onClick={() => openEditModal(habit)}>
                                        Edit
                                    </button>
                                    <button
                                        className="dash-link-btn danger"
                                        type="button"
                                        onClick={() => handleDelete(habit.id, habit.title)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <HabitModal />
        </>
    )
}
