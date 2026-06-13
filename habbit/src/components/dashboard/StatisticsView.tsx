import { useEffect, useState, type CSSProperties } from 'react'
import { apiFetch, formatDate } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Stats } from '../../types'

const STAT_ITEMS = [
    { key: 'totalHabits', label: 'Active habits', icon: '📋', accent: 'blue' },
    { key: 'completedToday', label: 'Completed today', icon: '✓', accent: 'green' },
    { key: 'longestStreak', label: 'Day streak', icon: '🔥', accent: 'orange' },
    { key: 'weeklyCompletion', label: 'Weekly rate', icon: '📈', accent: 'purple', suffix: '%' },
] as const

export default function StatisticsView() {
    const { token } = useAuth()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        setLoading(true)
        apiFetch<Stats>('/api/stats', { token })
            .then(setStats)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load stats'))
            .finally(() => setLoading(false))
    }, [token])

    if (loading) return <div className="dash-loading stats-loading">Loading statistics…</div>
    if (error) return <div className="dash-error">{error}</div>
    if (!stats) return null

    const completionRate = stats.totalHabits
        ? Math.round((stats.completedToday / stats.totalHabits) * 100)
        : 0

    function getStatValue(key: typeof STAT_ITEMS[number]['key']) {
        const value = stats![key]
        const item = STAT_ITEMS.find(i => i.key === key)!
        const suffix = 'suffix' in item ? item.suffix : ''
        return `${value}${suffix}`
    }

    return (
        <section className="dash-stats-page">
            <div className="dash-page-hero stats-hero">
                <div className="dash-page-hero-copy">
                    <span className="dash-page-badge">Statistics</span>
                    <h2>Your progress at a glance</h2>
                    <p>See how consistently you&apos;re building better routines.</p>
                </div>
                <div className="stats-hero-summary">
                    <div className="stats-ring-card">
                        <div
                            className="stats-ring"
                            style={{ '--progress': `${completionRate}%` } as CSSProperties}
                        >
                            <div className="stats-ring-inner">
                                <strong>{completionRate}%</strong>
                                <span>Today</span>
                            </div>
                        </div>
                        <p>
                            {stats.completedToday} of {stats.totalHabits || 0} habit{stats.totalHabits !== 1 ? 's' : ''} done
                        </p>
                    </div>
                    <div className="stats-hero-weekly">
                        <strong>{stats.weeklyCompletion}%</strong>
                        <span>Weekly completion</span>
                    </div>
                </div>
            </div>

            <div className="stats-cards-row">
                {STAT_ITEMS.map(item => (
                    <div key={item.key} className={`stats-metric-card accent-${item.accent}`}>
                        <span className="stats-metric-icon">{item.icon}</span>
                        <div>
                            <strong>{getStatValue(item.key)}</strong>
                            <span>{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dash-stats-grid">
                <div className="dash-panel stats-panel">
                    <div className="stats-panel-head">
                        <h3>Today&apos;s progress</h3>
                        <span className="stats-panel-badge">{completionRate}% complete</span>
                    </div>
                    <div className="stats-today-bar">
                        <div className="stats-today-fill" style={{ width: `${completionRate}%` }} />
                    </div>
                    <p className="stats-panel-note">
                        {stats.completedToday === stats.totalHabits && stats.totalHabits > 0
                            ? 'Amazing — all habits completed today!'
                            : stats.totalHabits
                                ? `${stats.totalHabits - stats.completedToday} habit${stats.totalHabits - stats.completedToday !== 1 ? 's' : ''} left for today`
                                : 'Create habits to start tracking daily progress.'}
                    </p>

                    <h3 className="stats-subheading">By category</h3>
                    {!stats.byCategory.length ? (
                        <div className="stats-empty-block">
                            <span>🏷️</span>
                            <p>No categories yet. Add categories when creating habits.</p>
                        </div>
                    ) : (
                        <ul className="dash-category-list">
                            {stats.byCategory.map(cat => {
                                const pct = cat.count ? Math.round((cat.completed / cat.count) * 100) : 0
                                return (
                                    <li key={cat.category} className="stats-category-item">
                                        <div className="dash-category-row">
                                            <span className="stats-category-name">{cat.category}</span>
                                            <span className="stats-category-value">{cat.completed}/{cat.count} today</span>
                                        </div>
                                        <div className="dash-progress-bar">
                                            <div className="dash-progress-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

                <div className="dash-panel stats-panel">
                    <div className="stats-panel-head">
                        <h3>Recent activity</h3>
                        <span className="stats-panel-badge muted">{stats.recentActivity.length} entries</span>
                    </div>

                    {!stats.recentActivity.length ? (
                        <div className="stats-empty-block">
                            <span>📅</span>
                            <p>Complete habits to see your activity timeline here.</p>
                        </div>
                    ) : (
                        <ul className="stats-activity-list">
                            {stats.recentActivity.map(log => (
                                <li key={log.id} className="stats-activity-item">
                                    <div className="stats-activity-icon">✓</div>
                                    <div className="stats-activity-body">
                                        <strong>{log.habitTitle}</strong>
                                        <span>{formatDate(log.completedDate)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    )
}
