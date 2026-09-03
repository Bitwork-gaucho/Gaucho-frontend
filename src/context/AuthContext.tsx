import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  session: Session | null
  loading: boolean
  login: (email: string, code: string) => Promise<void>
  requestCode: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load session from storage on mount
    const storedSession = authService.getSession()
    setSession(storedSession)
    setLoading(false)
  }, [])

  const login = async (email: string, code: string) => {
    const session = await authService.login(email, code)
    setSession(session)
  }

  const requestCode = async (email: string) => {
    await authService.requestCode(email)
  }

  const logout = async () => {
    await authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, requestCode, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
