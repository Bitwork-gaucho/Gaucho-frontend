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
          message: 'Ugyldig stregkode. Prøv igen.'
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
          message: `Ordre ${validation.orderId.substring(0, 8)} er udleveret.`
        })
      } else {
        setLastScanned({
          orderId: validation.orderId,
          success: false,
          message: 'Udleveringen kunne ikke bekræftes. Ordren findes måske ikke.'
        })
      }

      setScannedCode('')
    } catch (err) {
      setLastScanned({
        orderId: '',
        success: false,
        message: 'Fejl ved scanning: ' + (err instanceof Error ? err.message : 'Ukendt fejl')
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
          <h1>🔍 Afhentningsscanner</h1>
          <p className="subtitle">Scan kundens stregkode for at bekræfte udlevering</p>

          <div className="scanner-section">
            <div className="scanner-card">
              <h2>Scan stregkode</h2>
              <div className="input-group">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Scan stregkode eller indtast kode…"
                  className="scanner-input"
                  autoFocus
                  disabled={scanning}
                />
                <button
                  onClick={handleScan}
                  disabled={!scannedCode.trim() || scanning}
                  className="btn btn-primary"
                >
                  {scanning ? 'Behandler…' : 'Bekræft'}
                </button>
              </div>
              <p className="scanner-help">
                Brug en stregkodescanner, eller indtast koden manuelt. Tryk Enter for at bekræfte.
              </p>
            </div>

            {lastScanned && (
              <div className={`result-card ${lastScanned.success ? 'success' : 'error'}`}>
                <div className="result-icon">
                  {lastScanned.success ? '✓' : '✗'}
                </div>
                <div className="result-content">
                  <h3>{lastScanned.success ? 'Udleveret' : 'Fejl'}</h3>
                  <p>{lastScanned.message}</p>
                </div>
              </div>
            )}

            <div className="scanner-stats">
              <h2>I dag</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Scannet i dag</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Venter på afhentning</div>
                </div>
              </div>
            </div>

            <div className="scanner-instructions">
              <h2>Sådan gør du</h2>
              <ol>
                <li>Kunden kommer for at hente</li>
                <li>Kunden viser sin kvittering med stregkode</li>
                <li>Scan stregkoden med scanneren her</li>
                <li>Bekræft, at ordren er udleveret</li>
                <li>Giv kunden kødet</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
