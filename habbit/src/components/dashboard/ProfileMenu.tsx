import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
    { to: '/dashboard', label: 'Habits', icon: '✓', end: true },
    { to: '/dashboard/calendar', label: 'Calendar', icon: '📅' },
    { to: '/dashboard/statistics', label: 'Statistics', icon: '📈' },
    { to: '/dashboard/manage-habits', label: 'Manage habits', icon: '☰' },
]

export default function ProfileMenu() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const profileInitial = (user?.name || '?').charAt(0).toUpperCase()
    const firstName = user?.name?.split(' ')[0] || 'there'

    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [open])

    function handleLogout() {
        setOpen(false)
        logout()
        navigate('/login')
    }

    function openAccount() {
        setOpen(false)
        navigate('/dashboard/account')
    }

    function closeMenu() {
        setOpen(false)
    }

    return (
        <div className="profile-menu" ref={menuRef}>
            <button
                type="button"
                className={`dashboard-profile-btn ${open ? 'open' : ''}`}
                onClick={() => setOpen(v => !v)}
                aria-label="Account menu"
                aria-expanded={open}
                aria-haspopup="true"
            >
                <span className="dashboard-profile-avatar">{profileInitial}</span>
            </button>

            {open && (
                <div className="profile-menu-panel" role="menu">
                    <button
                        type="button"
                        className="profile-menu-close"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        ×
                    </button>

                    <p className="profile-menu-email">{user?.email}</p>

                    <div className="profile-menu-hero">
                        <div className="profile-menu-avatar-lg">{profileInitial}</div>
                        <p className="profile-menu-greeting">Hi, {firstName}!</p>
                        <button type="button" className="profile-menu-manage" onClick={openAccount}>
                            Manage your HabitFlow account
                        </button>
                    </div>

                    <div className="profile-menu-section">
                        {NAV.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `profile-menu-item ${isActive ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="profile-menu-item-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <button type="button" className="profile-menu-item" onClick={handleLogout}>
                            <span className="profile-menu-item-icon">↪</span>
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
