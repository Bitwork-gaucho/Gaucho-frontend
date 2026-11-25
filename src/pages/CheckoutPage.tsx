import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { formatKg, formatKr } from '../utils/batchStatus'
import { PickupLocationLine } from '../components/PickupLocations'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!batchId || !session) return
    loadData()
  }, [batchId, session])

  async function loadData() {
    try {
      const [batchData, orderData] = await Promise.all([
        mockApi.getBatchById(batchId!),
        mockApi.getOrderByBatchAndUser(batchId!, session!.email)
      ])
      setBatch(batchData)
      setOrder(orderData)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    if (!order) return

    setProcessing(true)
    try {
      const result = await mockApi.processPayment(order.id)
      if (result.success) {
        navigate(`/payment-confirmation/${result.receiptId}`)
      } else {
        alert('Betalingen mislykkedes. Prøv igen.')
      }
    } catch (err) {
      alert('Fejl ved betaling: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Indlæser betaling…</p>
        </div>
      </div>
    )
  }

  if (!batch || !order) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Bestillingen blev ikke fundet</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Log ind for at betale</p>
          <Link to="/login" className="btn btn-primary">Log ind</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <Header onLogout={logout} />

      <main className="checkout-content">
        <div className="checkout-container">
          <h1>Betaling</h1>

          <div className="checkout-layout">
            <div className="order-summary-section">
              <h2>Din bestilling</h2>
              <div className="order-card">
                <div className="order-item">
                  <span className="label">Batch</span>
                  <span className="value">{batch.name} – {batch.meatType}</span>
                </div>
                <div className="order-item">
                  <span className="label">Mængde</span>
                  <span className="value">{formatKg(order.kilos)}</span>
                </div>
                <div className="order-item">
                  <span className="label">Pris pr. kg</span>
                  <span className="value">{formatKr(batch.pricePerKg)}/kg</span>
                </div>
                {(batch.pickupLocations?.length ?? 0) > 0 && (
                  <div className="order-item">
                    <span className="label">Afhentning</span>
                    <span className="value">
                      <PickupLocationLine location={batch.pickupLocations!.find(l => l.id === order.pickupLocationId)} />
                    </span>
                  </div>
                )}
                <div className="divider" />
                <div className="order-item total">
                  <span className="label">I alt</span>
                  <span className="value">{formatKr(order.amount)}</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h2>Betalingsmetode</h2>
              <div className="payment-form">
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={session.email} disabled />
                </div>

                <div className="form-group">
                  <label>Kortnummer</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    disabled
                    defaultValue="Testbetaling – demotilstand"
                  />
                  <small>Demo: Dette er en testbetaling. Der bliver ikke trukket penge.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Udløb</label>
                    <input type="text" placeholder="MM/ÅÅ" disabled />
                  </div>
                  <div className="form-group">
                    <label>Kontrolcifre</label>
                    <input type="text" placeholder="123" disabled />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-large"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Behandler betaling…' : `Betal ${formatKr(order.amount)}`}
                </button>

                <p className="security-notice">
                  Dine betalingsoplysninger er sikre og krypterede.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
