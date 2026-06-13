import React, { createContext, useContext, useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:7001'

type User = { id: number; name: string; email: string } | null

type AuthContextValue = {
    user: User
    token: string | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = localStorage.getItem('token')
        const u = localStorage.getItem('user')
        if (t) setToken(t)
        if (u) setUser(JSON.parse(u))
        setLoading(false)
    }, [])

    async function login(email: string, password: string) {
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'Login failed')
            setToken(data.token)
            setUser(data.user)
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } finally {
            setLoading(false)
        }
    }

    async function register(name: string, email: string, password: string) {
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'Registration failed')
            setToken(data.token)
            setUser(data.user)
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } finally {
            setLoading(false)
        }
    }

    function logout() {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    function updateUser(nextUser: User) {
        setUser(nextUser)
        localStorage.setItem('user', JSON.stringify(nextUser))
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
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
