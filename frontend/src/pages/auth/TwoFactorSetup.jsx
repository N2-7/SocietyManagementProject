import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Shield, QrCode, ArrowLeft, CheckCircle, AlertCircle, Copy, Eye, EyeOff, LogOut, KeyRound } from 'lucide-react'
import { setUser, logout } from '../../redux/slices/authSlice'
import { getDashboardPath, updateStoredUser } from '../../utils/authHelpers'

const TwoFactorSetup = () => {
  const [step, setStep] = useState('intro') // intro, verify, success, disable
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [backupCodes, setBackupCodes] = useState([])

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSelector((state) => state.auth)

  const isDisableMode = searchParams.get('mode') === 'disable' && user?.twoFactorEnabled
  const isMandatory = !user?.twoFactorEnabled

  const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '').replace(/^\/+/, '')}/api/auth`
    : '/api/auth'

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  })

  const syncUser = (updates) => {
    const updated = updateStoredUser(updates)
    dispatch(setUser(updated))
  }

  const handleSetup = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_URL}/setup-2fa`, {}, {
        headers: getAuthHeaders(),
      })

      setQrCode(response.data.data.qrCode)
      setSecret(response.data.data.secret)
      setStep('verify')
      toast.success('Scan the QR code with your authenticator app')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!token || token.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_URL}/verify-2fa`, { token }, {
        headers: getAuthHeaders(),
      })

      const codes = response.data.data?.backupCodes || []
      setBackupCodes(codes)
      syncUser({ twoFactorEnabled: true })
      setStep('success')
      toast.success('2FA enabled successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code, please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e) => {
    e.preventDefault()

    if (!token || token.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API_URL}/disable-2fa`, { token }, {
        headers: getAuthHeaders(),
      })

      syncUser({ twoFactorEnabled: false })
      toast.success('2FA disabled — you will need to set it up again to access the portal')
      navigate('/setup-2fa', { replace: true })
      setStep('intro')
      setToken('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code, cannot disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    toast.success('Backup codes copied to clipboard')
  }

  const handleFinish = () => {
    navigate(getDashboardPath(user?.role), { replace: true })
  }

  const handleBack = () => {
    if (isMandatory) {
      dispatch(logout())
      navigate('/login')
      return
    }
    navigate(getDashboardPath(user?.role))
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // ── Disable 2FA mode ──────────────────────────────────────────
  if (isDisableMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate(getDashboardPath(user?.role))}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disable Two-Factor Authentication</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Enter your current authenticator code to disable 2FA
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Disabling 2FA will require you to set it up again before accessing the portal.
                </p>
              </div>
            </div>

            <form onSubmit={handleDisable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current 6-digit code
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="input text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || token.length !== 6}
                className="btn w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Setup / Enable mode ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isMandatory ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'intro' ? 'Setup Two-Factor Authentication' :
               step === 'verify' ? 'Verify Your Authenticator' :
               '2FA Enabled Successfully'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {step === 'intro' ? 'Add an extra layer of security to your account' :
               step === 'verify' ? 'Enter the code from your authenticator app' :
               'Your account is now protected with 2FA'}
            </p>
          </div>

          {isMandatory && step === 'intro' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Required:</strong> Two-factor authentication must be enabled before you can access the portal.
                </p>
              </div>
            </div>
          )}

          {step === 'intro' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  What is Two-Factor Authentication?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  2FA adds an extra layer of security by requiring a code from your authenticator app when you sign in.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Download an authenticator app (Google Authenticator, Authy, etc.)',
                  'Scan the QR code or enter the secret key manually',
                  'Enter the verification code to enable 2FA',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSetup}
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-center mb-4">
                  {qrCode && (
                    <img src={qrCode} alt="QR Code" className="w-48 h-48 object-contain" />
                  )}
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Secret Key (if you can&apos;t scan)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secret}
                    readOnly
                    className="input flex-1 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    title="Copy secret"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter 6-digit verification code
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="input text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || token.length !== 6}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify and Enable
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <p className="font-medium">Success!</p>
                  <p className="text-sm">Two-factor authentication is now enabled</p>
                </div>
              </div>

              {backupCodes.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Backup Codes</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBackupCodes}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy all
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Save these codes in a safe place. Each can be used once if you lose access to your authenticator app.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, i) => (
                      <div
                        key={i}
                        className="font-mono text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    These backup codes will <strong>not be shown again</strong>. Store them securely before continuing.
                  </p>
                </div>
              </div>

              <button onClick={handleFinish} className="btn btn-primary w-full">
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TwoFactorSetup
