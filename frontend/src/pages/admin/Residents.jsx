import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getResidents, getPendingRequests, approveResident, blockResident, deleteResident } from '../../redux/slices/adminSlice'
import toast from 'react-hot-toast'
import { Users, Search, Check, X, Trash2, Edit, Filter } from 'lucide-react'

const Residents = () => {
  const dispatch = useDispatch()
  const { residents, pendingRequests, loading } = useSelector((state) => state.admin)
  const [showPending, setShowPending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    if (showPending) {
      dispatch(getPendingRequests())
    } else {
      dispatch(getResidents({ search: searchTerm, status: statusFilter, residentType: typeFilter }))
    }
  }, [dispatch, showPending, searchTerm, statusFilter, typeFilter])

  const handleApprove = async (id) => {
    try {
      await dispatch(approveResident(id))
      toast.success('Resident approved successfully')
      dispatch(getPendingRequests())
    } catch (error) {
      toast.error('Failed to approve resident')
    }
  }

  const handleBlock = async (id) => {
    try {
      await dispatch(blockResident(id))
      toast.success('Resident status updated')
      dispatch(getResidents({ search: searchTerm, status: statusFilter, residentType: typeFilter }))
    } catch (error) {
      toast.error('Failed to update resident status')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        await dispatch(deleteResident(id))
        toast.success('Resident deleted successfully')
        dispatch(getResidents({ search: searchTerm, status: statusFilter, residentType: typeFilter }))
      } catch (error) {
        toast.error('Failed to delete resident')
      }
    }
  }

  const data = showPending ? pendingRequests : residents

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {showPending ? 'Pending Requests' : 'Residents Management'}
        </h1>
        <button
          onClick={() => setShowPending(!showPending)}
          className="btn btn-secondary"
        >
          {showPending ? 'View All Residents' : 'View Pending Requests'}
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search residents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          {!showPending && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input md:w-48"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input md:w-48"
              >
                <option value="">All Types</option>
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Flat No</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No residents found
                </td>
              </tr>
            ) : (
              data.map((resident) => (
                <tr key={resident._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {resident.name?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{resident.name}</span>
                    </div>
                  </td>
                  <td>{resident.flatNo}</td>
                  <td>{resident.email}</td>
                  <td>{resident.phone}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resident.residentType === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {resident.residentType === 'owner' ? 'Owner' : 'Tenant'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resident.status === 'active' ? 'bg-green-100 text-green-800' :
                      resident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {resident.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {showPending ? (
                        <button
                          onClick={() => handleApprove(resident._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleBlock(resident._id)}
                            className={`p-2 rounded-lg ${
                              resident.status === 'blocked' 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={resident.status === 'blocked' ? 'Unblock' : 'Block'}
                          >
                            {resident.status === 'blocked' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(resident._id)}
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
    </div>
  )
}

export default Residents
