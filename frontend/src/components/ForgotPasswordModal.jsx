import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { X, Mail, Lock, RefreshCw, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPassword, verifyForgotPasswordOTP, resetPassword } from '../redux/slices/authSlice'

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  if (!isOpen) return null

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(forgotPassword(email))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('OTP sent to your email')
        setStep(2)
      } else {
        toast.error(result.payload || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp]
      pastedData.split('').forEach((char, i) => {
        if (i < 6) {
          newOtp[i] = char
        }
      })
      setOtp(newOtp)
    }
  }

  const handleOtpVerify = async () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(verifyForgotPasswordOTP({ email, otp: otpValue }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('OTP verified successfully')
        setStep(3)
      } else {
        toast.error(result.payload || 'Failed to verify OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    try {
      const result = await dispatch(forgotPassword(email))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('OTP resent successfully')
        setOtp(['', '', '', '', '', ''])
        document.getElementById('forgot-otp-0')?.focus()
      } else {
        toast.error(result.payload || 'Failed to resend OTP')
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const otpValue = otp.join('')
      const result = await dispatch(resetPassword({ 
        email, 
        otp: otpValue, 
        newPassword, 
        confirmPassword 
      }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Password reset successfully')
        onClose()
        // Reset form
        setStep(1)
        setEmail('')
        setOtp(['', '', '', '', '', ''])
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.payload || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setStep(1)
    setEmail('')
    setOtp(['', '', '', '', '', ''])
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Lock className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Reset Password</h2>
              <p className="text-xs text-indigo-200">
                {step === 1 ? 'Enter your email' : step === 2 ? 'Verify OTP' : 'Set new password'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                step >= s 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-8 transition-all ${
                  step > s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-full">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enter your registered email address
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We'll send you a verification code
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-full">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    OTP sent to {email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Check your inbox and spam folder
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`forgot-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50">
                <div className="p-2 bg-green-100 dark:bg-green-900/60 rounded-full">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    OTP verified successfully
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Set your new password below
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && (
                <div className={`text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleClose}
            className="btn btn-secondary text-sm"
          >
            Cancel
          </button>
          {step === 1 && (
            <button
              onClick={handleEmailSubmit}
              disabled={loading || !email}
              className="btn btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : (
                <>
                  Send OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleOtpVerify}
              disabled={loading || otp.join('').length !== 6}
              className="btn btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : (
                <>
                  Verify OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handlePasswordReset}
              disabled={loading || !newPassword || !confirmPassword}
              className="btn btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : (
                <>
                  Reset Password
                  <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default ForgotPasswordModal