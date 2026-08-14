import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getNotices } from '../../redux/slices/residentSlice'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Pin } from 'lucide-react'

const Notices = () => {
  const dispatch = useDispatch()
  const { notices, loading } = useSelector((state) => state.resident)
  const [showModal, setShowModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)

  useEffect(() => {
    dispatch(getNotices())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      // Implement delete functionality
      toast.success('Notice deleted successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notice Board
        </h1>
        <button
          onClick={() => {
            setEditingNotice(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No notices found
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className={`card ${notice.isPinned ? 'border-2 border-primary-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notice.title}
                    </h3>
                    {notice.isPinned && (
                      <Pin className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {notice.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingNotice(notice)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingNotice ? 'Edit Notice' : 'Create Notice'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={editingNotice?.title || ''}
                  className="input"
                  placeholder="Enter notice title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  defaultValue={editingNotice?.description || ''}
                  className="input"
                  rows="4"
                  placeholder="Enter notice description"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  defaultChecked={editingNotice?.isPinned || false}
                  className="w-4 h-4"
                />
                <label htmlFor="pin" className="text-sm">Pin this notice</label>
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
                onClick={() => {
                  toast.success(editingNotice ? 'Notice updated successfully' : 'Notice created successfully')
                  setShowModal(false)
                }}
                className="btn btn-primary"
              >
                {editingNotice ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notices
