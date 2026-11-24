import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockApi } from '../services/mockApi'
import { Batch, Order } from '../types'
import { BatchStatusBadge } from '../components/BatchStatus'
import Header from '../components/Header'
import { CreditCardIcon, TruckIcon, CloseIcon, FileTextIcon } from '../components/Icons'
import { ORDER_STATUS, formatDate, formatKg, formatKr } from '../utils/batchStatus'
import './OrderHistoryPage.css'

export default function OrderHistoryPage() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [batches, setBatches] = useState<Record<string, Batch>>({})
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadOrders()
    }
  }, [session])

  async function loadOrders() {
    try {
      const [data, allBatches] = await Promise.all([
        mockApi.getUserOrders(session!.email),
        mockApi.getBatches(),
      ])
      setOrders(data)
      setBatches(Object.fromEntries(allBatches.map(b => [b.id, b])))
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm('Vil du annullere denne bestilling?')) return

    setCancelingId(orderId)
    try {
      const result = await mockApi.cancelOrder(orderId)
      if (result.success) {
        await loadOrders()
      }
    } catch (err) {
      alert('Bestillingen kunne ikke annulleres')
    } finally {
      setCancelingId(null)
    }
  }

  if (!session) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Log ind for at se dine ordrer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history-page">
      <Header onLogout={logout} />

      <main className="order-history-content">
        <h1>Mine ordrer</h1>

        {loading ? (
          <p>Indlæser ordrer…</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>Du har ikke bestilt noget endnu.</p>
            <Link to="/batches" className="btn btn-primary">Se batches</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Ordre #{order.id.substring(4)}</span>
                    <span className="order-date">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {ORDER_STATUS[order.status]}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Batch</span>
                    <span className="value">
                      {batches[order.batchId]
                        ? `${batches[order.batchId].name} – ${batches[order.batchId].meatType}`
                        : order.batchId}
                    </span>
                  </div>
                  {batches[order.batchId] && order.status !== 'CANCELLED' && (
                    <div className="detail-row">
                      <span className="label">Batchens status</span>
                      <span className="value"><BatchStatusBadge status={batches[order.batchId].status} /></span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Mængde</span>
                    <span className="value">{formatKg(order.kilos)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Beløb</span>
                    <span className="value">{formatKr(order.amount)}</span>
                  </div>
                </div>

                <div className="order-actions">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/checkout/${order.batchId}`)}
                      >
                        <CreditCardIcon /> Gå til betaling
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelingId === order.id}
                      >
                        {cancelingId === order.id ? 'Annullerer…' : <><CloseIcon /> Annullér bestilling</>}
                      </button>
                    </>
                  )}
                  {order.status === 'PAID' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/tracking/${order.batchId}`)}
                      >
                        <TruckIcon /> Følg forsendelsen
                      </button>
                      {order.receiptId && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/payment-confirmation/${order.receiptId}`)}
                        >
                          <FileTextIcon /> Se kvittering
                        </button>
                      )}
                    </>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span className="cancelled-text">Bestillingen er annulleret</span>
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
