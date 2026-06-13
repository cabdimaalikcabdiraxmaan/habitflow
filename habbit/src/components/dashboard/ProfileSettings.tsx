import { useEffect, useState, type FormEvent } from 'react'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { ProfileData } from '../../types'

export default function ProfileSettings() {
    const { token, user, updateUser } = useAuth()
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [name, setName] = useState(user?.name ?? '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [notifications, setNotifications] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user?.name) {
            setName(prev => prev || user.name)
        }
    }, [user?.name])

    useEffect(() => {
        if (!token) return
        apiFetch<ProfileData>('/api/profile', { token })
            .then(data => {
                setProfileData(data)
                setName(data.user.name?.trim() || user?.name || '')
                setNotifications(data.profile.notificationEnabled)
            })
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load profile'))
            .finally(() => setLoading(false))
    }, [token, user?.name])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!token) return

        const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword)
        if (wantsPasswordChange) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                setError('Fill in all password fields to change your password')
                return
            }
            if (newPassword.length < 6) {
                setError('New password must be at least 6 characters')
                return
            }
            if (newPassword !== confirmPassword) {
                setError('New passwords do not match')
                return
            }
        }

        setSaving(true)
        setError(null)
        setMessage(null)
        try {
            const payload: Record<string, unknown> = {
                name: name.trim(),
                notificationEnabled: notifications,
            }
            if (wantsPasswordChange) {
                payload.currentPassword = currentPassword
                payload.newPassword = newPassword
            }

            const data = await apiFetch<ProfileData>('/api/profile', {
                method: 'PUT',
                token,
                body: JSON.stringify(payload),
            })
            setProfileData(data)
            updateUser(data.user)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setMessage(wantsPasswordChange ? 'Profile and password updated successfully' : 'Profile updated successfully')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading && !name) return <div className="dash-loading account-settings-loading">Loading profile…</div>

    const displayName = profileData?.user.name || user?.name || 'User'
    const displayEmail = profileData?.user.email || user?.email || ''

    return (
        <form className="account-settings-form" onSubmit={handleSubmit}>
            <div className="account-settings-grid">
                <section className="account-settings-card">
                    <div className="account-settings-card-header">
                        <h3>Profile</h3>
                        <p>How you appear across HabitFlow</p>
                    </div>

                    <div className="account-settings-identity">
                        <div className="dash-avatar-circle account-settings-avatar">
                            {(name || displayName).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{displayName}</strong>
                            <p className="dash-muted">{displayEmail}</p>
                        </div>
                    </div>

                    <div className="account-settings-card-body">
                        <div className="dash-field">
                            <label htmlFor="profile-name">Display name</label>
                            <input
                                id="profile-name"
                                name="displayName"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                                placeholder={displayName}
                                required
                            />
                        </div>

                        <div className="account-settings-preference">
                            <div>
                                <strong>Habit reminders</strong>
                                <p className="dash-muted">Get notified to stay on track with your goals.</p>
                            </div>
                            <label className="dash-toggle" aria-label="Enable habit reminders">
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={e => setNotifications(e.target.checked)}
                                />
                                <span className="dash-toggle-track" aria-hidden="true" />
                            </label>
                        </div>
                    </div>
                </section>

                <section className="account-settings-card">
                    <div className="account-settings-card-header">
                        <h3>Security</h3>
                        <p>Change your sign-in password</p>
                    </div>

                    <div className="account-settings-card-body">
                        <p className="account-settings-hint">Leave these blank to keep your current password.</p>

                        <div className="dash-field">
                            <label htmlFor="profile-current-password">Current password</label>
                            <input
                                id="profile-current-password"
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="account-settings-password-grid">
                            <div className="dash-field">
                                <label htmlFor="profile-new-password">New password</label>
                                <input
                                    id="profile-new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <div className="dash-field">
                                <label htmlFor="profile-confirm-password">Confirm new password</label>
                                <input
                                    id="profile-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="account-settings-form-footer">
                <div className="account-settings-form-messages">
                    {error && <div className="dash-error">{error}</div>}
                    {message && <div className="dash-success">{message}</div>}
                    {!error && !message && (
                        <p className="dash-muted">Changes apply after you save.</p>
                    )}
                </div>
                <button className="dashboard-btn dashboard-btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </form>
    )
}
