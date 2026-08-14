import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import adminReducer from './slices/adminSlice'
import residentReducer from './slices/residentSlice'
import guardReducer from './slices/guardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    resident: residentReducer,
    guard: guardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
