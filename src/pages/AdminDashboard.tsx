import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
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
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <Header onLogout={logout} />

      <main className="admin-main">
        <div className="admin-container">
          <h1>Admin Dashboard</h1>

          <div className="dashboard-summary">
            <div className="summary-card">
              <div className="summary-value">{batches.length}</div>
              <div className="summary-label">Active Batches</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{orders.length}</div>
              <div className="summary-label">Total Orders</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{paidCount}</div>
              <div className="summary-label">Paid Orders</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{totalRevenue} kr.</div>
              <div className="summary-label">Total Revenue</div>
            </div>
          </div>

          <div className="admin-actions">
            <button onClick={() => alert('Create batch: In production, this would show a form')} className="action-btn">
              ➕ Create New Batch
            </button>
            <button onClick={() => navigate('/admin/pickup-scanner')} className="action-btn">
              📱 Pickup Scanner
            </button>
            <button onClick={() => navigate('/batches')} className="action-btn">
              📦 View Customer Batches
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
                    <th>Name</th>
                    <th>Meat Type</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Customers</th>
                    <th>Price/kg</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => {
                    const batchOrders = orders.filter(o => o.batchId === batch.id)
                    return (
                      <tr key={batch.id}>
                        <td><strong>{batch.name}</strong></td>
                        <td>{batch.meatType}</td>
                        <td><span className={`badge badge-${batch.status.toLowerCase()}`}>{batch.status}</span></td>
                        <td>{Math.round((batch.soldKilos / batch.targetKilos) * 100)}%</td>
                        <td>{batch.customerCount}</td>
                        <td>{batch.pricePerKg} kr.</td>
                        <td className="action-links">
                          <button
                            onClick={() => navigate(`/admin/batch/${batch.id}`)}
                            className="link-btn"
                          >
                            Manage
                          </button>
                          {batchOrders.length > 0 && (
                            <button
                              onClick={() => navigate(`/admin/payments/${batch.id}`)}
                              className="link-btn"
                            >
                              Payments
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
              <h2>Recent Orders ({orders.length})</h2>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Email</th>
                    <th>Batch</th>
                    <th>Kilos</th>
                    <th>Amount</th>
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
                      <td className="amount">{order.amount} kr.</td>
                      <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
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
