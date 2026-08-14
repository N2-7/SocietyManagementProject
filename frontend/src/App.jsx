import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminLayout from './layouts/AdminLayout'
import ResidentLayout from './layouts/ResidentLayout'
import GuardLayout from './layouts/GuardLayout'
import AdminDashboard from './pages/admin/Dashboard'
import Residents from './pages/admin/Residents'
import Visitors from './pages/admin/Visitors'
import Complaints from './pages/admin/Complaints'
import Maintenance from './pages/admin/Maintenance'
import Notices from './pages/admin/Notices'
import Events from './pages/admin/Events'
import Parking from './pages/admin/Parking'
import Amenities from './pages/admin/Amenities'
import SecurityLogs from './pages/admin/SecurityLogs'
import Expenses from './pages/admin/Expenses'
import NOCManagement from './pages/admin/NOC'
import ResidentDashboard from './pages/resident/Dashboard'
import ResidentComplaints from './pages/resident/Complaints'
import ResidentMaintenance from './pages/resident/Maintenance'
import ResidentVisitors from './pages/resident/Visitors'
import ResidentAmenities from './pages/resident/Amenities'
import ResidentParking from './pages/resident/Parking'
import ResidentNotices from './pages/resident/Notices'
import ResidentEvents from './pages/resident/Events'
import ResidentNOC from './pages/resident/NOC'
import ResidentExpenses from './pages/resident/Expenses'
import GuardDashboard from './pages/guard/Dashboard'
import VisitorEntry from './pages/guard/VisitorEntry'
import GuardSecurityLogs from './pages/guard/SecurityLogs'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="notices" element={<Notices />} />
        <Route path="events" element={<Events />} />
        <Route path="parking" element={<Parking />} />
        <Route path="amenities" element={<Amenities />} />
        <Route path="security" element={<SecurityLogs />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="noc" element={<NOCManagement />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Resident Routes */}
      <Route
        path="/resident/*"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ResidentDashboard />} />
        <Route path="complaints" element={<ResidentComplaints />} />
        <Route path="maintenance" element={<ResidentMaintenance />} />
        <Route path="expenses" element={<ResidentExpenses />} />
        <Route path="visitors" element={<ResidentVisitors />} />
        <Route path="amenities" element={<ResidentAmenities />} />
        <Route path="parking" element={<ResidentParking />} />
        <Route path="notices" element={<ResidentNotices />} />
        <Route path="events" element={<ResidentEvents />} />
        <Route path="noc" element={<ResidentNOC />} />
        <Route index element={<Navigate to="/resident/dashboard" replace />} />
      </Route>
      
      {/* Guard Routes */}
      <Route
        path="/guard/*"
        element={
          <ProtectedRoute allowedRoles={['guard']}>
            <GuardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<GuardDashboard />} />
        <Route path="visitor-entry" element={<VisitorEntry />} />
        <Route path="logs" element={<GuardSecurityLogs />} />
        <Route index element={<Navigate to="/guard/dashboard" replace />} />
      </Route>
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
