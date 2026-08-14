import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getResidentVisitors, preRegisterVisitor } from '../../redux/slices/residentSlice'
import toast from 'react-hot-toast'
import { Plus, Users, Clock } from 'lucide-react'

const Visitors = () => {
  const dispatch = useDispatch()
  const { visitors, loading } = useSelector((state) => state.resident)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    dispatch(getResidentVisitors())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      visitorName: formData.get('visitorName'),
      phone: formData.get('phone'),
      vehicleNumber: formData.get('vehicleNumber'),
      purpose: formData.get('purpose'),
      expectedDate: formData.get('expectedDate'),
      expectedTime: formData.get('expectedTime'),
    }

    try {
      await dispatch(preRegisterVisitor(data))
      toast.success('Visitor pre-registered successfully')
      setShowModal(false)
      dispatch(getResidentVisitors())
      e.target.reset()
    } catch (error) {
      toast.error('Failed to pre-register visitor')
    }
  }

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'exited': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Visitors
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Pre-register Visitor
        </button>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : visitors.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No visitors found
          </div>
        ) : (
          visitors.map((visitor) => (
            <div key={visitor._id} className={`card ${visitor.preRegistered ? 'border-2 border-purple-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {visitor.visitorName}
                      </h3>
                      {visitor.preRegistered && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Pre-registered
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{visitor.phone}</span>
                      {visitor.vehicleNumber && <span>• {visitor.vehicleNumber}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="capitalize">{visitor.purpose}</span>
                      {visitor.preRegistered && visitor.expectedDate && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Expected: {new Date(visitor.expectedDate).toLocaleDateString()} {visitor.entryTime && new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </>
                      )}
                      {!visitor.preRegistered && visitor.entryTime && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(visitor.entryTime).toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    statusColors[visitor.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {visitor.status}
                  </span>
                  {visitor.preRegistered && visitor.status === 'pending' && (
                    <span className="text-sm text-purple-600">
                      Awaiting Guard Approval
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pre-register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Pre-register Visitor
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Visitor Name</label>
                <input
                  type="text"
                  name="visitorName"
                  required
                  className="input"
                  placeholder="Enter visitor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="input"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  className="input"
                  placeholder="Enter vehicle number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <select name="purpose" required className="input">
                  <option value="">Select purpose</option>
                  <option value="personal">Personal Visit</option>
                  <option value="delivery">Delivery</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expected Date</label>
                <input
                  type="date"
                  name="expectedDate"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expected Time</label>
                <input
                  type="time"
                  name="expectedTime"
                  required
                  className="input"
                />
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
                  Pre-register Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Visitors
