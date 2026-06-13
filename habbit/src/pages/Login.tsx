import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './auth.css'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed'
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
                        <h1>Welcome back</h1>
                        <p>Sign in to continue your habit journey.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && <div className="auth-error" role="alert">{error}</div>}

                        <button className="auth-btn auth-btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth-foot">
                        Don&apos;t have an account? <Link to="/register">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
