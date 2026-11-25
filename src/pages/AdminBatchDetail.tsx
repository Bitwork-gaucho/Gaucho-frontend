import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { FileTextIcon, TrashIcon, DollarSignIcon, BarChart3Icon } from '../components/Icons'
import { BatchStatusBadge, BatchTimeline } from '../components/BatchStatus'
import { BATCH_STATUS, BatchStatus, fillInfo, formatKr } from '../utils/batchStatus'
import { PickupLocationsEditor, ImagesEditor } from '../components/AdminBatchEditors'
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
        alert('Batchens status er opdateret')
      }
    } catch (err) {
      alert('Batchen kunne ikke opdateres: ' + (err instanceof Error ? err.message : 'Ukendt fejl'))
    }
  }

  const handleDeleteBatch = async () => {
    if (!batch || !window.confirm('Er du sikker på, at du vil slette denne batch? Det kan ikke fortrydes.')) return

    try {
      const result = await mockApi.deleteBatch(batch.id)
      if (result.success) {
        alert('Batchen er slettet')
        navigate('/admin')
      }
    } catch (err) {
      alert('Batchen kunne ikke slettes')
    }
  }

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Indlæser batch…</p>
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Batchen blev ikke fundet</p>
          <button onClick={() => navigate('/admin')} className="btn btn-primary">Tilbage til admin</button>
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
            <h1>{batch.name} – {batch.meatType}</h1>
            <button onClick={() => navigate('/admin')} className="btn btn-outline">← Tilbage</button>
          </div>

          <div className="admin-layout">
            <div className="batch-info-section">
              <h2>Batchoplysninger</h2>
              <div className="info-card">
                <div className="info-item">
                  <span className="label">Status</span>
                  <span className="value"><BatchStatusBadge status={batch.status} /></span>
                </div>
                <div className="info-item">
                  <span className="label">Solgt</span>
                  <span className="value">{batch.soldKilos} af {batch.targetKilos} kg ({fillInfo(batch).percent} %)</span>
                </div>
                <div className="info-item">
                  <span className="label">Kunder</span>
                  <span className="value">{batch.customerCount}</span>
                </div>
                <div className="info-item">
                  <span className="label">Pris pr. kg</span>
                  <span className="value">{formatKr(batch.pricePerKg)}/kg</span>
                </div>
              </div>
            </div>

            <div className="status-control-section">
              <h2>Status</h2>
              <div className="control-card">
                {!editing ? (
                  <>
                    <BatchTimeline batch={batch} />
                    <button onClick={() => setEditing(true)} className="btn btn-primary">
                      Skift status
                    </button>
                  </>
                ) : (
                  <div className="status-form">
                    <div className="form-group">
                      <label>Ny status</label>
                      <select value={statusChange} onChange={(e) => setStatusChange(e.target.value)}>
                        <option value="">Vælg status…</option>
                        {(['WAITING_TO_FILL', 'ORDERED', 'IN_TRANSIT', 'AT_CUSTOMS', 'READY_FOR_PICKUP', 'COMPLETED'] as BatchStatus[]).map(s => (
                          <option key={s} value={s}>{BATCH_STATUS[s].label}</option>
                        ))}
                      </select>
                    </div>

                    {(statusChange === 'IN_TRANSIT' || statusChange === 'AT_CUSTOMS') && (
                      <>
                        <div className="form-group">
                          <label>Leverandør</label>
                          <input
                            type="text"
                            value={shipmentDetails.supplierName}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, supplierName: e.target.value})}
                            placeholder="fx Estancia La Cumbre"
                          />
                        </div>
                        <div className="form-group">
                          <label>Fragtfirma</label>
                          <input
                            type="text"
                            value={shipmentDetails.logisticsCompany}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, logisticsCompany: e.target.value})}
                            placeholder="fx DHL Freight"
                          />
                        </div>
                        <div className="form-group">
                          <label>Containernummer</label>
                          <input
                            type="text"
                            value={shipmentDetails.containerNumber}
                            onChange={(e) => setShipmentDetails({...shipmentDetails, containerNumber: e.target.value})}
                            placeholder="fx CONT123456"
                          />
                        </div>
                      </>
                    )}

                    <div className="button-group">
                      <button onClick={handleStatusChange} className="btn btn-success">Gem ændringer</button>
                      <button onClick={() => setEditing(false)} className="btn btn-outline">Annullér</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <PickupLocationsEditor batch={batch} onSaved={setBatch} />

            <ImagesEditor batch={batch} onSaved={setBatch} />

            <div className="admin-actions-section">
              <h2>Handlinger</h2>
              <div className="actions-card">
                <button
                  onClick={() => navigate(`/admin/payments/${batch.id}`)}
                  className="action-btn"
                >
                  <DollarSignIcon /> Se betalinger ({batch.customerCount})
                </button>
                <button
                  onClick={() => alert('I den færdige løsning: Download rapport for batchen')}
                  className="action-btn"
                >
                  <BarChart3Icon /> Download rapport
                </button>
                <button
                  onClick={handleDeleteBatch}
                  className="action-btn danger"
                >
                  <TrashIcon /> Slet batch
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
