import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaintenance, generateMaintenanceBills, deleteMaintenance, updateMaintenance, applyLatePenalty, getPenaltyLogs } from '../../redux/slices/adminSlice'
import { Search, Calendar, Download, DollarSign, X, AlertTriangle, History, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ReceiptModal from '../../components/ReceiptModal'

const Maintenance = () => {
  const dispatch = useDispatch()
  const { maintenance, loading, penaltyLogs } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPenaltyModal, setShowPenaltyModal] = useState(false)
  const [showPenaltyLogs, setShowPenaltyLogs] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null)
  const [penaltyFormData, setPenaltyFormData] = useState({
    penaltyAmount: '',
    penaltyType: 'fixed'
  })
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    ownerAmount: '',
    tenantAmount: '',
    dueDate: ''
  })
  const [editFormData, setEditFormData] = useState({
    baseAmount: 0,
    latePenalty: 0,
    otherCharges: 0,
    otherChargesDescription: '',
    dueDate: '',
    paymentStatus: 'pending'
  })

  useEffect(() => {
    dispatch(getMaintenance({ search: searchTerm, status: statusFilter, month: monthFilter, year: yearFilter }))
  }, [dispatch, searchTerm, statusFilter, monthFilter, yearFilter])

  useEffect(() => {
    if (showPenaltyLogs) {
      dispatch(getPenaltyLogs({ search: searchTerm, month: monthFilter, year: yearFilter }))
    }
  }, [dispatch, showPenaltyLogs, searchTerm, monthFilter, yearFilter])

  const handleGenerateBills = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(generateMaintenanceBills(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Generated ${result.payload.data.billsCreated.length} bills successfully`)
        if (result.payload.data.billsSkipped.length > 0) {
          toast.info(`${result.payload.data.billsSkipped.length} bills skipped (already exist)`)
        }
        setShowGenerateModal(false)
        setFormData({
          month: '',
          year: new Date().getFullYear(),
          ownerAmount: '',
          tenantAmount: '',
          dueDate: ''
        })
        dispatch(getMaintenance({ search: searchTerm, status: statusFilter, month: monthFilter, year: yearFilter }))
      } else {
        toast.error(result.payload || 'Failed to generate bills')
      }
    } catch (error) {
      toast.error('Failed to generate bills')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await dispatch(deleteMaintenance(id))
        toast.success('Maintenance record deleted successfully')
        dispatch(getMaintenance({ search: searchTerm, status: statusFilter, month: monthFilter, year: yearFilter }))
      } catch (error) {
        toast.error('Failed to delete maintenance record')
      }
    }
  }

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setEditFormData({
      baseAmount: bill.baseAmount || bill.amount || 0,
      latePenalty: bill.latePenalty || 0,
      otherCharges: bill.otherCharges || 0,
      otherChargesDescription: bill.otherChargesDescription || '',
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
      paymentStatus: bill.paymentStatus || 'pending'
    })
    setShowEditModal(true)
  }

  const handleUpdateBill = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(updateMaintenance({ id: editingBill._id, ...editFormData }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Maintenance record updated successfully')
        setShowEditModal(false)
        setEditingBill(null)
        dispatch(getMaintenance({ search: searchTerm, status: statusFilter, month: monthFilter, year: yearFilter }))
      } else {
        toast.error(result.payload || 'Failed to update maintenance record')
      }
    } catch (error) {
      toast.error('Failed to update maintenance record')
    }
  }

  const calculateTotal = () => {
    return (parseFloat(editFormData.baseAmount) || 0) + 
           (parseFloat(editFormData.latePenalty) || 0) + 
           (parseFloat(editFormData.otherCharges) || 0)
  }

  const handleApplyPenalty = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(applyLatePenalty(penaltyFormData))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Applied late penalty to ${result.payload.data.updated} overdue bills`)
        setShowPenaltyModal(false)
        setPenaltyFormData({
          penaltyAmount: '',
          penaltyType: 'fixed'
        })
        dispatch(getMaintenance({ search: searchTerm, status: statusFilter, month: monthFilter, year: yearFilter }))
      } else {
        toast.error(result.payload || 'Failed to apply late penalty')
      }
    } catch (error) {
      toast.error('Failed to apply late penalty')
    }
  }

  const handleDownloadReceipt = async (billId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/maintenance/${billId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to download receipt')
        return
      }

      // Create blob from response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = `maintenance_receipt_${billId}.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Receipt downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download receipt')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Maintenance Management
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPenaltyLogs(!showPenaltyLogs)}
            className={`btn flex items-center gap-2 ${showPenaltyLogs ? 'btn-primary' : 'btn-secondary'}`}
          >
            <History className="w-4 h-4" />
            {showPenaltyLogs ? 'View Bills' : 'View Penalty Logs'}
          </button>
          {!showPenaltyLogs && (
            <>
              <button
                onClick={() => setShowPenaltyModal(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Apply Late Penalty
              </button>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="btn btn-primary"
              >
                Generate Bill
              </button>
            </>
          )}
        </div>
      </div>

      {/* Generate Bill Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Generate Maintenance Bills
              </h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateBills} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input"
                  required
                  min="2020"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.ownerAmount}
                  onChange={(e) => setFormData({ ...formData, ownerAmount: e.target.value })}
                  className="input"
                  required
                  min="0"
                  placeholder="Enter owner amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenant Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.tenantAmount}
                  onChange={(e) => setFormData({ ...formData, tenantAmount: e.target.value })}
                  className="input"
                  required
                  min="0"
                  placeholder="Enter tenant amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Generate Bills
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && editingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Maintenance Bill - {editingBill.flatNo}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBill} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.baseAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, baseAmount: e.target.value })}
                    className="input"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Late Penalty (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.latePenalty}
                    onChange={(e) => setEditFormData({ ...editFormData, latePenalty: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Other Charges (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.otherCharges}
                    onChange={(e) => setEditFormData({ ...editFormData, otherCharges: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                    className="input"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Other Charges Description
                </label>
                <input
                  type="text"
                  value={editFormData.otherChargesDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, otherChargesDescription: e.target.value })}
                  className="input"
                  placeholder="e.g., Water charges, Parking fee"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
              
              {/* Total Amount Display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Base Amount:</span>
                  <span className="font-semibold">₹{parseFloat(editFormData.baseAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Late Penalty:</span>
                  <span className="font-semibold text-red-600">₹{parseFloat(editFormData.latePenalty || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Other Charges:</span>
                  <span className="font-semibold text-blue-600">₹{parseFloat(editFormData.otherCharges || 0).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Amount:</span>
                    <span className="text-lg font-bold text-primary-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Update Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Late Penalty Modal */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Apply Late Penalty
              </h2>
              <button
                onClick={() => setShowPenaltyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplyPenalty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Penalty Type
                </label>
                <select
                  value={penaltyFormData.penaltyType}
                  onChange={(e) => setPenaltyFormData({ ...penaltyFormData, penaltyType: e.target.value })}
                  className="input"
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {penaltyFormData.penaltyType === 'fixed' ? 'Penalty Amount (₹)' : 'Penalty Percentage (%)'}
                </label>
                <input
                  type="number"
                  value={penaltyFormData.penaltyAmount}
                  onChange={(e) => setPenaltyFormData({ ...penaltyFormData, penaltyAmount: e.target.value })}
                  className="input"
                  required
                  min="0"
                  step={penaltyFormData.penaltyType === 'fixed' ? '0.01' : '0.1'}
                  placeholder={penaltyFormData.penaltyType === 'fixed' ? 'e.g., 100' : 'e.g., 10'}
                />
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  This will apply late penalty to all overdue bills (past due date) that don't already have a penalty. The payment status will be changed to "overdue".
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPenaltyModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Apply Penalty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by flat number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          {!showPenaltyLogs && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          )}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input"
          >
            <option value="">All Months</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
          <input
            type="number"
            placeholder="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Penalty Logs Table */}
      {showPenaltyLogs ? (
        <div className="card overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Late Penalty History
          </h2>
          <table className="table">
            <thead>
              <tr>
                <th>Flat No</th>
                <th>Month</th>
                <th>Year</th>
                <th>Base Amount</th>
                <th>Penalty Amount</th>
                <th>Penalty Type</th>
                <th>Total Amount</th>
                <th>Days Overdue</th>
                <th>Applied By</th>
                <th>Applied Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : penaltyLogs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No penalty logs found
                  </td>
                </tr>
              ) : (
                penaltyLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="font-medium">{log.flatNo}</td>
                    <td>{log.month}</td>
                    <td>{log.year}</td>
                    <td className="font-semibold">₹{log.baseAmount.toFixed(2)}</td>
                    <td className="text-red-600 font-semibold">₹{log.penaltyAmount.toFixed(2)}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.penaltyType === 'fixed' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {log.penaltyType === 'fixed' ? 'Fixed' : `${log.penaltyType === 'percentage' ? 'Percentage' : ''}`}
                      </span>
                    </td>
                    <td className="font-bold text-primary-600">₹{log.totalAmount.toFixed(2)}</td>
                    <td className="text-orange-600 font-semibold">{log.daysOverdue} days</td>
                    <td>{log.appliedBy}</td>
                    <td>{new Date(log.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Maintenance Bills Table */
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Flat No</th>
                <th>Type</th>
                <th>Month</th>
                <th>Year</th>
                <th>Base Amount</th>
                <th>Late Penalty</th>
                <th>Other Charges</th>
                <th>Total</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : maintenance.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                maintenance.map((bill) => (
                  <tr key={bill._id}>
                    <td className="font-medium">{bill.flatNo}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bill.residentType === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {bill.residentType === 'owner' ? 'Owner' : 'Tenant'}
                      </span>
                    </td>
                    <td>{bill.month}</td>
                    <td>{bill.year}</td>
                    <td className="font-semibold">₹{(bill.baseAmount || bill.amount || 0).toFixed(2)}</td>
                    <td className="text-red-600 font-semibold">₹{(bill.latePenalty || 0).toFixed(2)}</td>
                    <td className="text-blue-600">₹{(bill.otherCharges || 0).toFixed(2)}</td>
                    <td className="font-bold text-primary-600">₹{(bill.totalAmount || bill.amount || 0).toFixed(2)}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {bill.paymentStatus === 'paid' && (
                          <>
                            <button 
                              onClick={() => setSelectedBillForReceipt(bill)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" 
                              title="View Receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadReceipt(bill._id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                              title="Download Receipt PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Edit"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedBillForReceipt && (
        <ReceiptModal
          bill={selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
          onDownload={(billId) => handleDownloadReceipt(billId)}
        />
      )}
    </div>
  )
}

export default Maintenance
