import React, { useContext, useEffect, useState } from 'react'
import { AuthContext, type AuthUser } from './auth-context'

const API = import.meta.env.VITE_API_URL || 'http://localhost:7001'
const SESSION_PASSWORD_KEY = 'habitflow_session_password'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null)
    const [token, setToken] = useState<string | null>(null)
    const [sessionPassword, setSessionPassword] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = localStorage.getItem('token')
        const u = localStorage.getItem('user')
        const savedPassword = sessionStorage.getItem(SESSION_PASSWORD_KEY)
        if (t) setToken(t)
        if (u) {
            try {
                setUser(JSON.parse(u))
            } catch {
                localStorage.removeItem('user')
            }
        }
        if (savedPassword) setSessionPassword(savedPassword)
        setLoading(false)
    }, [])

    function updateSessionPassword(password: string) {
        setSessionPassword(password)
        sessionStorage.setItem(SESSION_PASSWORD_KEY, password)
    }

    async function login(email: string, password: string) {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Login failed')
        setToken(data.token)
        setUser(data.user)
        updateSessionPassword(password)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
    }

    async function register(name: string, email: string, password: string) {
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Registration failed')
    }

    function logout() {
        setUser(null)
        setToken(null)
        setSessionPassword(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem(SESSION_PASSWORD_KEY)
    }

    function updateUser(nextUser: AuthUser) {
        setUser(nextUser)
        if (nextUser) {
            localStorage.setItem('user', JSON.stringify(nextUser))
        } else {
            localStorage.removeItem('user')
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, sessionPassword, loading, login, register, logout, updateUser, updateSessionPassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default AuthContext
