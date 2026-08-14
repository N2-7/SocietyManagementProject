import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '').replace(/^\/+/, '')}/api/resident` 
  : '/api/resident'

// Get dashboard
export const getResidentDashboard = createAsyncThunk(
  'resident/getDashboard',
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

// Get complaints
export const getResidentComplaints = createAsyncThunk(
  'resident/getComplaints',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints')
    }
  }
)

// Create complaint
export const createComplaint = createAsyncThunk(
  'resident/createComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/complaints`, complaintData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create complaint')
    }
  }
)

// Get maintenance
export const getResidentMaintenance = createAsyncThunk(
  'resident/getMaintenance',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance')
    }
  }
)

// Get notices
export const getNotices = createAsyncThunk(
  'resident/getNotices',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notices')
    }
  }
)

// Get events
export const getEvents = createAsyncThunk(
  'resident/getEvents',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events')
    }
  }
)

// Get visitors
export const getResidentVisitors = createAsyncThunk(
  'resident/getVisitors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/visitors`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch visitors')
    }
  }
)

// Pre-register visitor
export const preRegisterVisitor = createAsyncThunk(
  'resident/preRegisterVisitor',
  async (visitorData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/visitors`, visitorData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pre-register visitor')
    }
  }
)

// Get amenities
export const getAmenities = createAsyncThunk(
  'resident/getAmenities',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/amenities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch amenities')
    }
  }
)

// Book amenity
export const bookAmenity = createAsyncThunk(
  'resident/bookAmenity',
  async (bookingData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/amenities`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book amenity')
    }
  }
)

// Cancel amenity booking
export const cancelAmenity = createAsyncThunk(
  'resident/cancelAmenity',
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`${API_URL}/amenities/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

// Get parking
export const getParking = createAsyncThunk(
  'resident/getParking',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/parking`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parking')
    }
  }
)

// RSVP to event
export const rsvpEvent = createAsyncThunk(
  'resident/rsvpEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/events/${eventId}/rsvp`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to RSVP')
    }
  }
)

// Create payment order
export const createPaymentOrder = createAsyncThunk(
  'resident/createPaymentOrder',
  async (maintenanceId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/payment/create-order`, { maintenanceId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order')
    }
  }
)

// Verify payment
export const verifyPayment = createAsyncThunk(
  'resident/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/payment/verify`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment')
    }
  }
)

// Get NOC requests
export const getNOCRequests = createAsyncThunk(
  'resident/getNOCRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/noc`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch NOC requests')
    }
  }
)

// Create NOC request
export const createNOCRequest = createAsyncThunk(
  'resident/createNOCRequest',
  async (nocData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/noc`, nocData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create NOC request')
    }
  }
)

// Get expenses (read-only)
export const getExpenses = createAsyncThunk(
  'resident/getExpenses',
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

// Get expense summary (read-only)
export const getExpenseSummary = createAsyncThunk(
  'resident/getExpenseSummary',
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

const initialState = {
  dashboard: null,
  complaints: [],
  maintenance: [],
  notices: [],
  events: [],
  visitors: [],
  amenityBookings: [],
  parking: null,
  paymentOrder: null,
  nocRequests: [],
  expenses: [],
  expenseSummary: null,
  loading: false,
  error: null,
}

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getResidentDashboard.pending, (state) => {
        state.loading = true
      })
      .addCase(getResidentDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.dashboard = action.payload
      })
      .addCase(getResidentDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getResidentComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload
      })
      .addCase(getResidentMaintenance.fulfilled, (state, action) => {
        state.maintenance = action.payload
      })
      .addCase(getNotices.fulfilled, (state, action) => {
        state.notices = action.payload
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.events = action.payload
      })
      .addCase(getResidentVisitors.fulfilled, (state, action) => {
        state.visitors = action.payload
      })
      .addCase(preRegisterVisitor.fulfilled, (state, action) => {
        state.visitors.unshift(action.payload)
      })
      .addCase(getAmenities.fulfilled, (state, action) => {
        state.amenityBookings = action.payload
      })
      .addCase(bookAmenity.fulfilled, (state, action) => {
        state.amenityBookings.unshift(action.payload)
      })
      .addCase(cancelAmenity.fulfilled, (state, action) => {
        const index = state.amenityBookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.amenityBookings[index] = action.payload
        }
      })
      .addCase(getParking.pending, (state) => {
        state.loading = true
      })
      .addCase(getParking.fulfilled, (state, action) => {
        state.loading = false
        state.parking = action.payload
      })
      .addCase(getParking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id)
        if (index !== -1) {
          state.events[index] = action.payload
        }
      })
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false
        state.paymentOrder = action.payload
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false
        // Update maintenance status in the list
        const index = state.maintenance.findIndex(m => m._id === action.payload.maintenance._id)
        if (index !== -1) {
          state.maintenance[index] = action.payload.maintenance
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getNOCRequests.pending, (state) => {
        state.loading = true
      })
      .addCase(getNOCRequests.fulfilled, (state, action) => {
        state.loading = false
        state.nocRequests = action.payload
      })
      .addCase(getNOCRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createNOCRequest.fulfilled, (state, action) => {
        state.nocRequests.unshift(action.payload)
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
  },
})

export const { clearError } = residentSlice.actions
export default residentSlice.reducer
