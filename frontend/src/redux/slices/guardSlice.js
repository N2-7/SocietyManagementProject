import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/guard` : '/api/guard'

// Get dashboard
export const getGuardDashboard = createAsyncThunk(
  'guard/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

// Visitor entry
export const visitorEntry = createAsyncThunk(
  'guard/visitorEntry',
  async (visitorData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/visitor-entry`, visitorData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record visitor entry')
    }
  }
)

// Visitor exit
export const visitorExit = createAsyncThunk(
  'guard/visitorExit',
  async (visitorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/visitor-exit/${visitorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record visitor exit')
    }
  }
)

// Search flat
export const searchFlat = createAsyncThunk(
  'guard/searchFlat',
  async (flatNo, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/search-flat/${flatNo}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search flat')
    }
  }
)

// Get visitor history
export const getVisitorHistory = createAsyncThunk(
  'guard/getVisitorHistory',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/visitor-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visitor history')
    }
  }
)

// Approve visitor
export const approveVisitor = createAsyncThunk(
  'guard/approveVisitor',
  async (visitorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/visitors/${visitorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve visitor')
    }
  }
)

// Decline visitor
export const declineVisitor = createAsyncThunk(
  'guard/declineVisitor',
  async (visitorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/visitors/${visitorId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decline visitor')
    }
  }
)

// Get security logs
export const getSecurityLogs = createAsyncThunk(
  'guard/getSecurityLogs',
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

// Security check-in
export const securityCheckIn = createAsyncThunk(
  'guard/securityCheckIn',
  async (checkInData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/security-checkin`, checkInData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in')
    }
  }
)

// Security check-out
export const securityCheckOut = createAsyncThunk(
  'guard/securityCheckOut',
  async (checkOutData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/security-checkout`, checkOutData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out')
    }
  }
)

const initialState = {
  dashboard: null,
  searchResult: null,
  visitorHistory: [],
  securityLogs: [],
  loading: false,
  error: null,
}

const guardSlice = createSlice({
  name: 'guard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSearchResult: (state) => {
      state.searchResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGuardDashboard.pending, (state) => {
        state.loading = true
      })
      .addCase(getGuardDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
      })
      .addCase(getGuardDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(searchFlat.fulfilled, (state, action) => {
        state.searchResult = action.payload
      })
      .addCase(getVisitorHistory.fulfilled, (state, action) => {
        state.visitorHistory = action.payload.data
      })
      .addCase(approveVisitor.fulfilled, (state, action) => {
        // Remove visitor from pre-registered list
        if (state.dashboard && state.dashboard.preRegistered) {
          state.dashboard.preRegistered = state.dashboard.preRegistered.filter(
            v => v._id !== action.payload._id
          )
        }
      })
      .addCase(declineVisitor.fulfilled, (state, action) => {
        // Remove visitor from pre-registered list
        if (state.dashboard && state.dashboard.preRegistered) {
          state.dashboard.preRegistered = state.dashboard.preRegistered.filter(
            v => v._id !== action.payload._id
          )
        }
      })
      .addCase(getSecurityLogs.fulfilled, (state, action) => {
        state.securityLogs = action.payload.data
      })
      .addCase(securityCheckIn.pending, (state) => {
        state.loading = true
      })
      .addCase(securityCheckIn.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(securityCheckIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(securityCheckOut.pending, (state) => {
        state.loading = true
      })
      .addCase(securityCheckOut.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(securityCheckOut.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearSearchResult } = guardSlice.actions
export default guardSlice.reducer
