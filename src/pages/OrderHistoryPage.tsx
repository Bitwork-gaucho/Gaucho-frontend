import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockApi } from '../services/mockApi'
import { Order } from '../types'
import Header from '../components/Header'
import './OrderHistoryPage.css'

export default function OrderHistoryPage() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadOrders()
    }
  }, [session])

  async function loadOrders() {
    try {
      const data = await mockApi.getUserOrders(session!.email)
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm('Cancel this order?')) return

    setCancelingId(orderId)
    try {
      const result = await mockApi.cancelOrder(orderId)
      if (result.success) {
        await loadOrders()
      }
    } catch (err) {
      alert('Failed to cancel order')
    } finally {
      setCancelingId(null)
    }
  }

  if (!session) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Please log in to view your orders</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history-page">
      <Header onLogout={logout} />

      <main className="order-history-content">
        <h1>Your Orders</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>You haven't placed any orders yet.</p>
            <a href="/batches" className="btn btn-primary">Browse Batches</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Order #{order.id.substring(4)}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Batch</span>
                    <span className="value">{order.batchId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Quantity</span>
                    <span className="value">{order.kilos} kg</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount</span>
                    <span className="value">{order.amount} kr.</span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/checkout/${order.batchId}`)}
                      >
                        💳 Proceed to Checkout
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelingId === order.id}
                      >
                        {cancelingId === order.id ? 'Cancelling...' : '✕ Cancel Order'}
                      </button>
                    </>
                  )}
                  {order.status === 'PAID' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/tracking/${order.batchId}`)}
                      >
                        📦 Track Shipment
                      </button>
                      {order.receiptId && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/payment-confirmation/${order.receiptId}`)}
                        >
                          📄 View Receipt
                        </button>
                      )}
                    </>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span className="cancelled-text">Order cancelled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
