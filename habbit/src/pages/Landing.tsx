import { Link } from 'react-router-dom'
import './landing.css'

function HeroIllustration() {
    return (
        <div className="hero-card" aria-hidden="true">
            <div className="hero-card-header">
                <span className="hero-card-label">Today</span>
                <span className="hero-card-streak">🔥 12 day streak</span>
            </div>
            <ul className="hero-habit-list">
                <li className="hero-habit done">
                    <span className="hero-habit-check" />
                    <span>Morning workout</span>
                </li>
                <li className="hero-habit done">
                    <span className="hero-habit-check" />
                    <span>Read 20 pages</span>
                </li>
                <li className="hero-habit">
                    <span className="hero-habit-check" />
                    <span>Drink 8 glasses of water</span>
                </li>
            </ul>
            <div className="hero-card-footer">
                <div className="hero-stat">
                    <strong>78%</strong>
                    <span>Weekly completion</span>
                </div>
                <div className="hero-stat">
                    <strong>5</strong>
                    <span>Active habits</span>
                </div>
            </div>
        </div>
    )
}

export default function Landing() {
    return (
        <div className="landing-page">
            <nav className="topbar">
                <div className="logo">
                    <div className="logo-icon">HF</div>
                    <div className="logo-text">HabitFlow</div>
                </div>
                <div className="topbar-actions">
                    <Link className="btn btn-ghost" to="/login">Login</Link>
                    <Link className="btn btn-primary top-cta" to="/register">Get started</Link>
                </div>
            </nav>

            <main className="landing">
                <section className="hero-left">
                    <p className="hero-badge">Track. Grow. Repeat.</p>
                    <h1 className="hero-title">
                        Build better
                        <span className="hero-title-accent"> routines</span>
                    </h1>
                    <p className="hero-sub">
                        HabitFlow helps you stay consistent with clear daily goals,
                        progress insights, and streaks that keep you motivated.
                    </p>

                    <div className="cta-row">
                        <Link className="btn btn-primary btn-lg" to="/register">Start for free</Link>
                        <Link className="btn btn-outline btn-lg" to="/login">Sign in</Link>
                    </div>

                    <ul className="hero-features">
                        <li>Daily habit tracking</li>
                        <li>Streak insights</li>
                        <li>Secure & private</li>
                    </ul>
                </section>

                <aside className="hero-right">
                    <div className="hero-visual">
                        <div className="hero-glow" />
                        <HeroIllustration />
                    </div>
                </aside>
            </main>
        </div>
    )
}
