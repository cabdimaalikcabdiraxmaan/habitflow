import { createContext } from 'react'

export type AuthUser = { id: number; name: string; email: string } | null

export type AuthContextValue = {
    user: AuthUser
    token: string | null
    sessionPassword: string | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    updateUser: (user: AuthUser) => void
    updateSessionPassword: (password: string) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
