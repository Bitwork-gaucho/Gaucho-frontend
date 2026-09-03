import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { requestCode, login } = useAuth()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')

    try {
      await requestCode(email)
      setStep('code')
    } catch (err) {
      setError('Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!code) return

    setLoading(true)
    setError('')

    try {
      await login(email, code)
      navigate('/')
    } catch (err) {
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header />

      <div className="login-container">
        <div className="login-box">
          <h1>Log ind</h1>
          <p className="login-subtitle">Bliv medlem og køb argentinsk oksekød direkte</p>

          {step === 'email' ? (
            <form onSubmit={handleRequestCode}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.dk"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                {loading ? 'Sender...' : 'Send kod'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>Email</label>
                <div className="email-display">{email}</div>
              </div>

              <div className="form-group">
                <label htmlFor="code">6-cifret kod</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  inputMode="numeric"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary btn-large">
                {loading ? 'Bekræfter...' : 'Bekræft kod'}
              </button>

              <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }} className="btn btn-secondary">
                Skift email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
