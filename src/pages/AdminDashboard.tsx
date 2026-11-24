import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { PlusIcon, SmartphoneIcon, PackageIcon } from '../components/Icons'
import { BatchStatusBadge } from '../components/BatchStatus'
import { ORDER_STATUS, fillInfo, formatKr } from '../utils/batchStatus'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<Batch[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [b, o] = await Promise.all([
        mockApi.getBatches(),
        mockApi.getAllOrders()
      ])
      setBatches(b)
      setOrders(o)
    } finally {
      setLoading(false)
    }
  }

  const paidCount = orders.filter(o => o.status === 'PAID').length
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const totalRevenue = orders
    .filter(o => o.status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0)

  if (loading) {
    return (
      <div>
        <Header onLogout={logout} />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Indlæser admin-oversigt…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <Header onLogout={logout} />

      <main className="admin-main">
        <div className="admin-container">
          <h1>Admin-oversigt</h1>

          <div className="dashboard-summary">
            <div className="summary-card">
              <div className="summary-value">{batches.length}</div>
              <div className="summary-label">Batches</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{orders.length}</div>
              <div className="summary-label">Ordrer i alt</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{paidCount}</div>
              <div className="summary-label">Betalte ordrer</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatKr(totalRevenue)}</div>
              <div className="summary-label">Omsætning i alt</div>
            </div>
          </div>

          <div className="admin-actions">
            <button onClick={() => alert('Opret batch: I den færdige løsning vises en formular her')} className="action-btn">
              <PlusIcon /> Opret ny batch
            </button>
            <button onClick={() => navigate('/admin/pickup-scanner')} className="action-btn">
              <SmartphoneIcon /> Afhentningsscanner
            </button>
            <button onClick={() => navigate('/batches')} className="action-btn">
              <PackageIcon /> Se batches som kunde
            </button>
          </div>

          <section className="admin-section">
            <div className="section-header">
              <h2>Batches ({batches.length})</h2>
            </div>
            <div className="batches-table">
              <table>
                <thead>
                  <tr>
                    <th>Navn</th>
                    <th>Kødtype</th>
                    <th>Status</th>
                    <th>Solgt</th>
                    <th>Kunder</th>
                    <th>Pris/kg</th>
                    <th>Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => {
                    const batchOrders = orders.filter(o => o.batchId === batch.id)
                    return (
                      <tr key={batch.id}>
                        <td><strong>{batch.name}</strong></td>
                        <td>{batch.meatType}</td>
                        <td><BatchStatusBadge status={batch.status} /></td>
                        <td>{batch.soldKilos}/{batch.targetKilos} kg ({fillInfo(batch).percent} %)</td>
                        <td>{batch.customerCount}</td>
                        <td>{formatKr(batch.pricePerKg)}</td>
                        <td className="action-links">
                          <button
                            onClick={() => navigate(`/admin/batch/${batch.id}`)}
                            className="link-btn"
                          >
                            Administrér
                          </button>
                          {batchOrders.length > 0 && (
                            <button
                              onClick={() => navigate(`/admin/payments/${batch.id}`)}
                              className="link-btn"
                            >
                              Betalinger
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <div className="section-header">
              <h2>Seneste ordrer ({orders.length})</h2>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Ordrenr.</th>
                    <th>E-mail</th>
                    <th>Batch</th>
                    <th>Kilo</th>
                    <th>Beløb</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(order => (
                    <tr key={order.id}>
                      <td><code>{order.id.substring(0, 12)}...</code></td>
                      <td>{order.userEmail}</td>
                      <td>{order.batchId}</td>
                      <td>{order.kilos} kg</td>
                      <td className="amount">{formatKr(order.amount)}</td>
                      <td><span className={`badge badge-${order.status.toLowerCase()}`}>{ORDER_STATUS[order.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
