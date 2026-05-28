import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { batchService } from '../../services'
import { paymentService } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import './AdminBatchDetail.css'

const STATUS_LABELS = {
  WAITING_TO_FILL: 'Fyldes',
  ORDERED: 'Bestilt',
  IN_TRANSIT: 'På vej',
  ARRIVED: 'Ankommet',
  COMPLETED: 'Afsluttet',
  UPCOMING: 'Kommende',
}

export default function AdminBatchDetail() {
  const { id } = useParams()
  const { session, logout } = useAuth()

  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentOverview, setPaymentOverview] = useState(null)
  const [loadingPayments, setLoadingPayments] = useState(true)

  // Shipment form state
  const [supplier, setSupplier] = useState('')
  const [containerId, setContainerId] = useState('')
  const [savingShipment, setSavingShipment] = useState(false)
  const [shipmentSaved, setShipmentSaved] = useState(false)

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(null)

  // Refund state
  const [refundingId, setRefundingId] = useState(null)
  const [bulkRefunding, setBulkRefunding] = useState(false)
  const [refundedIds, setRefundedIds] = useState(new Set())
  const [bulkRefundDone, setBulkRefundDone] = useState(false)

  useEffect(() => {
    batchService.getBatchById(id).then(b => {
      setBatch(b)
      setCurrentStatus(b?.status)
      setLoading(false)
    })
    batchService.getPaymentOverview(id).then(overview => {
      setPaymentOverview(overview)
      setLoadingPayments(false)
    })
  }, [id])

  async function handleSetStatus(status) {
    setUpdatingStatus(true)
    try {
      await batchService.setBatchStatus(id, status)
      setCurrentStatus(status)
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSaveShipment() {
    setSavingShipment(true)
    try {
      await batchService.updateBatch(id, { supplier, containerId })
      setShipmentSaved(true)
      setTimeout(() => setShipmentSaved(false), 3000)
    } finally {
      setSavingShipment(false)
    }
  }

  async function handleRefund(email, index) {
    setRefundingId(index)
    try {
      await paymentService.issueRefund(`ord-${id}-${index}`)
      setRefundedIds(prev => new Set([...prev, index]))
    } finally {
      setRefundingId(null)
    }
  }

  async function handleBulkRefund() {
    setBulkRefunding(true)
    try {
      const orderIds = (paymentOverview?.customers || []).map((_, i) => `ord-${id}-${i}`)
      await paymentService.bulkRefund(orderIds)
      setBulkRefundDone(true)
    } finally {
      setBulkRefunding(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <nav className="admin-nav">
          <Link to="/" className="admin-logo">Gaucho<em>.</em></Link>
          <span className="admin-badge">Admin</span>
          <span className="admin-user">{session?.email}</span>
          <button className="admin-logout-btn" onClick={logout}>Log ud</button>
        </nav>
        <div className="admin-container">
          <div className="admin-loading">Henter batch…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo">Gaucho<em>.</em></Link>
        <span className="admin-badge">Admin</span>
        <Link to="/admin/batches" className="admin-nav-link">← Alle batches</Link>
        <Link to="/admin/scanner" className="admin-nav-link">Scanner</Link>
        <span className="admin-user">{session?.email}</span>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div data-testid="admin-batch-detail" className="admin-container">
        <div className="admin-header">
          <div className="admin-batch-id-label">{id}</div>
          <h1 className="admin-title">{batch?.meatType || batch?.name}</h1>
          <div className="admin-batch-status-badge">
            Status: {STATUS_LABELS[currentStatus] || currentStatus}
          </div>
          <div className="admin-batch-progress-info">
            {batch?.soldKilos} / {batch?.targetKilos} kg ({Math.round((batch?.soldKilos / batch?.targetKilos) * 100)}%)
          </div>
        </div>

        {/* Status management */}
        <section data-testid="status-management" className="admin-section">
          <h2 className="admin-section-title">Statusændring</h2>
          <div className="status-btns">
            <button
              data-testid="set-status-ordered-btn"
              className={`status-btn${currentStatus === 'ORDERED' ? ' status-btn--active' : ''}`}
              onClick={() => handleSetStatus('ORDERED')}
              disabled={updatingStatus}
            >
              Bestilt
            </button>
            <button
              data-testid="set-status-transit-btn"
              className={`status-btn${currentStatus === 'IN_TRANSIT' ? ' status-btn--active' : ''}`}
              onClick={() => handleSetStatus('IN_TRANSIT')}
              disabled={updatingStatus}
            >
              I Transit
            </button>
            <button
              className={`status-btn${currentStatus === 'ARRIVED' ? ' status-btn--active' : ''}`}
              onClick={() => handleSetStatus('ARRIVED')}
              disabled={updatingStatus}
            >
              Ankommet
            </button>
            <button
              className={`status-btn${currentStatus === 'COMPLETED' ? ' status-btn--active' : ''}`}
              onClick={() => handleSetStatus('COMPLETED')}
              disabled={updatingStatus}
            >
              Afsluttet
            </button>
          </div>
        </section>

        {/* Shipment details form */}
        <section data-testid="shipment-details-form" className="admin-section">
          <h2 className="admin-section-title">Fragttdetaljer</h2>
          <div className="shipment-form-fields">
            <div className="form-field">
              <label className="form-label" htmlFor="supplier-input">Leverandør / Afsender</label>
              <input
                id="supplier-input"
                data-testid="supplier-input"
                className="form-input"
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="f.eks. Gaucho Logistics SA"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="container-input">Container / Skib ID</label>
              <input
                id="container-input"
                data-testid="container-input"
                className="form-input"
                type="text"
                value={containerId}
                onChange={e => setContainerId(e.target.value)}
                placeholder="f.eks. GAUC0010001"
              />
            </div>
            <button
              data-testid="save-shipment-btn"
              className="save-shipment-btn"
              onClick={handleSaveShipment}
              disabled={savingShipment}
            >
              {savingShipment ? 'Gemmer…' : shipmentSaved ? 'Gemt ✓' : 'Gem fragtdetaljer'}
            </button>
          </div>
        </section>

        {/* Payment overview */}
        <section data-testid="payment-overview" className="admin-section">
          <h2 className="admin-section-title">Betalingsoversigt</h2>
          {loadingPayments ? (
            <div className="admin-loading">Henter betalinger…</div>
          ) : (
            <>
              <div className="payment-overview-summary">
                <span>Total indsamlet: <strong>{paymentOverview?.totalCollected} kr.</strong></span>
                <span>Mål: <strong>{paymentOverview?.targetAmount} kr.</strong></span>
              </div>
              <div className="customer-table">
                <div className="customer-table-header">
                  <span>Email</span>
                  <span>Kg</span>
                  <span>Betalt</span>
                  <span>Refundering</span>
                </div>
                {(paymentOverview?.customers || []).map((customer, index) => (
                  <div
                    key={customer.email}
                    data-testid="customer-row"
                    className={`customer-row${refundedIds.has(index) ? ' customer-row--refunded' : ''}`}
                  >
                    <span className="customer-email">{customer.email}</span>
                    <span>{customer.kilos} kg</span>
                    <span>{customer.paid} kr.</span>
                    <button
                      data-testid="refund-btn"
                      className="refund-btn"
                      onClick={() => handleRefund(customer.email, index)}
                      disabled={refundingId === index || refundedIds.has(index) || bulkRefundDone}
                    >
                      {refundedIds.has(index) ? 'Refunderet' : refundingId === index ? 'Refunderer…' : 'Refunder'}
                    </button>
                  </div>
                ))}
              </div>
              <button
                data-testid="bulk-refund-btn"
                className="bulk-refund-btn"
                onClick={handleBulkRefund}
                disabled={bulkRefunding || bulkRefundDone}
              >
                {bulkRefundDone ? 'Alle refunderet ✓' : bulkRefunding ? 'Refunderer alle…' : 'Masserefundering'}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
