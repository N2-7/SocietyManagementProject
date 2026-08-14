import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getExpenses, getExpenseSummary } from '../../redux/slices/residentSlice'
import { DollarSign, TrendingDown, Wallet, Calendar, Filter } from 'lucide-react'

const ResidentExpenses = () => {
  const dispatch = useDispatch()
  const { expenses, expenseSummary, loading } = useSelector((state) => state.resident)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    dispatch(getExpenseSummary())
    dispatch(getExpenses({ category: categoryFilter, startDate, endDate }))
  }, [dispatch, categoryFilter, startDate, endDate])

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
          Society Expenses
        </h1>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Transparency in Managing Society 
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              View how society funds are being utilized for various expenses. This helps maintain transparency and accountability in society management.
            </p>
          </div>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResidentExpenses
