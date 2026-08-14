import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getExpenseSummary, getExpenses, createExpense, updateExpense, deleteExpense } from '../../redux/slices/adminSlice'
import { DollarSign, TrendingDown, Wallet, Plus, X, Edit, Trash2, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const Expenses = () => {
  const dispatch = useDispatch()
  const { expenses, expenseSummary, loading } = useSelector((state) => state.admin)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'other',
    expenseDate: new Date().toISOString().split('T')[0]
  })

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'other',
    expenseDate: ''
  })

  useEffect(() => {
    dispatch(getExpenseSummary())
    dispatch(getExpenses({ category: categoryFilter, startDate, endDate }))
  }, [dispatch, categoryFilter, startDate, endDate])

  const handleCreateExpense = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(createExpense(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Expense created successfully')
        setShowAddModal(false)
        setFormData({
          title: '',
          description: '',
          amount: '',
          category: 'other',
          expenseDate: new Date().toISOString().split('T')[0]
        })
        dispatch(getExpenseSummary())
        dispatch(getExpenses({ category: categoryFilter, startDate, endDate }))
      } else {
        toast.error(result.payload || 'Failed to create expense')
      }
    } catch (error) {
      toast.error('Failed to create expense')
    }
  }

  const handleUpdateExpense = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(updateExpense({ id: editingExpense._id, ...editFormData }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Expense updated successfully')
        setShowEditModal(false)
        setEditingExpense(null)
        dispatch(getExpenseSummary())
        dispatch(getExpenses({ category: categoryFilter, startDate, endDate }))
      } else {
        toast.error(result.payload || 'Failed to update expense')
      }
    } catch (error) {
      toast.error('Failed to update expense')
    }
  }

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await dispatch(deleteExpense(id))
        toast.success('Expense deleted successfully')
        dispatch(getExpenseSummary())
        dispatch(getExpenses({ category: categoryFilter, startDate, endDate }))
      } catch (error) {
        toast.error('Failed to delete expense')
      }
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setEditFormData({
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0]
    })
    setShowEditModal(true)
  }

  const categoryColors = {
    maintenance: 'bg-blue-100 text-blue-800',
    utilities: 'bg-green-100 text-green-800',
    security: 'bg-purple-100 text-purple-800',
    cleaning: 'bg-cyan-100 text-cyan-800',
    repairs: 'bg-orange-100 text-orange-800',
    events: 'bg-pink-100 text-pink-800',
    administrative: 'bg-gray-100 text-gray-800',
    other: 'bg-yellow-100 text-yellow-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expense Tracker
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      {expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Collected</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(expenseSummary.totalCollected)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(expenseSummary.totalExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Society Fund</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                  {formatCurrency(expenseSummary.societyFund)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary-500">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {expenseSummary && expenseSummary.expensesByCategory && expenseSummary.expensesByCategory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expenseSummary.expensesByCategory.map((item) => (
              <div key={item._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item._id}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.total)}
                </p>
                <p className="text-xs text-gray-500">{item.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input md:w-40"
            >
              <option value="">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Utilities</option>
              <option value="security">Security</option>
              <option value="cleaning">Cleaning</option>
              <option value="repairs">Repairs</option>
              <option value="events">Events</option>
              <option value="administrative">Administrative</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Added By</th>
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
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense._id}>
                  <td className="font-medium">{expense.title}</td>
                  <td className="text-sm text-gray-500">{expense.description}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${categoryColors[expense.category]}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                  <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td>{expense.addedBy?.name || 'Admin'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Expense
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Electricity Bill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  required
                  rows="3"
                  placeholder="e.g., Monthly electricity bill for common areas"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="security">Security</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="repairs">Repairs</option>
                    <option value="events">Events</option>
                    <option value="administrative">Administrative</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="input"
                  required
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
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Expense
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="input"
                  required
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                    className="input"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="security">Security</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="repairs">Repairs</option>
                    <option value="events">Events</option>
                    <option value="administrative">Administrative</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expense Date
                </label>
                <input
                  type="date"
                  value={editFormData.expenseDate}
                  onChange={(e) => setEditFormData({ ...editFormData, expenseDate: e.target.value })}
                  className="input"
                  required
                />
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
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
