import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useHabits } from '../../context/HabitsContext'
import type { HabitFrequency, HabitInput } from '../../types'

const FREQUENCIES: HabitFrequency[] = ['daily', 'weekly', 'monthly']

export default function HabitModal() {
    const { modalMode, editingHabit, closeModal, createHabit, updateHabit } = useHabits()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [frequency, setFrequency] = useState<HabitFrequency>('daily')
    const [targetDays, setTargetDays] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (modalMode === 'edit' && editingHabit) {
            setTitle(editingHabit.title)
            setDescription(editingHabit.description || '')
            setCategory(editingHabit.category || '')
            setFrequency(editingHabit.frequency)
            setTargetDays(editingHabit.targetDays?.toString() || '')
        } else if (modalMode === 'create') {
            setTitle('')
            setDescription('')
            setCategory('')
            setFrequency('daily')
            setTargetDays('')
        }
        setError(null)
    }, [modalMode, editingHabit])

    if (!modalMode) return null

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!title.trim()) {
            setError('Title is required')
            return
        }

        const input: HabitInput = {
            title: title.trim(),
            description: description.trim() || undefined,
            category: category.trim() || undefined,
            frequency,
            targetDays: targetDays ? Number(targetDays) : undefined,
        }

        setSaving(true)
        setError(null)
        try {
            if (modalMode === 'edit' && editingHabit) {
                await updateHabit(editingHabit.id, input)
            } else {
                await createHabit(input)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save habit')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="dash-modal-overlay" onClick={closeModal}>
            <div className="dash-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="dash-modal-header">
                    <h2>{modalMode === 'edit' ? 'Edit habit' : 'Create habit'}</h2>
                    <button className="dash-icon-btn" type="button" onClick={closeModal} aria-label="Close">×</button>
                </div>

                <form className="dash-form" onSubmit={handleSubmit}>
                    <div className="dash-field">
                        <label htmlFor="habit-title">Title</label>
                        <input
                            id="habit-title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Morning workout"
                            required
                        />
                    </div>

                    <div className="dash-field">
                        <label htmlFor="habit-desc">Description</label>
                        <textarea
                            id="habit-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional details about this habit"
                            rows={3}
                        />
                    </div>

                    <div className="dash-form-row">
                        <div className="dash-field">
                            <label htmlFor="habit-category">Category</label>
                            <input
                                id="habit-category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Health, Study..."
                            />
                        </div>
                        <div className="dash-field">
                            <label htmlFor="habit-frequency">Frequency</label>
                            <select
                                id="habit-frequency"
                                value={frequency}
                                onChange={e => setFrequency(e.target.value as HabitFrequency)}
                            >
                                {FREQUENCIES.map(f => (
                                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="dash-field">
                        <label htmlFor="habit-target">Target days (optional)</label>
                        <input
                            id="habit-target"
                            type="number"
                            min="1"
                            value={targetDays}
                            onChange={e => setTargetDays(e.target.value)}
                            placeholder="e.g. 30"
                        />
                    </div>

                    {error && <div className="dash-error">{error}</div>}

                    <div className="dash-modal-actions">
                        <button className="dashboard-btn dashboard-btn-outline" type="button" onClick={closeModal}>
                            Cancel
                        </button>
                        <button className="dashboard-btn dashboard-btn-primary" type="submit" disabled={saving}>
                            {saving ? 'Saving…' : modalMode === 'edit' ? 'Save changes' : 'Create habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
