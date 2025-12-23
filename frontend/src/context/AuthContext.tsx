import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { User } from '../types'

interface AuthContextValue {
	user: User | null
	token: string | null
	login: (username: string, password: string) => Promise<void>
	logout: () => void
	loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const stored = localStorage.getItem('session')
		if (stored) {
			const parsed = JSON.parse(stored)
			setUser(parsed.user)
			setToken(parsed.token)
		}
		setLoading(false)
	}, [])

	const login = async (username: string, password: string) => {
		const result = await api.login(username, password)
		setUser(result.user)
		setToken(result.token)
		localStorage.setItem('session', JSON.stringify(result))
	}

	const logout = () => {
		setUser(null)
		setToken(null)
		localStorage.removeItem('session')
	}

	const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('Auth context missing')
	return ctx
}
