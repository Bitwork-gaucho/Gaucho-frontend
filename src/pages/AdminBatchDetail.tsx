import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import './AdminBatchDetail.css'

export default function AdminBatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [statusChange, setStatusChange] = useState('')
  const [shipmentDetails, setShipmentDetails] = useState({
    supplierName: '',
    logisticsCompany: '',
    containerNumber: ''
  })

  useEffect(() => {
    if (!id) return
    loadBatch()
  }, [id])

  async function loadBatch() {
    try {
      const data = await mockApi.getBatchById(id!)
      setBatch(data)
      setStatusChange(data?.status || '')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange() {
    if (!batch || !statusChange) return

    try {
      const updated = await mockApi.updateBatchStatus(batch.id, statusChange, {
        supplierName: shipmentDetails.supplierName,
        logisticsCompany: shipmentDetails.logisticsCompany,
        containerNumber: shipmentDetails.containerNumber
      })
      if (updated) {
        setBatch(updated)
        setEditing(false)
        alert('Batch status updated successfully')
      }
    } catch (err) {
      alert('Failed to update batch: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDeleteBatch = async () => {
    if (!batch || !window.confirm('Are you sure you want to delete this batch? This cannot be undone.')) return

    try {
      const result = await mockApi.deleteBatch(batch.id)
      if (result.success) {
        alert('Batch deleted')
        navigate('/admin')
      }
    } catch (err) {
      alert('Failed to delete batch')
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading batch...</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Batch not found</p>
          <button onClick={() => navigate('/admin')} className="btn btn-primary">Back to Admin</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-batch-detail">
      <Header onLogout={logout} />

      <main className="admin-content">
        <div className="admin-container">
          <div className="header-row">
            <h1>{batch.name} - {batch.meatType}</h1>
            <button onClick={() => navigate('/admin')} className="btn btn-outline">← Back</button>
          </div>

          <div className="admin-layout">
            <div className="batch-info-section">
              <h2>Batch Information</h2>
              <div className="info-card">
                <div className="info-item">
                  <span className="label">Status</span>
                  <span className="value">{batch.status}</span>
                </div>
                <div className="info-item">
                  <span className="label">Progress</span>
                  <span className="value">{batch.soldKilos} / {batch.targetKilos} kg ({Math.round((batch.soldKilos / batch.targetKilos) * 100)}%)</span>
                </div>
                <div className="info-item">
                  <span className="label">Customers</span>
                  <span className="value">{batch.customerCount}</span>
                </div>
                <div className="info-item">
                  <span className="label">Price per kg</span>
                  <span className="value">{batch.pricePerKg} kr./kg</span>
                </div>
              </div>
            </div>

            <div className="status-control-section">
              <h2>Status Management</h2>
              <div className="control-card">
                {!editing ? (
                  <>
                    <p className="current-status">Current: <strong>{batch.status}</strong></p>
                    <button onClick={() => setEditing(true)} className="btn btn-primary">
                      ✎ Update Status
                    </button>
                  </>
                ) : (
                  <div className="status-form">
                    <div className="form-group">
                      <label>New Status</label>
                      <select value={statusChange} onChange={(e) => setStatusChange(e.target.value)}>
                        <option value="">Select status...</option>
                        <option value="WAITING_TO_FILL">Waiting to Fill</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="AT_CUSTOMS">At Customs</option>
                        <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    {(statusChange === 'IN_TRANSIT' || statusChange === 'AT_CUSTOMS') && (
                      <>
                        <div className="form-group">
                          <label>Supplier Name</label>
                          <input
                            type="text"
                            value={shipmentDetails.supplierName}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, supplierName: e.target.value})}
                            placeholder="e.g. Estancia La Cumbre"
                          />
                        </div>
                        <div className="form-group">
                          <label>Logistics Company</label>
                          <input
                            type="text"
                            value={shipmentDetails.logisticsCompany}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, logisticsCompany: e.target.value})}
                            placeholder="e.g. DHL Freight"
                          />
                        </div>
                        <div className="form-group">
                          <label>Container Number</label>
                          <input
                            type="text"
                            value={shipmentDetails.containerNumber}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, containerNumber: e.target.value})}
                            placeholder="e.g. CONT123456"
                          />
                        </div>
                      </>
                    )}

                    <div className="button-group">
                      <button onClick={handleStatusChange} className="btn btn-success">Save Changes</button>
                      <button onClick={() => setEditing(false)} className="btn btn-outline">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-actions-section">
              <h2>Admin Actions</h2>
              <div className="actions-card">
                <button
                  onClick={() => navigate(`/admin/payments/${batch.id}`)}
                  className="action-btn"
                >
                  💰 View Payments ({batch.customerCount})
                </button>
                <button
                  onClick={() => alert('In production: Download batch report')}
                  className="action-btn"
                >
                  📊 Download Report
                </button>
                <button
                  onClick={handleDeleteBatch}
                  className="action-btn danger"
                >
                  🗑️ Delete Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
