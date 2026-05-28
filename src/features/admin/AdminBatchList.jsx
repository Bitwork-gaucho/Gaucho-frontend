import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { batchService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import './AdminBatchList.css'

export default function AdminBatchList() {
  const { session, logout } = useAuth()
  const [activeBatches, setActiveBatches] = useState([])
  const [upcomingBatches, setUpcomingBatches] = useState([])
  const [completedBatches, setCompletedBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    Promise.all([
      batchService.getActiveBatches(),
      batchService.getUpcomingBatches(),
      batchService.getCompletedBatches(),
    ]).then(([active, upcoming, completed]) => {
      setActiveBatches(active)
      setUpcomingBatches(upcoming)
      setCompletedBatches(completed)
      setLoading(false)
    })
  }, [])

  const allBatches = [...activeBatches, ...upcomingBatches, ...completedBatches]

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/" className="admin-logo">Gaucho<em>.</em></Link>
        <span className="admin-badge">Admin</span>
        <Link data-testid="scanner-nav-link" to="/admin/scanner" className="admin-nav-link">Scanner</Link>
        <span className="admin-user">{session?.email}</span>
        <button className="admin-logout-btn" onClick={logout}>Log ud</button>
      </nav>

      <div data-testid="admin-batch-list" className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Batch Administration</h1>
          <button
            data-testid="create-batch-btn"
            className="create-batch-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + Opret ny batch
          </button>
        </div>

        {showCreateForm && (
          <div className="create-batch-form">
            <h3 className="create-form-title">Ny batch</h3>
            <p className="create-form-note">Opret ny batch (ikke implementeret i mock)</p>
            <button
              className="create-form-cancel"
              onClick={() => setShowCreateForm(false)}
            >
              Luk
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Henter batches...</div>
        ) : (
          <div className="admin-batches">
            <div className="admin-section-header">
              <span className="admin-count">{allBatches.length} batches i alt</span>
            </div>

            {allBatches.map(batch => (
              <div key={batch.id} data-testid="batch-card" className="admin-batch-card">
                <div className="admin-batch-info">
                  <div className="admin-batch-id">{batch.id}</div>
                  <div className="admin-batch-name">{batch.meatType || batch.name}</div>
                  <div className="admin-batch-meta">
                    <span className={`admin-batch-status status-${batch.status?.toLowerCase()}`}>
                      {batch.status}
                    </span>
                    <span className="admin-batch-progress">
                      {batch.soldKilos} / {batch.targetKilos} kg
                    </span>
                  </div>
                </div>
                <div className="admin-batch-actions">
                  <Link to={`/batches/${batch.id}`} className="admin-view-btn">
                    Vis
                  </Link>
                  <Link to={`/admin/batches/${batch.id}`} className="admin-manage-btn">
                    Administrer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
