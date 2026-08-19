import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, verifyTwoFactorLogin, cancelTwoFactorLogin } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast'
import { Building2, LogIn, Shield, KeyRound } from 'lucide-react'
import ForgotPasswordModal from '../../components/ForgotPasswordModal'
import { getDashboardPath } from '../../utils/authHelpers'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, requiresTwoFactor, twoFactorEmail } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const navigateAfterLogin = (user) => {
    if (!user?.twoFactorEnabled) {
      navigate('/setup-2fa', { replace: true })
    } else {
      navigate(getDashboardPath(user.role), { replace: true })
    }
  }

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data))
      if (result.meta.requestStatus === 'fulfilled') {
        if (result.payload.requiresTwoFactor) {
          toast.success('Enter your 2FA code')
        } else {
          toast.success('Login successful')
          navigateAfterLogin(result.payload.user)
        }
      } else {
        toast.error(result.payload || 'Login failed')
      }
    } catch (error) {
      toast.error('Login failed')
    }
  }

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault()

    if (useBackupCode) {
      if (!twoFactorToken || twoFactorToken.length < 6) {
        toast.error('Please enter a valid backup code')
        return
      }
    } else if (!twoFactorToken || twoFactorToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    try {
      const result = await dispatch(verifyTwoFactorLogin({ email: twoFactorEmail, token: twoFactorToken }))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Login successful')
        navigate(getDashboardPath(result.payload.user.role), { replace: true })
      } else {
        toast.error(result.payload || '2FA verification failed')
      }
    } catch (error) {
      toast.error('2FA verification failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 overflow-hidden">
            <img src="/h.png" alt="MyPlace" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MyPlace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your Home, Your Place
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {requiresTwoFactor ? 'Two-Factor Authentication' : 'Login'}
          </h2>

          {requiresTwoFactor ? (
            <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-purple-900 dark:text-purple-100">
                      Enter your 2FA code
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Open your authenticator app and enter the 6-digit code
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {useBackupCode ? 'Backup Code' : 'Authentication Code'}
                </label>
                <input
                  type="text"
                  value={twoFactorToken}
                  onChange={(e) => {
                    const val = useBackupCode
                      ? e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8)
                      : e.target.value.replace(/\D/g, '').slice(0, 6)
                    setTwoFactorToken(val)
                  }}
                  placeholder={useBackupCode ? 'A1B2C3D4' : '123456'}
                  className={`input text-center ${useBackupCode ? 'text-lg tracking-widest font-mono' : 'text-2xl tracking-widest'}`}
                  maxLength={useBackupCode ? 8 : 6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode)
                  setTwoFactorToken('')
                }}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
              >
                <KeyRound className="w-3 h-3" />
                {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
              </button>

              <button
                type="submit"
                disabled={loading || (useBackupCode ? twoFactorToken.length < 6 : twoFactorToken.length !== 6)}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Verifying...'
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Verify
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch(cancelTwoFactorLogin())
                  setTwoFactorToken('')
                  setUseBackupCode(false)
                }}
                className="btn btn-secondary w-full"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flat Number
                </label>
                <input
                  type="text"
                  {...register('flatNo', { required: 'Flat number is required' })}
                  className="input"
                  placeholder="e.g., A-101"
                />
                {errors.flatNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.flatNo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    className="input pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Use your flat number and password to login
        </p>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  )
}

export default Login
