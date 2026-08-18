import React, { useState } from 'react'
import { X, Mail, Lock, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const PaymentOTPModal = ({ isOpen, onClose, onVerify, onResendOTP, maintenanceId, loading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resending, setResending] = useState(false)

  if (!isOpen) return null

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
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
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

  const handleVerify = () => {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter complete 6-digit OTP')
      return
    }
    onVerify(otpValue)
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await onResendOTP(maintenanceId)
      toast.success('OTP resent successfully')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setResending(false)
    }
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
              <h2 className="text-lg font-bold">Payment Verification</h2>
              <p className="text-xs text-indigo-200">Enter OTP sent to your email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-indigo-200 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Info Card */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-full">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                OTP sent to your registered email
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Check your inbox and spam folder
              </p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Enter 6-digit OTP
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
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

          {/* Resend OTP */}
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="btn btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="btn btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : (
              <>
                Verify & Proceed
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PaymentOTPModal