import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mockStore } from '../../services/mockStore'
import { paymentService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { Barcode } from '../../components/Barcode'
import './AdminScanner.css'
import './AdminBatchDetail.css'

export default function AdminScanner() {
  const { session, logout } = useAuth()
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)

  async function handleScan(e) {
    e.preventDefault()
    if (!input.trim()) return
    setScanning(true)
    setResult(null)
    const code = input.trim()
    const orderId = code.replace('GAUCHO-', '')
    const order = await mockStore.confirmDelivery(orderId)
    if (order) {
      setResult({
        success: true,
        orderId: order.id,
        email: order.userEmail,
        kilos: order.kilos,
        amount: order.amount,
        delivered: order.delivered,
        barcodeData: order.barcodeData,
      })
    } else {
      setResult({ success: false, error: `Ingen ordre fundet for stregkode: ${code}` })
    }
    setInput('')
    setScanning(false)
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/admin/batches" className="admin-logo">Batches</Link>
        <Link to="/admin/payments" className="admin-nav-link">Konto</Link>
        <Link to="/admin/scanner" className="admin-nav-link admin-nav-link--active">Scanner</Link>
        <span className="admin-user">{session?.email}</span>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div className="admin-container">
        <h1 className="admin-title">Stregkodescanner</h1>
        <p className="scanner-subtitle">
          Scan eller indtast kundens stregkode for at markere ordren som afleveret.
        </p>

        <form className="scanner-form" onSubmit={handleScan}>
          <input
            data-testid="scanner-input"
            className="scanner-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="GAUCHO-ord-001"
            autoFocus
          />
          <button
            data-testid="scanner-submit"
            type="submit"
            className="scanner-btn"
            disabled={scanning || !input.trim()}
          >
            {scanning ? 'Skanner...' : 'Bekræft afhentning'}
          </button>
        </form>

        {result && (
          <div className={`scanner-result ${result.success ? 'scanner-result--success' : 'scanner-result--error'}`}>
            {result.success ? (
              <>
                <div className="scanner-result-title">Afhentning bekræftet</div>
                <div className="scanner-result-body">
                  <div className="scanner-result-row"><span>Kunde</span><span>{result.email}</span></div>
                  <div className="scanner-result-row"><span>Mængde</span><span>{result.kilos} kg</span></div>
                  <div className="scanner-result-row"><span>Beløb</span><span>{result.amount} kr.</span></div>
                  <div className="scanner-result-row"><span>Status</span><span>Afleveret</span></div>
                  <div className="scanner-result-barcode">
                    <Barcode value={result.barcodeData} height={40} />
                  </div>
                </div>
              </>
            ) : (
              <div className="scanner-result-title">{result.error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
