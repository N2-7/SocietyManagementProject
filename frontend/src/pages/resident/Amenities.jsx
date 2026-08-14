import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAmenities, bookAmenity, cancelAmenity } from '../../redux/slices/residentSlice'
import toast from 'react-hot-toast'
import { Plus, Calendar, Clock, Building, X } from 'lucide-react'

const Amenities = () => {
  const dispatch = useDispatch()
  const { amenityBookings, loading } = useSelector((state) => state.resident)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    dispatch(getAmenities())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const amenityId = formData.get('amenityId')
    const amenity = amenities.find(a => a.id === amenityId)
    
    const data = {
      name: amenity.id, // Send the ID (gym, pool, etc.) not the display name
      bookingDate: formData.get('bookingDate'),
      timeSlot: formData.get('timeSlot'),
    }

    try {
      await dispatch(bookAmenity(data)).unwrap()
      toast.success('Amenity booked successfully')
      setShowModal(false)
      e.target.reset()
    } catch (error) {
      toast.error(error || 'Failed to book amenity')
    }
  }

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await dispatch(cancelAmenity(id)).unwrap()
        toast.success('Booking cancelled successfully')
      } catch (error) {
        toast.error(error || 'Failed to cancel booking')
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

  const amenities = [
    { id: 'gym', name: 'Gym', icon: '🏋️' },
    { id: 'pool', name: 'Swimming Pool', icon: '🏊' },
    { id: 'clubhouse', name: 'Clubhouse', icon: '🏠' },
    { id: 'tennis-court', name: 'Tennis Court', icon: '🎾' },
    { id: 'badminton-court', name: 'Badminton Court', icon: '🏸' },
    { id: 'community-hall', name: 'Community Hall', icon: '🏛️' },
    { id: 'garden', name: 'Garden', icon: '🌳' },
    { id: 'playground', name: 'Playground', icon: '🎠' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Amenity Bookings
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Book Amenity
        </button>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : amenityBookings.length === 0 ? (
          <div className="col-span-full card text-center py-8 text-gray-500">
            No amenity bookings found
          </div>
        ) : (
          amenityBookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-full text-2xl">
                    {amenities.find(a => a.id === booking.name)?.icon || '🏢'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {amenities.find(a => a.id === booking.name)?.name || booking.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{booking.timeSlot}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Book Amenity
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Amenity</label>
                <select name="amenityId" required className="input">
                  <option value="">Select amenity</option>
                  {amenities.map((amenity) => (
                    <option key={amenity.id} value={amenity.id}>
                      {amenity.icon} {amenity.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Booking Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Slot</label>
                <select name="timeSlot" required className="input">
                  <option value="">Select time slot</option>
                  <option value="06:00-08:00">06:00 - 08:00</option>
                  <option value="08:00-10:00">08:00 - 10:00</option>
                  <option value="10:00-12:00">10:00 - 12:00</option>
                  <option value="12:00-14:00">12:00 - 14:00</option>
                  <option value="14:00-16:00">14:00 - 16:00</option>
                  <option value="16:00-18:00">16:00 - 18:00</option>
                  <option value="18:00-20:00">18:00 - 20:00</option>
                  <option value="20:00-22:00">20:00 - 22:00</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Book Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Amenities
