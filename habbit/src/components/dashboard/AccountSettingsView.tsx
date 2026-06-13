import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import ProfileSettings from './ProfileSettings'

export default function AccountSettingsView() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    async function confirmDeleteAccount() {
        if (!token) return

        setDeleting(true)
        setDeleteError(null)
        try {
            await apiFetch('/api/profile', { method: 'DELETE', token })
            setShowDeleteModal(false)
            logout()
            navigate('/')
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
            setShowDeleteModal(false)
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
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                >
                    {deleting ? 'Deleting…' : 'Delete account'}
                </button>
            </div>

            {deleteError && <div className="dash-error account-delete-error">{deleteError}</div>}

            {showDeleteModal && (
                <div
                    className="dash-modal-overlay"
                    onClick={() => !deleting && setShowDeleteModal(false)}
                    role="presentation"
                >
                    <div
                        className="dash-modal account-delete-modal"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                    >
                        <div className="dash-modal-header">
                            <h2 id="delete-account-title">Delete account?</h2>
                            <button
                                className="dash-icon-btn"
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <p className="account-delete-modal-text">
                            This will permanently remove your HabitFlow account, including all habits,
                            progress, and settings. This action cannot be undone.
                        </p>

                        <div className="dash-modal-actions">
                            <button
                                className="dashboard-btn dashboard-btn-outline"
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="dashboard-btn dashboard-btn-danger"
                                type="button"
                                onClick={confirmDeleteAccount}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting…' : 'Delete account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProfileSettings />
        </section>
    )
}
