import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { batchService, paymentService } from '../../services'
import { Barcode } from '../../components/Barcode'
import './AdminBatchDetail.css'

const STATUSES = [
  { value: 'WAITING_TO_FILL', label: 'Åben for køb' },
  { value: 'UPCOMING', label: 'Kommende' },
  { value: 'ORDERED', label: 'Bestilt' },
  { value: 'IN_TRANSIT', label: 'På vej' },
  { value: 'ARRIVED', label: 'Ankommet' },
  { value: 'READY_FOR_PICKUP', label: 'Klar til afhentning' },
  { value: 'COMPLETED', label: 'Afsluttet' },
]

export default function AdminBatchDetail() {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [pickupDate, setPickupDate] = useState('')
  const [pickupWindow, setPickupWindow] = useState('')
  const [savingPickup, setSavingPickup] = useState(false)
  const [refundingId, setRefundingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  async function loadData() {
    const [b, o] = await Promise.all([
      batchService.getBatchById(id),
      batchService.getPaymentOverview(id),
    ])
    setBatch(b)
    setOrders(o.customers || [])
    setPickupDate(b?.pickupDate || '')
    setPickupWindow(b?.pickupWindow || '')
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleStatusChange(newStatus) {
    setSavingStatus(true)
    await batchService.setBatchStatus(id, newStatus)
    await loadData()
    setSavingStatus(false)
  }

  async function handleSavePickup() {
    setSavingPickup(true)
    await batchService.setPickupWindow(id, pickupDate, pickupWindow)
    await loadData()
    setSavingPickup(false)
  }

  async function handleRefund(orderId) {
    if (!confirm('Returner betaling for denne ordre?')) return
    setRefundingId(orderId)
    await paymentService.issueRefund(orderId)
    await loadData()
    setRefundingId(null)
  }

  async function handleConfirmDelivery(orderId) {
    setConfirmingId(orderId)
    await paymentService.confirmDelivery(orderId)
    await loadData()
    setConfirmingId(null)
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-loading">Henter batch...</div>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Batch ikke fundet</h1>
          <Link to="/admin/batches">Tilbage til batches</Link>
        </div>
      </div>
    )
  }

  const totalCollected = orders.reduce((sum, o) => sum + o.paid, 0)

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/admin/batches" className="admin-logo">← Batches</Link>
        <Link to="/admin/payments" className="admin-nav-link">Konto</Link>
        <Link to="/admin/scanner" className="admin-nav-link">Scanner</Link>
      </nav>

      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">{batch.name}</h1>
            <div className="admin-batch-id">{batch.meatType}</div>
          </div>
          <Link to="/admin/batches" className="admin-view-btn">Tilbage</Link>
        </div>

        {/* Status management */}
        <div className="admin-card">
          <h2 className="admin-card-title">Batch status</h2>
          <div className="status-controls">
            <select
              data-testid="status-select"
              className="form-input"
              value={batch.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={savingStatus}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {savingStatus && <span className="admin-saving">Gemmer...</span>}
          </div>
          <div className="admin-batch-meta" style={{ marginTop: 12 }}>
            <span className={`admin-batch-status status-${batch.status?.toLowerCase()}`}>
              {batch.status}
            </span>
            <span className="admin-batch-progress">
              {batch.soldKilos} / {batch.targetKilos} kg · {batch.customerCount} kunder
            </span>
          </div>
        </div>

        {/* Pickup window */}
        <div className="admin-card">
          <h2 className="admin-card-title">Afhentningsvindue</h2>
          <div className="form-row">
            <label className="form-field">
              <span className="form-label">Dato</span>
              <input
                className="form-input"
                type="date"
                value={pickupDate || ''}
                onChange={e => setPickupDate(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span className="form-label">Tid</span>
              <input
                className="form-input"
                type="text"
                value={pickupWindow || ''}
                onChange={e => setPickupWindow(e.target.value)}
                placeholder="10:00–14:00"
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              data-testid="save-pickup-btn"
              className="create-form-submit"
              onClick={handleSavePickup}
              disabled={savingPickup}
            >
              {savingPickup ? 'Gemmer...' : 'Gem afhentning'}
            </button>
          </div>
        </div>

        {/* Payment overview */}
        <div className="admin-card">
          <h2 className="admin-card-title">Betalingsoversigt</h2>
          <div className="payment-summary">
            <div className="payment-summary-item">
              <span className="payment-summary-label">Indsamlet</span>
              <span className="payment-summary-value">{totalCollected} kr.</span>
            </div>
            <div className="payment-summary-item">
              <span className="payment-summary-label">Ordrer</span>
              <span className="payment-summary-value">{orders.length}</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="admin-loading">Ingen betalte ordrer endnu.</div>
          ) : (
            <div className="orders-table">
              <div className="orders-row orders-header">
                <span>Kunde</span>
                <span>kg</span>
                <span>Beløb</span>
                <span>Stregkode</span>
                <span>Status</span>
                <span>Handling</span>
              </div>
              {orders.map(order => (
                <div key={order.orderId} className="orders-row" data-testid="order-row">
                  <span className="order-email">{order.email}</span>
                  <span>{order.kilos}</span>
                  <span>{order.paid} kr.</span>
                  <span className="order-barcode-cell">
                    <Barcode value={order.barcodeData} height={32} testId={`barcode-${order.orderId}`} />
                  </span>
                  <span>
                    <span className={`admin-batch-status status-${order.status?.toLowerCase()}`}>
                      {order.delivered ? 'AFLEVERET' : order.status}
                    </span>
                  </span>
                  <span className="order-actions">
                    {!order.delivered && order.status === 'PAID' && (
                      <button
                        data-testid={`refund-btn-${order.orderId}`}
                        className="refund-btn"
                        onClick={() => handleRefund(order.orderId)}
                        disabled={refundingId === order.orderId}
                      >
                        {refundingId === order.orderId ? '...' : 'Returner'}
                      </button>
                    )}
                    {!order.delivered && order.status === 'PAID' && (
                      <button
                        data-testid={`deliver-btn-${order.orderId}`}
                        className="deliver-btn"
                        onClick={() => handleConfirmDelivery(order.orderId)}
                        disabled={confirmingId === order.orderId}
                      >
                        {confirmingId === order.orderId ? '...' : 'Afleveret'}
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
