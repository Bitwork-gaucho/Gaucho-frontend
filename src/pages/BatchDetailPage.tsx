import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Batch } from '../types'
import { mockApi } from '../services/mockApi'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const { session, logout } = useAuth()

  useEffect(() => {
    if (!id) return
    loadBatch()
  }, [id])

  async function loadBatch() {
    try {
      const data = await mockApi.getBatchById(id!)
      setBatch(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Loading...</p></div>
  if (!batch) return <div><Header onLogout={logout} /><p style={{ padding: '40px' }}>Batch not found</p></div>

  return (
    <div>
      <Header onLogout={logout} />
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>{batch.meatType}</h1>
        <p>{batch.description}</p>
        <p>Price: {batch.pricePerKg} kr./kg</p>
        <p>Progress: {Math.round((batch.soldKilos / batch.targetKilos) * 100)}%</p>
        <p>Status: {batch.status}</p>
        {!session && <p><a href="/login">Log in to purchase</a></p>}
      </div>
    </div>
  )
}
