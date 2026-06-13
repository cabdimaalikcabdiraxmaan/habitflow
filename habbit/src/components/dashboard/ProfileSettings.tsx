import { useEffect, useState, type FormEvent } from 'react'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { ProfileData } from '../../types'

export default function ProfileSettings() {
    const { token, user, updateUser, sessionPassword, updateSessionPassword } = useAuth()
    const [profileData, setProfileData] = useState<ProfileData | null>(null)
    const [name, setName] = useState(user?.name ?? '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [notifications, setNotifications] = useState(true)
    const [passwordChangeEnabled, setPasswordChangeEnabled] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

        const wantsPasswordChange = passwordChangeEnabled && Boolean(currentPassword || newPassword || confirmPassword)
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
            if (wantsPasswordChange) {
                updateSessionPassword(newPassword)
                setPasswordChangeEnabled(false)
                setShowCurrentPassword(false)
                setShowNewPassword(false)
                setShowConfirmPassword(false)
            }
            setMessage(wantsPasswordChange ? 'Profile and password updated successfully' : 'Profile updated successfully')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    function handlePasswordToggle(enabled: boolean) {
        setPasswordChangeEnabled(enabled)
        if (!enabled) {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowCurrentPassword(false)
            setShowNewPassword(false)
            setShowConfirmPassword(false)
        }
    }

    const storedPasswordDisplay = sessionPassword ?? ''
    const currentPasswordValue = passwordChangeEnabled ? currentPassword : storedPasswordDisplay
    const canViewStoredPassword = !passwordChangeEnabled && Boolean(storedPasswordDisplay)

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
                    <div className="account-settings-card-header account-settings-card-header-row">
                        <div>
                            <h3>Security</h3>
                            <p>Change your sign-in password</p>
                        </div>
                        <label className="dash-toggle account-settings-security-toggle" aria-label="Enable password change">
                            <input
                                type="checkbox"
                                checked={passwordChangeEnabled}
                                onChange={e => handlePasswordToggle(e.target.checked)}
                            />
                            <span className="dash-toggle-track" aria-hidden="true" />
                        </label>
                    </div>

                    <div className="account-settings-card-body">
                        <p className="account-settings-hint">
                            {passwordChangeEnabled
                                ? 'Fill in all fields below to update your password.'
                                : canViewStoredPassword
                                    ? 'Your password is hidden. Use the eye icon to view it, or enable the switch to change it.'
                                    : 'Sign in again to view your password, or enable the switch to change it.'}
                        </p>

                        <div className="dash-field">
                            <label htmlFor="profile-current-password">Current password</label>
                            <div className="dash-password-field">
                                <input
                                    id="profile-current-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPasswordValue}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    autoComplete={passwordChangeEnabled ? 'current-password' : 'off'}
                                    placeholder={
                                        passwordChangeEnabled
                                            ? 'Enter current password'
                                            : canViewStoredPassword
                                                ? undefined
                                                : 'Password unavailable until you sign in'
                                    }
                                    readOnly={!passwordChangeEnabled}
                                />
                                <button
                                    className="dash-password-toggle"
                                    type="button"
                                    onClick={() => setShowCurrentPassword(v => !v)}
                                    disabled={!passwordChangeEnabled && !canViewStoredPassword}
                                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                >
                                    {showCurrentPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M10.58 10.58A2 2 0 0012 15a2 2 0 001.42-.58M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-2.08 3.35M6.61 6.61A11.76 11.76 0 003 12.5C4.73 16.39 9 19.5 14 19.5c1.05 0 2.07-.14 3-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M2 12.5C3.73 8.11 8 5 13 5s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S3.73 16.89 2 12.5z" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="13" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {passwordChangeEnabled && (
                            <div className="account-settings-password-grid">
                                <div className="dash-field">
                                    <label htmlFor="profile-new-password">New password</label>
                                    <div className="dash-password-field">
                                        <input
                                            id="profile-new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="At least 6 characters"
                                        />
                                        <button
                                            className="dash-password-toggle"
                                            type="button"
                                            onClick={() => setShowNewPassword(v => !v)}
                                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        >
                                            {showNewPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M10.58 10.58A2 2 0 0012 15a2 2 0 001.42-.58M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-2.08 3.35M6.61 6.61A11.76 11.76 0 003 12.5C4.73 16.39 9 19.5 14 19.5c1.05 0 2.07-.14 3-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M2 12.5C3.73 8.11 8 5 13 5s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S3.73 16.89 2 12.5z" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="13" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="dash-field">
                                    <label htmlFor="profile-confirm-password">Confirm new password</label>
                                    <div className="dash-password-field">
                                        <input
                                            id="profile-confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Re-enter new password"
                                        />
                                        <button
                                            className="dash-password-toggle"
                                            type="button"
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                        >
                                            {showConfirmPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M10.58 10.58A2 2 0 0012 15a2 2 0 001.42-.58M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 01-2.08 3.35M6.61 6.61A11.76 11.76 0 003 12.5C4.73 16.39 9 19.5 14 19.5c1.05 0 2.07-.14 3-.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path d="M2 12.5C3.73 8.11 8 5 13 5s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S3.73 16.89 2 12.5z" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="13" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
