const delay = (ms) => new Promise(r => setTimeout(r, ms))

const SESSION_KEY = 'gaucho_session'

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export const authService = {
  async requestLoginCode(email) {
    await delay(600)
    console.log(`[mock] login code sent to: ${email} — use 123456`)
    return { success: true }
  },

  async verifyLoginCode(email, code) {
    await delay(800)
    if (code === '123456') {
      const session = {
        userId: `user-${email.split('@')[0]}`,
        email,
        role: email.includes('admin') ? 'admin' : 'customer',
      }
      storeSession(session)
      return { success: true, session }
    }
    return { success: false, error: 'Ugyldig kode. Prøv igen.' }
  },

  async getSession() {
    await delay(50)
    return getStoredSession()
  },

  async logout() {
    storeSession(null)
    return { success: true }
  },
}
