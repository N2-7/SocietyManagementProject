import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSecurityLogs, securityCheckIn, securityCheckOut } from '../../redux/slices/guardSlice'
import { History, Filter, LogIn, LogOut, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

const SecurityLogs = () => {
  const dispatch = useDispatch()
  const { securityLogs: logs, loading } = useSelector((state) => state.guard)
  const [activityFilter, setActivityFilter] = useState('')
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [checkInData, setCheckInData] = useState({ shift: 'morning', notes: '' })
  const [checkOutData, setCheckOutData] = useState({ notes: '' })

  useEffect(() => {
    dispatch(getSecurityLogs({ activity: activityFilter }))
  }, [dispatch, activityFilter])

  const handleCheckIn = async (e) => {
    e.preventDefault()
    try {
      await dispatch(securityCheckIn(checkInData)).unwrap()
      toast.success('Check-in recorded successfully')
      setShowCheckInModal(false)
      setCheckInData({ shift: 'morning', notes: '' })
      dispatch(getSecurityLogs({ activity: activityFilter }))
    } catch (error) {
      toast.error(error || 'Failed to check in')
    }
  }

  const handleCheckOut = async (e) => {
    e.preventDefault()
    try {
      await dispatch(securityCheckOut(checkOutData)).unwrap()
      toast.success('Check-out recorded successfully')
      setShowCheckOutModal(false)
      setCheckOutData({ notes: '' })
      dispatch(getSecurityLogs({ activity: activityFilter }))
    } catch (error) {
      toast.error(error || 'Failed to check out')
    }
  }

  const activityColors = {
    'visitor-entry': 'bg-green-100 text-green-800',
    'visitor-exit': 'bg-gray-100 text-gray-800',
    'delivery': 'bg-blue-100 text-blue-800',
    'cab': 'bg-purple-100 text-purple-800',
    'emergency': 'bg-red-100 text-red-800',
    'patrol': 'bg-yellow-100 text-yellow-800',
    'security-checkin': 'bg-emerald-100 text-emerald-800',
    'security-checkout': 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Logs
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckInModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Check In
          </button>
          <button
            onClick={() => setShowCheckOutModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="">All Activities</option>
            <option value="visitor-entry">Visitor Entry</option>
            <option value="visitor-exit">Visitor Exit</option>
            <option value="delivery">Delivery</option>
            <option value="cab">Cab/Taxi</option>
            <option value="emergency">Emergency</option>
            <option value="patrol">Patrol</option>
            <option value="security-checkin">Security Check-in</option>
            <option value="security-checkout">Security Check-out</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No security logs found
          </div>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    log.activity === 'emergency' ? 'bg-red-100' :
                    log.activity === 'patrol' ? 'bg-yellow-100' :
                    log.activity === 'security-checkin' ? 'bg-emerald-100' :
                    log.activity === 'security-checkout' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    {log.activity === 'security-checkin' ? (
                      <LogIn className="w-5 h-5 text-gray-600" />
                    ) : log.activity === 'security-checkout' ? (
                      <LogOut className="w-5 h-5 text-gray-600" />
                    ) : (
                      <History className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        activityColors[log.activity] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.activity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.time).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {log.description}
                    </p>
                    {log.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        Location: {log.location}
                      </p>
                    )}
                    {(log.activity === 'security-checkin' || log.activity === 'security-checkout') && (
                      <div className="mt-2 space-y-1">
                        {log.guardName && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>Guard: {log.guardName}</span>
                          </div>
                        )}
                        {log.shift && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="capitalize">Shift: {log.shift}</span>
                          </div>
                        )}
                        {log.checkInTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <LogIn className="w-4 h-4" />
                            <span>Check-in: {new Date(log.checkInTime).toLocaleString()}</span>
                          </div>
                        )}
                        {log.checkOutTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <LogOut className="w-4 h-4" />
                            <span>Check-out: {new Date(log.checkOutTime).toLocaleString()}</span>
                          </div>
                        )}
                        {log.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            Notes: {log.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-600" />
              Security Check-in
            </h3>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Shift</label>
                <select
                  value={checkInData.shift}
                  onChange={(e) => setCheckInData({ ...checkInData, shift: e.target.value })}
                  className="input"
                >
                  <option value="morning">Morning (6AM - 2PM)</option>
                  <option value="afternoon">Afternoon (2PM - 10PM)</option>
                  <option value="night">Night (10PM - 6AM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={checkInData.notes}
                  onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCheckInModal(false)
                  setCheckInData({ shift: 'morning', notes: '' })
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckIn}
                className="btn btn-primary"
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-orange-600" />
              Security Check-out
            </h3>
            <form onSubmit={handleCheckOut} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={checkOutData.notes}
                  onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Any handover notes or observations..."
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCheckOutModal(false)
                  setCheckOutData({ notes: '' })
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                className="btn btn-primary"
              >
                Check Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityLogs
