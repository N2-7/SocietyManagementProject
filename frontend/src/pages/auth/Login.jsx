import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast'
import { Building2, Lock, LogIn } from 'lucide-react'
import ForgotPasswordModal from '../../components/ForgotPasswordModal'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Login successful')
        const role = result.payload.user.role
        if (role === 'admin') navigate('/admin/dashboard')
        else if (role === 'resident') navigate('/resident/dashboard')
        else if (role === 'guard') navigate('/guard/dashboard')
      } else {
        toast.error(result.payload || 'Login failed')
      }
    } catch (error) {
      toast.error('Login failed')
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
            Login
          </h2>

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
