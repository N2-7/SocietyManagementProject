import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSecurityLogs, deleteSecurityLog, getVisitors } from '../../redux/slices/adminSlice'
import { History, Filter, LogIn, LogOut, Clock, User, Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const SecurityLogs = () => {
  const dispatch = useDispatch()
  const { securityLogs, loading } = useSelector((state) => state.admin)
  const [activityFilter, setActivityFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(getSecurityLogs({ activity: activityFilter, page }))
  }, [dispatch, activityFilter, page])

  const handleDeleteLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this security log? This action cannot be undone.')) {
      try {
        await dispatch(deleteSecurityLog(logId)).unwrap()
        toast.success('Security log deleted successfully')
        dispatch(getSecurityLogs({ activity: activityFilter, page }))
        dispatch(getVisitors({})) // Also refresh visitors list if related visitor was deleted
      } catch (error) {
        toast.error(error || 'Failed to delete security log')
      }
    }
  }

  const activityColors = {
    'visitor-entry': 'bg-green-100 text-green-800',
    'visitor-exit': 'bg-gray-100 text-gray-800',
    'visitor-rejected': 'bg-red-100 text-red-800',
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
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Monitors all security activities</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={activityFilter}
            onChange={(e) => {
              setActivityFilter(e.target.value)
              setPage(1)
            }}
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
            <option value="visitor-rejected">Visitor Rejected</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !securityLogs || securityLogs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No security logs found
          </div>
        ) : (
          securityLogs.map((log) => (
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
                    {log.guardId && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Shield className="w-4 h-4" />
                        <span>Guard: {log.guardId.name || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLog(log._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete log"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {securityLogs && securityLogs.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default SecurityLogs