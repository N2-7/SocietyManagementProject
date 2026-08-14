import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getResidentComplaints, createComplaint } from '../../redux/slices/residentSlice'
import toast from 'react-hot-toast'
import { Plus, FileText, AlertCircle } from 'lucide-react'

const Complaints = () => {
  const dispatch = useDispatch()
  const { complaints, loading } = useSelector((state) => state.resident)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    dispatch(getResidentComplaints())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      priority: formData.get('priority'),
    }

    try {
      await dispatch(createComplaint(data))
      toast.success('Complaint submitted successfully')
      setShowModal(false)
      dispatch(getResidentComplaints())
      e.target.reset()
    } catch (error) {
      toast.error('Failed to submit complaint')
    }
  }

  const statusColors = {
    'pending': 'bg-red-100 text-red-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'resolved': 'bg-green-100 text-green-800',
    'rejected': 'bg-gray-100 text-gray-800',
  }

  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Complaints
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No complaints found
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {complaint.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      priorityColors[complaint.priority] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {complaint.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{complaint.category}</span>
                    <span>•</span>
                    <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  {complaint.adminRemark && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Admin Remark:</strong> {complaint.adminRemark}
                      </p>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  statusColors[complaint.status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {complaint.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              File a Complaint
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input"
                  placeholder="Enter complaint title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select name="category" required className="input">
                  <option value="">Select category</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="noise">Noise</option>
                  <option value="parking">Parking</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select name="priority" required className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  className="input"
                  rows="4"
                  placeholder="Describe your complaint in detail"
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
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Complaints
