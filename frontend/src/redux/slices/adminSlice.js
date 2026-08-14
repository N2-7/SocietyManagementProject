import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/admin` : '/api/admin'

// Get dashboard stats
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

// Get residents
export const getResidents = createAsyncThunk(
  'admin/getResidents',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/residents`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch residents')
    }
  }
)

// Get pending requests
export const getPendingRequests = createAsyncThunk(
  'admin/getPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests')
    }
  }
)

// Get visitors
export const getVisitors = createAsyncThunk(
  'admin/getVisitors',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visitors')
    }
  }
)

// Get complaints
export const getComplaints = createAsyncThunk(
  'admin/getComplaints',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints')
    }
  }
)

// Approve resident
export const approveResident = createAsyncThunk(
  'admin/approveResident',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/approve-resident/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve resident')
    }
  }
)

// Block resident
export const blockResident = createAsyncThunk(
  'admin/blockResident',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/block-resident/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block resident')
    }
  }
)

// Delete resident
export const deleteResident = createAsyncThunk(
  'admin/deleteResident',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/residents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resident')
    }
  }
)

// Update complaint
export const updateComplaint = createAsyncThunk(
  'admin/updateComplaint',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/complaints/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update complaint')
    }
  }
)

// Delete complaint
export const deleteComplaint = createAsyncThunk(
  'admin/deleteComplaint',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete complaint')
    }
  }
)

// Get maintenance
export const getMaintenance = createAsyncThunk(
  'admin/getMaintenance',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance')
    }
  }
)

// Generate maintenance bills
export const generateMaintenanceBills = createAsyncThunk(
  'admin/generateMaintenanceBills',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/maintenance/generate`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate maintenance bills')
    }
  }
)

// Update maintenance
export const updateMaintenance = createAsyncThunk(
  'admin/updateMaintenance',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/maintenance/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update maintenance')
    }
  }
)

// Delete maintenance
export const deleteMaintenance = createAsyncThunk(
  'admin/deleteMaintenance',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/maintenance/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete maintenance')
    }
  }
)

// Apply late penalty
export const applyLatePenalty = createAsyncThunk(
  'admin/applyLatePenalty',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/maintenance/apply-penalty`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply late penalty')
    }
  }
)

// Get penalty logs
export const getPenaltyLogs = createAsyncThunk(
  'admin/getPenaltyLogs',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/penalty-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch penalty logs')
    }
  }
)

// Get parking
export const getParking = createAsyncThunk(
  'admin/getParking',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/parking`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parking')
    }
  }
)

// Assign parking
export const assignParking = createAsyncThunk(
  'admin/assignParking',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/parking`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign parking')
    }
  }
)

// Update parking
export const updateParking = createAsyncThunk(
  'admin/updateParking',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/parking/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update parking')
    }
  }
)

// Delete parking
export const deleteParking = createAsyncThunk(
  'admin/deleteParking',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/parking/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete parking')
    }
  }
)

// Get security logs
export const getSecurityLogs = createAsyncThunk(
  'admin/getSecurityLogs',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/security-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch security logs')
    }
  }
)

// Delete security log
export const deleteSecurityLog = createAsyncThunk(
  'admin/deleteSecurityLog',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/security-logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete security log')
    }
  }
)

// Delete visitor
export const deleteVisitor = createAsyncThunk(
  'admin/deleteVisitor',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/visitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete visitor')
    }
  }
)

// Get expense summary
export const getExpenseSummary = createAsyncThunk(
  'admin/getExpenseSummary',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/expenses/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense summary')
    }
  }
)

// Get expenses
export const getExpenses = createAsyncThunk(
  'admin/getExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses')
    }
  }
)

// Create expense
export const createExpense = createAsyncThunk(
  'admin/createExpense',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/expenses`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense')
    }
  }
)

// Update expense
export const updateExpense = createAsyncThunk(
  'admin/updateExpense',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/expenses/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense')
    }
  }
)

// Delete expense
export const deleteExpense = createAsyncThunk(
  'admin/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense')
    }
  }
)

// Get NOC requests
export const getNOCRequests = createAsyncThunk(
  'admin/getNOCRequests',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/noc`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch NOC requests')
    }
  }
)

// Approve NOC
export const approveNOC = createAsyncThunk(
  'admin/approveNOC',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/noc/${id}/approve`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve NOC')
    }
  }
)

// Reject NOC
export const rejectNOC = createAsyncThunk(
  'admin/rejectNOC',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/noc/${id}/reject`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject NOC')
    }
  }
)

// Delete NOC
export const deleteNOC = createAsyncThunk(
  'admin/deleteNOC',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/noc/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete NOC')
    }
  }
)

// Get amenities
export const getAdminAmenities = createAsyncThunk(
  'admin/getAmenities',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/amenities`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch amenities')
    }
  }
)

// Update amenity
export const updateAmenity = createAsyncThunk(
  'admin/updateAmenity',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/amenities/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update amenity')
    }
  }
)

// Delete amenity
export const deleteAmenity = createAsyncThunk(
  'admin/deleteAmenity',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/amenities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete amenity')
    }
  }
)

const initialState = {
  dashboardStats: null,
  residents: [],
  pendingRequests: [],
  visitors: [],
  complaints: [],
  maintenance: [],
  parking: [],
  securityLogs: [],
  penaltyLogs: [],
  expenses: [],
  expenseSummary: null,
  nocRequests: [],
  amenities: [],
  loading: false,
  error: null,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getResidents.fulfilled, (state, action) => {
        state.residents = action.payload.data
      })
      .addCase(getPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload.data
      })
      .addCase(getVisitors.fulfilled, (state, action) => {
        state.visitors = action.payload.data
      })
      .addCase(getComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload.data
      })
      .addCase(getMaintenance.fulfilled, (state, action) => {
        state.maintenance = action.payload.data
      })
      .addCase(generateMaintenanceBills.fulfilled, (state, action) => {
        state.maintenance = [...state.maintenance, ...action.payload.data.billsCreated.map(b => ({ ...b, _id: b.billId, paymentStatus: 'pending' }))]
      })
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        const index = state.maintenance.findIndex(m => m._id === action.payload.data._id)
        if (index !== -1) {
          state.maintenance[index] = action.payload.data
        }
      })
      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.maintenance = state.maintenance.filter(m => m._id !== action.payload.id)
      })
      .addCase(applyLatePenalty.fulfilled, (state, action) => {
        // Refresh maintenance data after applying penalty
        // The bills will be updated with penalty and status changed to overdue
      })
      .addCase(getPenaltyLogs.fulfilled, (state, action) => {
        state.penaltyLogs = action.payload.data
      })
      .addCase(getParking.pending, (state) => {
        state.loading = true
      })
      .addCase(getParking.fulfilled, (state, action) => {
        state.loading = false
        state.parking = action.payload.data
      })
      .addCase(getParking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getSecurityLogs.pending, (state) => {
        state.loading = true
      })
      .addCase(getSecurityLogs.fulfilled, (state, action) => {
        state.loading = false
        state.securityLogs = action.payload.data
      })
      .addCase(getSecurityLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteSecurityLog.fulfilled, (state, action) => {
        state.securityLogs = state.securityLogs.filter(log => log._id !== action.payload.id)
      })
      .addCase(deleteVisitor.fulfilled, (state, action) => {
        state.visitors = state.visitors.filter(visitor => visitor._id !== action.payload.id)
      })
      .addCase(assignParking.fulfilled, (state, action) => {
        state.parking.push(action.payload.data)
      })
      .addCase(updateParking.fulfilled, (state, action) => {
        const index = state.parking.findIndex(p => p._id === action.payload.data._id)
        if (index !== -1) {
          state.parking[index] = action.payload.data
        }
      })
      .addCase(deleteParking.fulfilled, (state, action) => {
        state.parking = state.parking.filter(p => p._id !== action.payload.id)
      })
      .addCase(getExpenseSummary.pending, (state) => {
        state.loading = true
      })
      .addCase(getExpenseSummary.fulfilled, (state, action) => {
        state.loading = false
        state.expenseSummary = action.payload
      })
      .addCase(getExpenseSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getExpenses.pending, (state) => {
        state.loading = true
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload.data
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload.data)
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e._id === action.payload.data._id)
        if (index !== -1) {
          state.expenses[index] = action.payload.data
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload.id)
      })
      .addCase(getNOCRequests.pending, (state) => {
        state.loading = true
      })
      .addCase(getNOCRequests.fulfilled, (state, action) => {
        state.loading = false
        state.nocRequests = action.payload.data
      })
      .addCase(getNOCRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(approveNOC.fulfilled, (state, action) => {
        const index = state.nocRequests.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.nocRequests[index] = action.payload.data
        }
      })
      .addCase(rejectNOC.fulfilled, (state, action) => {
        const index = state.nocRequests.findIndex(n => n._id === action.payload.data._id)
        if (index !== -1) {
          state.nocRequests[index] = action.payload.data
        }
      })
      .addCase(deleteNOC.fulfilled, (state, action) => {
        state.nocRequests = state.nocRequests.filter(n => n._id !== action.payload.id)
      })
      .addCase(getAdminAmenities.pending, (state) => {
        state.loading = true
      })
      .addCase(getAdminAmenities.fulfilled, (state, action) => {
        state.loading = false
        state.amenities = action.payload.data
      })
      .addCase(getAdminAmenities.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        const index = state.amenities.findIndex(a => a._id === action.payload.data._id)
        if (index !== -1) {
          state.amenities[index] = action.payload.data
        }
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.amenities = state.amenities.filter(a => a._id !== action.payload.id)
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
