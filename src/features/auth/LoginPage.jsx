import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'
import logo from '../../../public/logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [error, setError] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSendCode(e) {
    e.preventDefault()
    if (!email) return
    setSendingCode(true)
    setError('')
    try {
      await authService.requestLoginCode(email)
      setStep('code')
    } catch {
      setError('Kunne ikke sende kode. Prøv igen.')
    } finally {
      setSendingCode(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    if (!code) return
    setVerifying(true)
    setError('')
    try {
      const result = await authService.verifyLoginCode(email, code)
      if (result.success) {
        login(result.session)
        navigate('/')
      } else {
        setError(result.error || 'Ugyldig kode. Prøv igen.')
      }
    } catch {
      setError('Noget gik galt. Prøv igen.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="login-page">
      <nav className="login-nav">
        <Link to="/" className="login-logo"><img src={logo} alt="Gaucho" style={{ height: 60, width: 'auto' }} /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative', marginLeft: 'auto' }}>
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/" onClick={() => setMenuOpen(false)}>Hjem</Link>
              <Link to="/batches" onClick={() => setMenuOpen(false)}>Batches</Link>
            </div>
          )}
        </div>
      </nav>

      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Log ind</h1>
          <p className="login-subtitle">Indtast din email for at modtage en kode</p>
        </div>

        {step === 'email' ? (
          <form className="login-form" onSubmit={handleSendCode}>
            <div className="login-field">
              <label htmlFor="email-input" className="login-label">Email</label>
              <input
                id="email-input"
                data-testid="email-input"
                type="email"
                className="login-input"
                placeholder="din@email.dk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <button
              data-testid="send-code-btn"
              type="submit"
              className="login-btn"
              disabled={sendingCode}
            >
              {sendingCode ? 'Sender...' : 'Send kode'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerify}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-email-display">{email}</div>
            </div>
            <div className="login-field">
              <label htmlFor="code-input" className="login-label">6-cifret kode</label>
              <input
                id="code-input"
                data-testid="code-input"
                type="text"
                className="login-input login-code-input"
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>
            {error && (
              <div data-testid="auth-error" className="login-error">
                {error}
              </div>
            )}
            <button
              data-testid="verify-btn"
              type="submit"
              className="login-btn"
              disabled={verifying}
            >
              {verifying ? 'Bekræfter...' : 'Bekræft kode'}
            </button>
            <button
              type="button"
              className="login-btn-secondary"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
            >
              Skift email
            </button>
          </form>
        )}

        {step === 'email' && error && (
          <div data-testid="auth-error" className="login-error">{error}</div>
        )}
      </div>
    </div>
  )
}
