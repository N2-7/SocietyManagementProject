import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '').replace(/^\/+/, '')}/api/auth` 
  : '/api/auth'

const OTPVerification = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from location state
  const email = location.state?.email || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    if (!email) {
      toast.error('Email not found. Please start registration again.')
      navigate('/signup')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp })
      
      if (response.data.success) {
        toast.success('Email verified successfully! Your account is now pending admin approval.')
        navigate('/login')
      } else {
        toast.error(response.data.message || 'OTP verification failed')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    // You can implement resend OTP functionality here
    toast.info('Resend OTP functionality coming soon')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 overflow-hidden">
            <img src="/h.png" alt="MyPlace" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MyPlace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Verify your email
          </p>
        </div>

        <div className="card">
          <div className="mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign Up
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Enter Verification Code
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    // Only allow numbers and max 6 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                  }}
                  className="input pl-10 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Didn't receive code? Resend
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 The verification code will expire in 5 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
