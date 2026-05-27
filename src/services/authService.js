const delay = (ms) => new Promise(r => setTimeout(r, ms))

let _session = null

export const authService = {
  async requestLoginCode(email) {
    await delay(600)
    console.log(`[mock] login code sent to: ${email} — use 123456`)
    return { success: true }
  },

  async verifyLoginCode(email, code) {
    await delay(800)
    if (code === '123456') {
      _session = {
        userId: `user-${email.split('@')[0]}`,
        email,
        role: email.includes('admin') ? 'admin' : 'customer',
      }
      return { success: true, session: _session }
    }
    return { success: false, error: 'Ugyldig kode. Prøv igen.' }
  },

  async getSession() {
    await delay(50)
    return _session
  },

  async logout() {
    _session = null
    return { success: true }
  },
}
