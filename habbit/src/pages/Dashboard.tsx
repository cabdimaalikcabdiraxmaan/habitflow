import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { HabitsProvider } from '../context/HabitsContext'
import ProfileMenu from '../components/dashboard/ProfileMenu'
import type { Stats } from '../types'
import './dashboard.css'

export default function Dashboard() {
    const { user, token } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [stats, setStats] = useState<Stats | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const isHome = location.pathname === '/dashboard'

    useEffect(() => {
        if (!token) return
        apiFetch<Stats>('/api/stats', { token }).then(setStats).catch(() => setStats(null))
    }, [token, location.pathname, refreshKey])

    function handleLogoRefresh() {
        if (location.pathname !== '/dashboard') {
            navigate('/dashboard')
        }
        setRefreshKey(key => key + 1)
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-global-bar">
                <button
                    type="button"
                    className="dashboard-logo"
                    onClick={handleLogoRefresh}
                    aria-label="Refresh dashboard"
                >
                    <span className="dashboard-logo-icon">HF</span>
                    <span className="dashboard-logo-text">HabitFlow</span>
                </button>
                <ProfileMenu />
            </header>

            <div className="dashboard-body">
                <div className="dashboard-shell">
                    <header className="dashboard-topbar">
                        <div className="dashboard-topbar-text">
                            <h1>{isHome ? 'Your dashboard' : ''}</h1>
                            {isHome && (
                                <p>Welcome back, {user?.name?.split(' ')[0] || 'there'}. Keep your streak going.</p>
                            )}
                        </div>
                    </header>

                    {isHome && stats && (
                        <section className="dashboard-stats">
                            <div className="dashboard-stat-card">
                                <strong>{stats.totalHabits}</strong>
                                <span>Active habits</span>
                            </div>
                            <div className="dashboard-stat-card">
                                <strong>{stats.completedToday}</strong>
                                <span>Completed today</span>
                            </div>
                            <div className="dashboard-stat-card">
                                <strong>{stats.longestStreak}</strong>
                                <span>Day streak</span>
                            </div>
                        </section>
                    )}

                    <main className="dashboard-main">
                        <HabitsProvider key={refreshKey}>
                            <Outlet />
                        </HabitsProvider>
                    </main>
                </div>
            </div>
        </div>
    )
}
