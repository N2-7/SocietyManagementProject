import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getNOCRequests, createNOCRequest } from '../../redux/slices/residentSlice'
import { FileText, Plus, Download, X, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const ResidentNOC = () => {
  const dispatch = useDispatch()
  const { nocRequests, loading } = useSelector((state) => state.resident)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    nocType: 'gas-connection',
    otherType: '',
    purpose: '',
    documentUrl: ''
  })

  useEffect(() => {
    dispatch(getNOCRequests())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(createNOCRequest(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('NOC request submitted successfully')
        setShowAddModal(false)
        setFormData({
          nocType: 'gas-connection',
          otherType: '',
          purpose: '',
          documentUrl: ''
        })
        dispatch(getNOCRequests())
      } else {
        toast.error(result.payload || 'Failed to submit NOC request')
      }
    } catch (error) {
      toast.error('Failed to submit NOC request')
    }
  }

  const handleDownload = async (nocId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/resident/noc/${nocId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to download NOC')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `NOC_${nocId}.pdf`
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('NOC downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download NOC')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatNOCType = (type) => {
    return type.replace('-', ' ').toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          NOC Requests
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Request NOC
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              NOC Request Information
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Submit your NOC request for various purposes like gas connection, electricity, bank, property sale, etc. Processing time is typically 2-3 working days.
            </p>
          </div>
        </div>
      </div>

      {/* NOC Requests List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My NOC Requests
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : nocRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No NOC requests found</p>
            <p className="text-sm mt-2">Click "Request NOC" to submit your first request</p>
          </div>
        ) : (
          <div className="space-y-4">
            {nocRequests.map((noc) => (
              <div key={noc._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(noc.status)}`}>
                        {noc.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(noc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {noc.nocType === 'other' ? noc.otherType : formatNOCType(noc.nocType)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {noc.purpose}
                    </p>
                    {noc.certificateNumber && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Certificate No:</span> {noc.certificateNumber}
                      </p>
                    )}
                    {noc.adminRemarks && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Admin Remarks:</span> {noc.adminRemarks}
                        </p>
                      </div>
                    )}
                  </div>
                  {noc.status === 'approved' && (
                    <button
                      onClick={() => handleDownload(noc._id)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Download Certificate"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add NOC Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Request NOC
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NOC Type
                </label>
                <select
                  value={formData.nocType}
                  onChange={(e) => setFormData({ ...formData, nocType: e.target.value })}
                  className="input"
                  required
                >
                  <option value="gas-connection">Gas Connection</option>
                  <option value="electricity">Electricity</option>
                  <option value="bank">Bank</option>
                  <option value="telephone">Telephone</option>
                  <option value="internet">Internet</option>
                  <option value="property-sale">Property Sale</option>
                  <option value="rent-agreement">Rent Agreement</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {formData.nocType === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specify Type
                  </label>
                  <input
                    type="text"
                    value={formData.otherType}
                    onChange={(e) => setFormData({ ...formData, otherType: e.target.value })}
                    className="input"
                    required
                    placeholder="e.g., Society Transfer, etc."
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input"
                  required
                  rows="3"
                  placeholder="Please describe the purpose for which you need the NOC"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supporting Document URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  className="input"
                  placeholder="https://example.com/document.pdf"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResidentNOC
