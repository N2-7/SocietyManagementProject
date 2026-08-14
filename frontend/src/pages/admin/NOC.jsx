import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getNOCRequests, approveNOC, rejectNOC, deleteNOC } from '../../redux/slices/adminSlice'
import { Search, Check, X, Download, FileText, Calendar, Filter, AlertTriangle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const NOCManagement = () => {
  const dispatch = useDispatch()
  const { nocRequests, loading } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [nocTypeFilter, setNocTypeFilter] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedNOC, setSelectedNOC] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  useEffect(() => {
    dispatch(getNOCRequests({ search: searchTerm, status: statusFilter, nocType: nocTypeFilter }))
  }, [dispatch, searchTerm, statusFilter, nocTypeFilter])

  const handleApprove = async () => {
    try {
      const result = await dispatch(approveNOC({ id: selectedNOC._id, adminRemarks: remarks, expiryDate }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('NOC approved successfully')
        setShowApproveModal(false)
        setSelectedNOC(null)
        setRemarks('')
        setExpiryDate('')
        dispatch(getNOCRequests({ search: searchTerm, status: statusFilter, nocType: nocTypeFilter }))
      } else {
        toast.error(result.payload || 'Failed to approve NOC')
      }
    } catch (error) {
      toast.error('Failed to approve NOC')
    }
  }

  const handleReject = async () => {
    try {
      const result = await dispatch(rejectNOC({ id: selectedNOC._id, adminRemarks: remarks }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('NOC rejected successfully')
        setShowRejectModal(false)
        setSelectedNOC(null)
        setRemarks('')
        dispatch(getNOCRequests({ search: searchTerm, status: statusFilter, nocType: nocTypeFilter }))
      } else {
        toast.error(result.payload || 'Failed to reject NOC')
      }
    } catch (error) {
      toast.error('Failed to reject NOC')
    }
  }

  const handleDelete = async (nocId) => {
    if (window.confirm('Are you sure you want to delete this NOC request? This action cannot be undone.')) {
      try {
        const result = await dispatch(deleteNOC(nocId))
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('NOC request deleted successfully')
          dispatch(getNOCRequests({ search: searchTerm, status: statusFilter, nocType: nocTypeFilter }))
        } else {
          toast.error(result.payload || 'Failed to delete NOC')
        }
      } catch (error) {
        toast.error('Failed to delete NOC')
      }
    }
  }

  const handleDownload = async (nocId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/noc/${nocId}/download`, {
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
          NOC Management
        </h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by flat number or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input md:w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={nocTypeFilter}
              onChange={(e) => setNocTypeFilter(e.target.value)}
              className="input md:w-40"
            >
              <option value="">All Types</option>
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
        </div>
      </div>

      {/* NOC Requests Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Resident</th>
              <th>Flat No</th>
              <th>NOC Type</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Pending Dues</th>
              <th>Certificate No</th>
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
            ) : nocRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No NOC requests found
                </td>
              </tr>
            ) : (
              nocRequests.map((noc) => (
                <tr key={noc._id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{noc.residentId?.name}</p>
                      <p className="text-sm text-gray-500">{noc.residentId?.email}</p>
                    </div>
                  </td>
                  <td className="font-medium">{noc.flatNo}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {noc.nocType === 'other' ? noc.otherType : formatNOCType(noc.nocType)}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {noc.purpose}
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(noc.status)}`}>
                      {noc.status}
                    </span>
                  </td>
                  <td>{new Date(noc.createdAt).toLocaleDateString()}</td>
                  <td>
                    {noc.pendingMaintenanceCount > 0 ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          ₹{noc.pendingMaintenanceAmount} ({noc.pendingMaintenanceCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm">Clear</span>
                    )}
                  </td>
                  <td className="font-mono text-sm">
                    {noc.certificateNumber || '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {noc.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedNOC(noc)
                              setShowApproveModal(true)
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNOC(noc)
                              setShowRejectModal(true)
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {noc.status === 'approved' && (
                        <button
                          onClick={() => handleDownload(noc._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Download Certificate"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(noc._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete NOC"
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

      {/* Approve Modal */}
      {showApproveModal && selectedNOC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Approve NOC Request
              </h2>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Resident:</span> {selectedNOC.residentId?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Flat:</span> {selectedNOC.flatNo}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {selectedNOC.nocType === 'other' ? selectedNOC.otherType : formatNOCType(selectedNOC.nocType)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Purpose:</span> {selectedNOC.purpose}
                </p>
              </div>
              
              {selectedNOC.pendingMaintenanceCount > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Pending Maintenance Dues
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        This resident has ₹{selectedNOC.pendingMaintenanceAmount} in pending dues ({selectedNOC.pendingMaintenanceCount} month(s)). 
                        You can still approve the NOC, but consider requesting payment first.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Add any remarks..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="btn btn-primary flex-1"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedNOC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Reject NOC Request
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Resident:</span> {selectedNOC.residentId?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Flat:</span> {selectedNOC.flatNo}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {selectedNOC.nocType === 'other' ? selectedNOC.otherType : formatNOCType(selectedNOC.nocType)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Purpose:</span> {selectedNOC.purpose}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason (Required)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Please provide reason for rejection..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="btn btn-danger flex-1"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NOCManagement
