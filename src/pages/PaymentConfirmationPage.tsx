import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Receipt } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import BarcodeGenerator from '../components/BarcodeGenerator'
import { CheckIcon } from '../components/Icons'
import { formatDate, formatKg, formatKr } from '../utils/batchStatus'
import './PaymentConfirmationPage.css'

export default function PaymentConfirmationPage() {
  const { receiptId } = useParams<{ receiptId: string }>()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!receiptId) return
    loadReceipt()
  }, [receiptId])

  async function loadReceipt() {
    try {
      const data = await mockApi.getReceipt(receiptId!)
      setReceipt(data)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReceipt = () => {
    alert('Download af kvittering: I den færdige løsning hentes kvitteringen som PDF.')
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Indlæser kvittering…</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Kvitteringen blev ikke fundet</p>
          <Link to="/orders" className="btn btn-primary">Tilbage til mine ordrer</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-confirmation-page">
      <Header onLogout={logout} />

      <main className="confirmation-content">
        <div className="confirmation-container">
          <div className="success-header">
            <div className="success-icon"><CheckIcon size={32} /></div>
            <h1>Betalingen er gennemført!</h1>
            <p className="confirmation-message">
              Tak for din bestilling. Vi har modtaget din betaling.
            </p>
          </div>

          <div className="receipt-section">
            <h2>Kvittering</h2>

            <div className="receipt-card">
              <div className="receipt-header">
                <div className="receipt-item">
                  <span className="label">Kvitteringsnr.</span>
                  <span className="value">{receipt.receiptId}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Ordrenr.</span>
                  <span className="value">{receipt.orderId}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="receipt-details">
                <div className="receipt-item">
                  <span className="label">Mængde</span>
                  <span className="value">{formatKg(receipt.kilos)}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Betalt</span>
                  <span className="value">{formatKr(receipt.amount)}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Dato</span>
                  <span className="value">{formatDate(new Date())}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="barcode-section">
                <h3>Stregkode til afhentning</h3>
                <p className="barcode-info">Gem stregkoden – du skal vise den, når du henter din bestilling</p>
                <BarcodeGenerator data={receipt.barcodeData} />
              </div>

              <div className="divider" />

              <div className="next-steps">
                <h3>Hvad sker der nu?</h3>
                <ol>
                  <li>Du får en bekræftelse på e-mail med kvitteringen</li>
                  <li>Følg batchens status for at se, hvor forsendelsen er</li>
                  <li>Når kødet er klar, henter du det med stregkoden ovenfor</li>
                </ol>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                Download kvittering
              </button>
              <button className="btn btn-secondary" onClick={handlePrint}>
                Udskriv kvittering
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/orders')}>
                Se alle ordrer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
