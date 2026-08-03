import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mockStore } from '../../services/mockStore'
import { paymentService, batchService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './AdminPayments.css'
import './AdminBatchDetail.css'

export default function AdminPayments() {
  const { session, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [refundingId, setRefundingId] = useState(null)
  const [filter, setFilter] = useState('all')

  async function loadData() {
    const [allOrders, allBatches] = await Promise.all([
      mockStore.getAllOrders(),
      mockStore.getAllBatches(),
    ])
    setOrders(allOrders)
    setBatches(allBatches)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRefund(orderId) {
    if (!confirm('Returner betaling for denne ordre?')) return
    setRefundingId(orderId)
    await paymentService.issueRefund(orderId)
    await loadData()
    setRefundingId(null)
  }

  const batchName = (batchId) => {
    const b = batches.find(b => b.id === batchId)
    return b ? b.name : batchId
  }

  const filtered = orders.filter(o => {
    if (filter === 'all') return true
    return o.status === filter.toUpperCase()
  })

  const totalCollected = orders
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0)
  const totalRefunded = orders
    .filter(o => o.status === 'REFUNDED')
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/admin/batches" className="admin-logo">Batches</Link>
        <span className="admin-badge">Admin</span>
        <Link to="/admin/payments" className="admin-nav-link admin-nav-link--active">Konto</Link>
        <Link to="/admin/scanner" className="admin-nav-link">Scanner</Link>
        <span className="admin-user">{session?.email}</span>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div className="admin-container">
        <h1 className="admin-title">Konto &amp; Betalinger</h1>

        {/* Account summary */}
        <div className="account-summary">
          <div className="account-card">
            <div className="account-label">Indsamlet</div>
            <div className="account-value">{totalCollected} kr.</div>
          </div>
          <div className="account-card">
            <div className="account-label">Returneret</div>
            <div className="account-value">{totalRefunded} kr.</div>
          </div>
          <div className="account-card">
            <div className="account-label">Ordrer i alt</div>
            <div className="account-value">{orders.length}</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'paid', label: 'Betalt' },
            { value: 'refunded', label: 'Returneret' },
            { value: 'cancelled', label: 'Annulleret' },
          ].map(tab => (
            <button
              key={tab.value}
              className={`filter-tab${filter === tab.value ? ' filter-tab--active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading">Henter ordrer...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-loading">Ingen ordrer i denne kategori.</div>
        ) : (
          <div className="orders-table">
            <div className="orders-row orders-header">
              <span>Ordre ID</span>
              <span>Batch</span>
              <span>Kunde</span>
              <span>kg</span>
              <span>Beløb</span>
              <span>Status</span>
              <span>Handling</span>
            </div>
            {filtered.map(order => (
              <div key={order.id} className="orders-row" data-testid="order-row">
                <span className="order-id">{order.id}</span>
                <span>{batchName(order.batchId)}</span>
                <span className="order-email">{order.userEmail}</span>
                <span>{order.kilos}</span>
                <span>{order.amount} kr.</span>
                <span>
                  <span className={`admin-batch-status status-${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </span>
                <span className="order-actions">
                  {order.status === 'PAID' && (
                    <button
                      data-testid={`refund-btn-${order.id}`}
                      className="refund-btn"
                      onClick={() => handleRefund(order.id)}
                      disabled={refundingId === order.id}
                    >
                      {refundingId === order.id ? '...' : 'Returner'}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
