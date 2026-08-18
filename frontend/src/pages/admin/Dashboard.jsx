import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDashboardStats } from '../../redux/slices/adminSlice'
import {
  Users,
  Building,
  UserCheck,
  Shield,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  TrendingDown,
  Wallet,
} from 'lucide-react'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { dashboardStats, loading } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(getDashboardStats())
  }, [dispatch])

  if (loading || !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { cards, recentActivities } = dashboardStats

  const statCards = [
    { icon: Users, label: 'Total Residents', value: cards.totalResidents, color: 'bg-blue-500' },
    { icon: Building, label: 'Total Flats', value: cards.totalFlats, color: 'bg-purple-500' },
    { icon: UserCheck, label: 'Occupied Flats', value: cards.occupiedFlats, color: 'bg-green-500' },
    { icon: Building, label: 'Vacant Flats', value: cards.vacantFlats, color: 'bg-orange-500' },
    { icon: Shield, label: 'Visitors Today', value: cards.visitorsToday, color: 'bg-cyan-500' },
    { icon: FileText, label: 'Pending Complaints', value: cards.pendingComplaints, color: 'bg-red-500' },
    { icon: DollarSign, label: 'Paid Maintenance', value: cards.paidMaintenance, color: 'bg-emerald-500' },
    { icon: Clock, label: 'Pending Maintenance', value: cards.pendingMaintenance, color: 'bg-yellow-500' },
    { icon: DollarSign, label: 'Total Collected', value: `₹${(cards.totalCollected || 0).toLocaleString()}`, color: 'bg-green-600' },
    { icon: TrendingDown, label: 'Total Expenses', value: `₹${(cards.totalExpenses || 0).toLocaleString()}`, color: 'bg-red-600' },
    { icon: Wallet, label: 'Society Fund', value: `₹${(cards.societyFund || 0).toLocaleString()}`, color: 'bg-primary-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Visitors
          </h3>
          <div className="space-y-3">
            {recentActivities.visitors?.slice(0, 5).map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">{visitor.flatNo}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  visitor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  visitor.status === 'exited' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {visitor.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Complaints
          </h3>
          <div className="space-y-3">
            {recentActivities.complaints?.slice(0, 5).map((complaint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{complaint.title}</p>
                  <p className="text-sm text-gray-500">{complaint.residentId?.flatNo}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  complaint.status === 'pending' ? 'bg-red-100 text-red-800' :
                  complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
