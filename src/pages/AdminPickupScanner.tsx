import { useState } from 'react'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './AdminPickupScanner.css'

export default function AdminPickupScanner() {
  const { logout } = useAuth()
  const [scannedCode, setScannedCode] = useState('')
  const [lastScanned, setLastScanned] = useState<{ orderId: string; success: boolean; message: string } | null>(null)
  const [scanning, setScanning] = useState(false)

  async function handleScan() {
    if (!scannedCode.trim()) return

    setScanning(true)
    try {
      // Validate barcode format
      const validation = await mockApi.validateBarcode(scannedCode)

      if (!validation.valid || !validation.orderId) {
        setLastScanned({
          orderId: '',
          success: false,
          message: 'Invalid barcode format. Please try again.'
        })
        setScannedCode('')
        setScanning(false)
        return
      }

      // Confirm delivery
      const result = await mockApi.confirmDelivery(validation.orderId)

      if (result.success) {
        setLastScanned({
          orderId: validation.orderId,
          success: true,
          message: `✓ Order ${validation.orderId.substring(0, 8)} delivered successfully!`
        })
      } else {
        setLastScanned({
          orderId: validation.orderId,
          success: false,
          message: 'Failed to confirm delivery. Order may not exist.'
        })
      }

      setScannedCode('')
    } catch (err) {
      setLastScanned({
        orderId: '',
        success: false,
        message: 'Scan error: ' + (err instanceof Error ? err.message : 'Unknown error')
      })
    } finally {
      setScanning(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  return (
    <div className="admin-pickup-scanner">
      <Header onLogout={logout} />

      <main className="scanner-content">
        <div className="scanner-container">
          <h1>🔍 Pickup Scanner</h1>
          <p className="subtitle">Scan customer barcodes to confirm delivery</p>

          <div className="scanner-section">
            <div className="scanner-card">
              <h2>Scan Barcode</h2>
              <div className="input-group">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan barcode or enter code..."
                  className="scanner-input"
                  autoFocus
                  disabled={scanning}
                />
                <button
                  onClick={handleScan}
                  disabled={!scannedCode.trim() || scanning}
                  className="btn btn-primary"
                >
                  {scanning ? 'Processing...' : 'Confirm'}
                </button>
              </div>
              <p className="scanner-help">
                Use a barcode scanner or enter the code manually. Press Enter to submit.
              </p>
            </div>

            {lastScanned && (
              <div className={`result-card ${lastScanned.success ? 'success' : 'error'}`}>
                <div className="result-icon">
                  {lastScanned.success ? '✓' : '✗'}
                </div>
                <div className="result-content">
                  <h3>{lastScanned.success ? 'Success' : 'Error'}</h3>
                  <p>{lastScanned.message}</p>
                </div>
              </div>
            )}

            <div className="scanner-stats">
              <h2>Today's Activity</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Scanned Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Pending Pickups</div>
                </div>
              </div>
            </div>

            <div className="scanner-instructions">
              <h2>Instructions</h2>
              <ol>
                <li>Customer arrives for pickup</li>
                <li>Customer shows their receipt with barcode</li>
                <li>Scan the barcode using this scanner</li>
                <li>Confirm the order has been delivered</li>
                <li>Hand over the meat to the customer</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
