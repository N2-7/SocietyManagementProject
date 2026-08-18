import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getComplaints, updateComplaint, deleteComplaint } from '../../redux/slices/adminSlice'
import toast from 'react-hot-toast'
import { Search, Filter, Edit, Trash2, MessageSquare } from 'lucide-react'

const Complaints = () => {
  const dispatch = useDispatch()
  const { complaints, loading } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    dispatch(getComplaints({ 
      search: searchTerm, 
      status: statusFilter, 
      priority: priorityFilter,
      category: categoryFilter 
    }))
  }, [dispatch, searchTerm, statusFilter, priorityFilter, categoryFilter])

  const handleUpdate = async (id, updates) => {
    try {
      await dispatch(updateComplaint({ id, ...updates }))
      toast.success('Complaint updated successfully')
      setShowModal(false)
      dispatch(getComplaints({ 
        search: searchTerm, 
        status: statusFilter, 
        priority: priorityFilter,
        category: categoryFilter 
      }))
    } catch (error) {
      toast.error('Failed to update complaint')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await dispatch(deleteComplaint(id))
        toast.success('Complaint deleted successfully')
        dispatch(getComplaints({ 
          search: searchTerm, 
          status: statusFilter, 
          priority: priorityFilter,
          category: categoryFilter 
        }))
      } catch (error) {
        toast.error('Failed to delete complaint')
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Complaints Management
      </h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
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
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="cleaning">Cleaning</option>
            <option value="security">Security</option>
            <option value="noise">Noise</option>
            <option value="parking">Parking</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="card overflow-x-auto hidden md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Resident</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="font-medium">{complaint.title}</td>
                  <td>{complaint.residentId?.name} ({complaint.residentId?.flatNo})</td>
                  <td className="capitalize">{complaint.category}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      complaint.status === 'pending' ? 'bg-red-100 text-red-800' :
                      complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowModal(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Update"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Comments"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Card View - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No complaints found
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{complaint.title}</p>
                  <p className="text-sm text-gray-500">{complaint.residentId?.name} ({complaint.residentId?.flatNo})</p>
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{complaint.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900 dark:text-white">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint)
                    setShowModal(true)
                  }}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Update
                </button>
                <button
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(complaint._id)}
                  className="btn btn-danger flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={selectedComplaint.status}
                  onChange={(e) => setSelectedComplaint({...selectedComplaint, status: e.target.value})}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={selectedComplaint.priority}
                  onChange={(e) => setSelectedComplaint({...selectedComplaint, priority: e.target.value})}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Remark</label>
                <textarea
                  value={selectedComplaint.adminRemark || ''}
                  onChange={(e) => setSelectedComplaint({...selectedComplaint, adminRemark: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(selectedComplaint._id, {
                  status: selectedComplaint.status,
                  priority: selectedComplaint.priority,
                  adminRemark: selectedComplaint.adminRemark
                })}
                className="btn btn-primary"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Complaints
