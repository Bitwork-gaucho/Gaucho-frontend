import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import AuthGate from '../containers/AuthGate'
import LandingPage from '../features/landing/LandingPage'
import BatchListPage from '../features/batches/BatchListPage'
import BatchDetailPage from '../features/batches/BatchDetailPage'
import LoginPage from '../features/auth/LoginPage'
import AdminBatchList from '../features/admin/AdminBatchList'
import AdminBatchDetail from '../features/admin/AdminBatchDetail'
import AdminScanner from '../features/admin/AdminScanner'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/batches" element={<BatchListPage />} />
          <Route path="/batches/:id" element={<BatchDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/batches"
            element={
              <AuthGate requireAdmin>
                <AdminBatchList />
              </AuthGate>
            }
          />
          <Route
            path="/admin/batches/:id"
            element={
              <AuthGate requireAdmin>
                <AdminBatchDetail />
              </AuthGate>
            }
          />
          <Route
            path="/admin/scanner"
            element={
              <AuthGate requireAdmin>
                <AdminScanner />
              </AuthGate>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
