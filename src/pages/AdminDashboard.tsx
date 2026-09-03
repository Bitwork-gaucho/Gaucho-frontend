import { useEffect, useState } from 'react'
import { Batch, Order } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

export default function AdminDashboard() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const { logout } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [b, o] = await Promise.all([
      mockApi.getBatches(),
      mockApi.getAllOrders()
    ])
    setBatches(b)
    setOrders(o)
  }

  return (
    <div>
      <Header onLogout={logout} />
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Admin Dashboard</h1>

        <section style={{ marginBottom: '40px' }}>
          <h2>Batches ({batches.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Progress</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Price/kg</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '12px' }}>{b.meatType}</td>
                  <td style={{ padding: '12px' }}>{b.status}</td>
                  <td style={{ padding: '12px' }}>{Math.round((b.soldKilos / b.targetKilos) * 100)}%</td>
                  <td style={{ padding: '12px' }}>{b.pricePerKg} kr.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Orders ({orders.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Batch</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Kilos</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{o.id}</td>
                  <td style={{ padding: '12px' }}>{o.userEmail}</td>
                  <td style={{ padding: '12px' }}>{o.batchId}</td>
                  <td style={{ padding: '12px' }}>{o.kilos}</td>
                  <td style={{ padding: '12px' }}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
