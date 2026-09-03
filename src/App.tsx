import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './styles/globals.css'

// Pages
import HomePage from './pages/HomePage'
import BatchesPage from './pages/BatchesPage'
import BatchDetailPage from './pages/BatchDetailPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import OrderHistoryPage from './pages/OrderHistoryPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentConfirmationPage from './pages/PaymentConfirmationPage'
import ShipmentTrackingPage from './pages/ShipmentTrackingPage'
import AdminBatchDetail from './pages/AdminBatchDetail'
import AdminPaymentOverview from './pages/AdminPaymentOverview'
import AdminPickupScanner from './pages/AdminPickupScanner'

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
      <Route path="/orders" element={session ? <OrderHistoryPage /> : <Navigate to="/login" />} />
      <Route path="/checkout/:batchId" element={session ? <CheckoutPage /> : <Navigate to="/login" />} />
      <Route path="/payment-confirmation/:receiptId" element={session ? <PaymentConfirmationPage /> : <Navigate to="/login" />} />
      <Route path="/tracking/:batchId" element={session ? <ShipmentTrackingPage /> : <Navigate to="/login" />} />
      <Route path="/admin" element={session?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
      <Route path="/admin/batch/:id" element={session?.role === 'admin' ? <AdminBatchDetail /> : <Navigate to="/" />} />
      <Route path="/admin/payments/:batchId" element={session?.role === 'admin' ? <AdminPaymentOverview /> : <Navigate to="/" />} />
      <Route path="/admin/pickup-scanner" element={session?.role === 'admin' ? <AdminPickupScanner /> : <Navigate to="/" />} />
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
