import { useState } from 'react'
import { Link } from 'react-router-dom'
import { paymentService } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import './AdminScanner.css'

export default function AdminScanner() {
  const { session, logout } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [error, setError] = useState(null)

  async function handleScan() {
    if (!orderId.trim()) return
    setScanning(true)
    setError(null)
    setSuccessData(null)
    try {
      const result = await paymentService.confirmDelivery(orderId.trim())
      if (result.success) {
        setSuccessData(result)
      } else {
        setError('Leveringen kunne ikke bekræftes. Prøv igen.')
      }
    } catch (err) {
      setError('Fejl ved bekræftelse af levering. Prøv igen.')
    } finally {
      setScanning(false)
    }
  }

  function handleReset() {
    setOrderId('')
    setSuccessData(null)
    setError(null)
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo">Gaucho<em>.</em></Link>
        <span className="admin-badge">Admin</span>
        <Link to="/admin/batches" className="admin-nav-link">← Alle batches</Link>
        <span className="admin-user">{session?.email}</span>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div data-testid="scanner-page" className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Stregkodescanner</h1>
          <p className="scanner-subtitle">
            Scan eller indtast ordre-ID for at bekræfte levering
          </p>
        </div>

        <div className="scanner-card">
          <div className="scanner-icon" aria-hidden="true">&#x1F4F7;</div>

          {!successData ? (
            <div className="scanner-form">
              <div className="form-field">
                <label className="form-label" htmlFor="barcode-input">Ordre-ID / Stregkode</label>
                <input
                  id="barcode-input"
                  data-testid="barcode-input"
                  className="form-input scanner-input"
                  type="text"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="f.eks. ord-abc-12345"
                  onKeyDown={e => e.key === 'Enter' && !scanning && orderId.trim() && handleScan()}
                  autoFocus
                />
              </div>

              {error && (
                <div className="scanner-error">{error}</div>
              )}

              <button
                data-testid="scan-btn"
                className="scan-btn"
                onClick={handleScan}
                disabled={scanning || !orderId.trim()}
              >
                {scanning ? 'Bekræfter…' : 'Scan'}
              </button>
            </div>
          ) : (
            <div data-testid="scan-success" className="scan-success">
              <div className="scan-success-icon">✓</div>
              <div className="scan-success-text">
                Levering bekræftet for ordre {successData.orderId}
              </div>
              <button className="scan-again-btn" onClick={handleReset}>
                Scan næste ordre
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
