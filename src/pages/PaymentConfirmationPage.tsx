import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Receipt } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import BarcodeGenerator from '../components/BarcodeGenerator'
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
    alert('Receipt download: In production, this would generate and download a PDF file.')
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Receipt not found</p>
          <a href="/orders" className="btn btn-primary">Back to Orders</a>
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
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p className="confirmation-message">
              Thank you for your order. Your payment has been received.
            </p>
          </div>

          <div className="receipt-section">
            <h2>Order Receipt</h2>

            <div className="receipt-card">
              <div className="receipt-header">
                <div className="receipt-item">
                  <span className="label">Receipt ID</span>
                  <span className="value">{receipt.receiptId}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Order ID</span>
                  <span className="value">{receipt.orderId}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="receipt-details">
                <div className="receipt-item">
                  <span className="label">Quantity</span>
                  <span className="value">{receipt.kilos} kg</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Amount Paid</span>
                  <span className="value">{receipt.amount} kr.</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Date</span>
                  <span className="value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="barcode-section">
                <h3>Pickup Barcode</h3>
                <p className="barcode-info">Save this barcode - you'll need it when picking up your order</p>
                <BarcodeGenerator data={receipt.barcodeData} />
              </div>

              <div class="divider" />

              <div className="next-steps">
                <h3>What's Next?</h3>
                <ol>
                  <li>We'll send you an email confirmation with this receipt</li>
                  <li>Watch the batch status for shipment updates</li>
                  <li>When ready, pick up your meat using the barcode above</li>
                </ol>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                📥 Download Receipt
              </button>
              <button className="btn btn-secondary" onClick={handlePrint}>
                🖨️ Print Receipt
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/orders')}>
                📦 View All Orders
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
