import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAdminAmenities, updateAmenity, deleteAmenity } from '../../redux/slices/adminSlice'
import toast from 'react-hot-toast'
import { Check, X, Calendar, Clock, Building, Trash2 } from 'lucide-react'

const Amenities = () => {
  const dispatch = useDispatch()
  const { amenities, loading } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(getAdminAmenities())
  }, [dispatch])

  const handleUpdate = async (id, status) => {
    try {
      await dispatch(updateAmenity({ id, status })).unwrap()
      toast.success(`Booking ${status} successfully`)
    } catch (error) {
      toast.error(error || 'Failed to update booking')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await dispatch(deleteAmenity(id)).unwrap()
        toast.success('Booking deleted successfully')
      } catch (error) {
        toast.error(error || 'Failed to delete booking')
      }
    }
  }

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-gray-100 text-gray-800',
  }

  const amenityNames = {
    'gym': 'Gym',
    'pool': 'Swimming Pool',
    'clubhouse': 'Clubhouse',
    'tennis-court': 'Tennis Court',
    'badminton-court': 'Badminton Court',
    'community-hall': 'Community Hall',
    'garden': 'Garden',
    'playground': 'Playground',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Amenity Bookings
      </h1>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <select className="input md:w-48">
            <option value="">All Amenities</option>
            <option value="gym">Gym</option>
            <option value="pool">Pool</option>
            <option value="clubhouse">Clubhouse</option>
            <option value="tennis-court">Tennis Court</option>
            <option value="badminton-court">Badminton Court</option>
            <option value="community-hall">Community Hall</option>
            <option value="garden">Garden</option>
            <option value="playground">Playground</option>
          </select>
          <select className="input md:w-48">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Resident</th>
              <th>Amenity</th>
              <th>Booking Date</th>
              <th>Time Slot</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            ) : amenities.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No amenity bookings found
                </td>
              </tr>
            ) : (
              amenities.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    {booking.residentId?.name} ({booking.residentId?.flatNo})
                  </td>
                  <td className="capitalize flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {amenityNames[booking.name] || booking.name}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {booking.timeSlot}
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdate(booking._id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdate(booking._id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Amenities
