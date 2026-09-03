import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
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
        alert('Payment processing failed')
      }
    } catch (err) {
      alert('Payment error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!batch || !order) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Order not found</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Please log in to checkout</p>
          <a href="/login" className="btn btn-primary">Log In</a>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <Header onLogout={logout} />

      <main className="checkout-content">
        <div className="checkout-container">
          <h1>Checkout</h1>

          <div className="checkout-layout">
            <div className="order-summary-section">
              <h2>Order Summary</h2>
              <div className="order-card">
                <div className="order-item">
                  <span className="label">Batch</span>
                  <span className="value">{batch.name} - {batch.meatType}</span>
                </div>
                <div className="order-item">
                  <span className="label">Quantity</span>
                  <span className="value">{order.kilos} kg</span>
                </div>
                <div className="order-item">
                  <span className="label">Price per kg</span>
                  <span className="value">{batch.pricePerKg} kr./kg</span>
                </div>
                <div className="divider" />
                <div className="order-item total">
                  <span className="label">Total Amount</span>
                  <span className="value">{order.amount} kr.</span>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h2>Payment Method</h2>
              <div className="payment-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={session.email} disabled />
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    disabled
                    defaultValue="Mock Payment - Demo Mode"
                  />
                  <small>Demo: This is a mock payment. In production, real payment processing would occur.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry</label>
                    <input type="text" placeholder="MM/YY" disabled />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" disabled />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-large"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing Payment...' : `Pay ${order.amount} kr.`}
                </button>

                <p className="security-notice">
                  🔒 Your payment information is secure and encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
