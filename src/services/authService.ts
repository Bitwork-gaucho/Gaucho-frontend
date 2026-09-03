import { Session } from '../types'
import { mockApi } from './mockApi'

const STORAGE_KEY = 'gaucho_session'

export const authService = {
  async login(email: string, code: string): Promise<Session> {
    const result = await mockApi.verifyLoginCode(email, code)

    if (!result.success || !result.session) {
      throw new Error(result.error || 'Login failed')
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.session))
    return result.session
  },

  async requestCode(email: string): Promise<void> {
    await mockApi.requestLoginCode(email)
  },

  async logout(): Promise<void> {
    const session = this.getSession()
    if (session) {
      await mockApi.logout(session.email)
    }
    localStorage.removeItem(STORAGE_KEY)
  },

  getSession(): Session | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  },

  isLoggedIn(): boolean {
    return this.getSession() !== null
  }
}
