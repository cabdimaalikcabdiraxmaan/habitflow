import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './auth.css'

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    function validate() {
        if (!name.trim() || !email.trim() || !password) return 'All fields are required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
        if (password.length < 6) return 'Password must be at least 6 characters'
        if (password !== confirm) return 'Passwords do not match'
        return null
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const v = validate()
        if (v) {
            setError(v)
            return
        }
        setError(null)
        setLoading(true)
        try {
            await register(name, email, password)
            navigate('/dashboard')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <header className="auth-header">
                <Link className="auth-logo" to="/">
                    <span className="auth-logo-icon">HF</span>
                    <span className="auth-logo-text">HabitFlow</span>
                </Link>
            </header>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-card-top">
                        <h1>Create your account</h1>
                        <p>Start building better habits in minutes.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="confirm">Confirm password</label>
                            <input
                                id="confirm"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {error && <div className="auth-error" role="alert">{error}</div>}

                        <button className="auth-btn auth-btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-foot">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
