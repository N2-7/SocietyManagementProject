import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getVisitors, deleteVisitor, getSecurityLogs } from '../../redux/slices/adminSlice'
import { Search, Calendar, Filter, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Visitors = () => {
  const dispatch = useDispatch()
  const { visitors, loading } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    dispatch(getVisitors({ search: searchTerm, status: statusFilter, date: dateFilter }))
  }, [dispatch, searchTerm, statusFilter, dateFilter])

  const handleDeleteVisitor = async (visitorId) => {
    if (window.confirm('Are you sure you want to delete this visitor? This will also delete all related security logs. This action cannot be undone.')) {
      try {
        await dispatch(deleteVisitor(visitorId)).unwrap()
        toast.success('Visitor and related security logs deleted successfully')
        dispatch(getVisitors({ search: searchTerm, status: statusFilter, date: dateFilter }))
        dispatch(getSecurityLogs({})) // Also refresh security logs
      } catch (error) {
        toast.error(error || 'Failed to delete visitor')
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Visitors Management
      </h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="exited">Exited</option>
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="card overflow-x-auto hidden md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Visitor Name</th>
              <th>Phone</th>
              <th>Flat No</th>
              <th>Purpose</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No visitors found
                </td>
              </tr>
            ) : (
              visitors.map((visitor) => (
                <tr key={visitor._id}>
                  <td className="font-medium">{visitor.visitorName}</td>
                  <td>{visitor.phone}</td>
                  <td>{visitor.flatNo}</td>
                  <td className="capitalize">{visitor.purpose}</td>
                  <td>{new Date(visitor.entryTime).toLocaleString()}</td>
                  <td>
                    {visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : '-'}
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      visitor.status === 'approved' ? 'bg-green-100 text-green-800' :
                      visitor.status === 'exited' ? 'bg-gray-100 text-gray-800' :
                      visitor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteVisitor(visitor._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete visitor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card View - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : visitors.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No visitors found
          </div>
        ) : (
          visitors.map((visitor) => (
            <div key={visitor._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{visitor.visitorName}</p>
                  <p className="text-sm text-gray-500">{visitor.phone}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  visitor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  visitor.status === 'exited' ? 'bg-gray-100 text-gray-800' :
                  visitor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {visitor.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Flat No:</span>
                  <span className="text-gray-900 dark:text-white">{visitor.flatNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purpose:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{visitor.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entry:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(visitor.entryTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Exit:</span>
                  <span className="text-gray-900 dark:text-white">{visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleDeleteVisitor(visitor._id)}
                  className="w-full btn btn-danger flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Visitor
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Visitors
