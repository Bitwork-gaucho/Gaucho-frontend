import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles/globals.css'

// Pages
import HomePage from './pages/HomePage'
import BatchesPage from './pages/BatchesPage'
import BatchDetailPage from './pages/BatchDetailPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'

function AppRoutes() {
  const { loading, session } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/batches" element={<BatchesPage />} />
      <Route path="/batch/:id" element={<BatchDetailPage />} />
      <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/admin" element={session?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
