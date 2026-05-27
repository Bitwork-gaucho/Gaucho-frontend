import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthGate({ children, requireAdmin = false }) {
  const { session, loading } = useAuth()

  if (loading) return null

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && session.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return children
}
