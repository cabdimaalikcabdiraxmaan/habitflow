import { useEffect, useMemo, useState } from 'react'
import { apiFetch, formatDate, todayKey } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { CalendarLog } from '../../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView() {
    const { token } = useAuth()
    const now = new Date()
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [logs, setLogs] = useState<CalendarLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<string | null>(todayKey())

    useEffect(() => {
        if (!token) return
        setLoading(true)
        apiFetch<CalendarLog[]>(`/api/habits/logs/calendar?year=${year}&month=${month}`, { token })
            .then(setLogs)
            .finally(() => setLoading(false))
    }, [token, year, month])

    const logsByDate = useMemo(() => {
        const map: Record<string, CalendarLog[]> = {}
        for (const log of logs) {
            const key = log.completedDate.slice(0, 10)
            if (!map[key]) map[key] = []
            map[key].push(log)
        }
        return map
    }, [logs])

    const days = useMemo(() => {
        const first = new Date(year, month - 1, 1)
        const last = new Date(year, month, 0)
        const cells: (number | null)[] = []
        for (let i = 0; i < first.getDay(); i++) cells.push(null)
        for (let d = 1; d <= last.getDate(); d++) cells.push(d)
        return cells
    }, [year, month])

    const monthStats = useMemo(() => {
        const activeDays = Object.keys(logsByDate).length
        const totalCompletions = logs.length
        const bestDay = Object.entries(logsByDate).reduce(
            (best, [date, dayLogs]) => (dayLogs.length > best.count ? { date, count: dayLogs.length } : best),
            { date: '', count: 0 },
        )
        return { activeDays, totalCompletions, bestDay }
    }, [logs, logsByDate])

    const selectedLogs = selectedDate ? logsByDate[selectedDate] || [] : []

    function prevMonth() {
        if (month === 1) { setYear(y => y - 1); setMonth(12) }
        else setMonth(m => m - 1)
    }

    function nextMonth() {
        if (month === 12) { setYear(y => y + 1); setMonth(1) }
        else setMonth(m => m + 1)
    }

    function goToToday() {
        const today = new Date()
        setYear(today.getFullYear())
        setMonth(today.getMonth() + 1)
        setSelectedDate(todayKey())
    }

    const monthLabel = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    const today = todayKey()

    function dateKey(day: number) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    function intensityClass(count: number) {
        if (count >= 4) return 'level-4'
        if (count >= 3) return 'level-3'
        if (count >= 2) return 'level-2'
        if (count >= 1) return 'level-1'
        return ''
    }

    return (
        <section className="dash-calendar">
            <div className="dash-page-hero cal-hero">
                <div className="dash-page-hero-copy">
                    <span className="dash-page-badge">Calendar</span>
                    <h2>Your habit timeline</h2>
                    <p>Track completions day by day and spot your consistency patterns.</p>
                </div>
                <div className="cal-hero-controls">
                    <div className="cal-month-picker">
                        <button className="cal-nav-btn" type="button" onClick={prevMonth} aria-label="Previous month">‹</button>
                        <div className="cal-month-label">
                            <strong>{monthLabel}</strong>
                            <button className="cal-today-btn" type="button" onClick={goToToday}>Today</button>
                        </div>
                        <button className="cal-nav-btn" type="button" onClick={nextMonth} aria-label="Next month">›</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="dash-loading cal-loading">Loading calendar…</div>
            ) : (
                <>
                    <div className="cal-summary-row">
                        <div className="cal-summary-card">
                            <span>Total completions</span>
                            <strong>{monthStats.totalCompletions}</strong>
                        </div>
                        <div className="cal-summary-card">
                            <span>Active days</span>
                            <strong>{monthStats.activeDays}</strong>
                        </div>
                        <div className="cal-summary-card">
                            <span>Best day</span>
                            <strong>
                                {monthStats.bestDay.count
                                    ? `${monthStats.bestDay.count} habit${monthStats.bestDay.count !== 1 ? 's' : ''}`
                                    : '—'}
                            </strong>
                        </div>
                    </div>

                    <div className="cal-layout">
                        <div className="cal-grid-panel">
                            <div className="dash-calendar-grid">
                                {WEEKDAYS.map(d => (
                                    <div key={d} className="dash-calendar-weekday">{d}</div>
                                ))}
                                {days.map((day, i) => {
                                    if (!day) return <div key={`empty-${i}`} className="dash-calendar-cell empty" />
                                    const key = dateKey(day)
                                    const dayLogs = logsByDate[key] || []
                                    const isToday = key === today
                                    const isSelected = key === selectedDate
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`dash-calendar-cell ${dayLogs.length ? 'has-logs' : ''} ${intensityClass(dayLogs.length)} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setSelectedDate(key)}
                                        >
                                            <span className="dash-calendar-day">{day}</span>
                                            {dayLogs.length > 0 && (
                                                <span className="dash-calendar-dots" aria-hidden="true">
                                                    {dayLogs.slice(0, 3).map((_, idx) => (
                                                        <span key={idx} className="dash-calendar-dot" />
                                                    ))}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="cal-legend-row">
                                <span>Less</span>
                                <div className="cal-legend-scale">
                                    <span className="level-0" />
                                    <span className="level-1" />
                                    <span className="level-2" />
                                    <span className="level-3" />
                                    <span className="level-4" />
                                </div>
                                <span>More</span>
                            </div>
                        </div>

                        <aside className="cal-detail-panel">
                            <div className="cal-detail-header">
                                <h3>{selectedDate ? formatDate(selectedDate) : 'Select a day'}</h3>
                                <span className="cal-detail-count">
                                    {selectedLogs.length} completion{selectedLogs.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {!selectedDate ? (
                                <p className="dash-muted">Click a day on the calendar to see details.</p>
                            ) : !selectedLogs.length ? (
                                <div className="cal-empty-day">
                                    <div className="cal-empty-icon">○</div>
                                    <p>No habits completed on this day.</p>
                                </div>
                            ) : (
                                <ul className="cal-activity-list">
                                    {selectedLogs.map(log => (
                                        <li key={log.id} className="cal-activity-item">
                                            <span className="cal-activity-check">✓</span>
                                            <div>
                                                <strong>{log.habit.title}</strong>
                                                {log.habit.category && (
                                                    <span className="dash-tag">{log.habit.category}</span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {logs.length > 0 && (
                                <div className="cal-recent-block">
                                    <h4>Recent this month</h4>
                                    <ul className="cal-recent-list">
                                        {logs.slice().reverse().slice(0, 5).map(log => (
                                            <li key={log.id}>
                                                <button
                                                    type="button"
                                                    className="cal-recent-item"
                                                    onClick={() => setSelectedDate(log.completedDate.slice(0, 10))}
                                                >
                                                    <span>{formatDate(log.completedDate)}</span>
                                                    <span>{log.habit.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    </div>
                </>
            )}
        </section>
    )
}
