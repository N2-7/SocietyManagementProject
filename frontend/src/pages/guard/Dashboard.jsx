import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getGuardDashboard, approveVisitor, declineVisitor, visitorExit } from '../../redux/slices/guardSlice'
import toast from 'react-hot-toast'
import {
  Users,
  Shield,
  Clock,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

const GuardDashboard = () => {
  const dispatch = useDispatch()
  const { dashboard, loading } = useSelector((state) => state.guard)

  useEffect(() => {
    dispatch(getGuardDashboard())
  }, [dispatch])

  const handleApprove = async (visitorId) => {
    try {
      await dispatch(approveVisitor(visitorId))
      toast.success('Visitor approved successfully')
      dispatch(getGuardDashboard())
    } catch (error) {
      toast.error('Failed to approve visitor')
    }
  }

  const handleDecline = async (visitorId) => {
    try {
      await dispatch(declineVisitor(visitorId))
      toast.success('Visitor declined successfully')
      dispatch(getGuardDashboard())
    } catch (error) {
      toast.error('Failed to decline visitor')
    }
  }

  const handleExit = async (visitorId) => {
    try {
      await dispatch(visitorExit(visitorId))
      toast.success('Visitor exit recorded successfully')
      dispatch(getGuardDashboard())
    } catch (error) {
      toast.error('Failed to record visitor exit')
    }
  }

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { visitorsToday, activeVisitors, todayLogs, preRegistered } = dashboard

  const quickStats = [
    { icon: Users, label: 'Visitors Today', value: visitorsToday.length, color: 'bg-blue-500' },
    { icon: Shield, label: 'Active Visitors', value: activeVisitors.length, color: 'bg-green-500' },
    { icon: Clock, label: 'Pending Requests', value: preRegistered.length, color: 'bg-purple-500' },
    { icon: History, label: 'Today\'s Logs', value: todayLogs.length, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Guard Dashboard
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleString()}</span>
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

      {/* Pre-Registered Visitors */}
      {preRegistered.length > 0 && (
        <div className="card border-2 border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Pending Visitor Requests
          </h3>
          <div className="space-y-3">
            {preRegistered.map((visitor) => (
              <div key={visitor._id} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">Flat: {visitor.flatNo}</p>
                  <p className="text-sm text-gray-500">Purpose: {visitor.purpose}</p>
                  <p className="text-sm text-gray-500">Phone: {visitor.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(visitor._id)}
                    className="btn btn-primary btn-sm flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(visitor._id)}
                    className="btn btn-danger btn-sm flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Visitors */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Active Visitors (Inside Society)
        </h3>
        <div className="space-y-3">
          {activeVisitors.length > 0 ? (
            activeVisitors.map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">Flat: {visitor.flatNo}</p>
                  <p className="text-sm text-gray-500">Entry: {new Date(visitor.entryTime).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => handleExit(visitor._id)}
                  className="btn btn-danger btn-sm flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Exit
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No active visitors</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Visitors */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Today's Visitors
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {visitorsToday.map((visitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">Flat: {visitor.flatNo}</p>
                </div>
                <div className="flex items-center gap-2">
                  {visitor.status === 'exited' ? (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    visitor.status === 'exited' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {visitor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Security Logs */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Today's Security Logs
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayLogs.map((log, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  {log.activity === 'visitor-entry' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {log.activity === 'visitor-exit' && <XCircle className="w-4 h-4 text-gray-500" />}
                  {log.activity === 'emergency' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {log.activity === 'patrol' && <Shield className="w-4 h-4 text-blue-500" />}
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{log.activity}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">{log.description}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(log.time).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuardDashboard
