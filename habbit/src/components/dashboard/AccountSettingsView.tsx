import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import ProfileSettings from './ProfileSettings'

export default function AccountSettingsView() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            'Delete your HabitFlow account permanently? All habits, progress, and settings will be removed. This cannot be undone.'
        )
        if (!confirmed || !token) return

        setDeleting(true)
        setDeleteError(null)
        try {
            await apiFetch('/api/profile', { method: 'DELETE', token })
            logout()
            navigate('/')
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <section className="account-settings-page">
            <Link className="dash-back-link" to="/dashboard">← Back to dashboard</Link>

            <div className="dash-page-hero account-settings-hero">
                <div>
                    <span className="dash-page-badge">Account</span>
                    <h2>Manage your HabitFlow account</h2>
                    <p>Update your profile, password, and notification preferences.</p>
                </div>
                <button
                    className="dashboard-btn dashboard-btn-danger account-delete-btn"
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                >
                    {deleting ? 'Deleting…' : 'Delete account'}
                </button>
            </div>

            {deleteError && <div className="dash-error account-delete-error">{deleteError}</div>}

            <ProfileSettings />
        </section>
    )
}
