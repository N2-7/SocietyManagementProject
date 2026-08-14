import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getResidentDashboard } from '../../redux/slices/residentSlice'
import {
  User,
  FileText,
  DollarSign,
  Bell,
  Calendar,
  Users,
  Car,
  Building,
  AlertCircle,
} from 'lucide-react'

const ResidentDashboard = () => {
  const dispatch = useDispatch()
  const { dashboard, loading } = useSelector((state) => state.resident)

  useEffect(() => {
    dispatch(getResidentDashboard())
  }, [dispatch])

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { user, complaints, pendingComplaints, maintenance, totalPendingAmount, notices, events, visitors, parking, amenityBookings } = dashboard

  const quickStats = [
    { icon: FileText, label: 'My Complaints', value: complaints.length, color: 'bg-blue-500' },
    { icon: AlertCircle, label: 'Pending', value: pendingComplaints, color: 'bg-red-500' },
    { icon: DollarSign, label: 'Pending Dues', value: `₹${totalPendingAmount}`, color: 'bg-yellow-500' },
    { icon: Users, label: 'My Visitors', value: visitors.length, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || 'Resident'}
          </h1>
          <p className="text-gray-500">Flat {user?.flatNo}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
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

      {/* Recent Notices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notices
          </h3>
        </div>
        <div className="space-y-3">
          {notices?.slice(0, 3).map((notice, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{notice.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{notice.description}</p>
                </div>
                {notice.isPinned && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(notice.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Complaints */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Complaints
          </h3>
          <div className="space-y-3">
            {complaints?.slice(0, 3).map((complaint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{complaint.title}</p>
                  <p className="text-sm text-gray-500">{complaint.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  complaint.status === 'pending' ? 'bg-red-100 text-red-800' :
                  complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {events?.slice(0, 3).map((event, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{event.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Bills */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Maintenance Bills
          </h3>
          <div className="space-y-3">
            {maintenance?.slice(0, 3).map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {bill.month} {bill.year}
                  </p>
                  <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">₹{bill.amount}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Visitors */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Visitors
          </h3>
          <div className="space-y-3">
            {visitors?.slice(0, 3).map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">{visitor.purpose}</p>
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
      </div>

      {/* Parking & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5" />
            My Parking
          </h3>
          {parking ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Slot: {parking.slotNo}</p>
              <p className="text-sm text-gray-500">Vehicle: {parking.vehicleNumber}</p>
              <p className="text-sm text-gray-500">Type: {parking.vehicleType}</p>
            </div>
          ) : (
            <p className="text-gray-500">No parking assigned</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Amenity Bookings
          </h3>
          <div className="space-y-3">
            {amenityBookings?.slice(0, 3).map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.name}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResidentDashboard
