import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getResidentMaintenance, createPaymentOrder, verifyPayment, sendPaymentOTP, verifyPaymentOTP } from '../../redux/slices/residentSlice'
import { DollarSign, Calendar, Download, CreditCard, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ReceiptModal from '../../components/ReceiptModal'
import PaymentOTPModal from '../../components/PaymentOTPModal'

const Maintenance = () => {
  const dispatch = useDispatch()
  const { maintenance, loading, paymentOrder } = useSelector((state) => state.resident)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null)
  const [verifyingOTP, setVerifyingOTP] = useState(false)

  useEffect(() => {
    dispatch(getResidentMaintenance())
  }, [dispatch])

  const handlePayment = async (billId) => {
    try {
      setSelectedBillForPayment(billId)
      setProcessingPayment(true)
      
      // Send OTP first
      const otpResult = await dispatch(sendPaymentOTP(billId))
      
      if (otpResult.error) {
        toast.error(otpResult.error)
        setProcessingPayment(false)
        setSelectedBillForPayment(null)
        return
      }

      // Show OTP modal
      setShowOTPModal(true)
      setProcessingPayment(false)
    } catch (error) {
      console.error('OTP sending error:', error)
      toast.error('Failed to send OTP')
      setProcessingPayment(false)
      setSelectedBillForPayment(null)
    }
  }

  const handleOTPVerify = async (otp) => {
    try {
      setVerifyingOTP(true)
      
      // Verify OTP
      const verifyResult = await dispatch(verifyPaymentOTP({ otp, maintenanceId: selectedBillForPayment }))
      
      if (verifyResult.error) {
        toast.error(verifyResult.error)
        setVerifyingOTP(false)
        return
      }

      // OTP verified successfully, close modal and proceed to payment
      setShowOTPModal(false)
      toast.success('OTP verified successfully')
      
      // Create payment order
      const orderResult = await dispatch(createPaymentOrder(selectedBillForPayment))
      
      if (orderResult.error) {
        toast.error(orderResult.error)
        setVerifyingOTP(false)
        setSelectedBillForPayment(null)
        return
      }

      const orderData = orderResult.payload
      
      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Smart Society',
          description: `Maintenance Bill - ${orderData.maintenance.month} ${orderData.maintenance.year}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            // Verify payment on backend
            const verifyPaymentResult = await dispatch(verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              maintenanceId: selectedBillForPayment,
            }))

            if (verifyPaymentResult.error) {
              toast.error('Payment verification failed')
            } else {
              toast.success('Payment successful!')
              // Refresh maintenance list
              dispatch(getResidentMaintenance())
            }
            setVerifyingOTP(false)
            setSelectedBillForPayment(null)
          },
          prefill: {
            name: 'Resident',
            contact: '',
            email: '',
          },
          theme: {
            color: '#4F46E5',
          },
          modal: {
            ondismiss: function () {
              setVerifyingOTP(false)
              setSelectedBillForPayment(null)
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed')
      setVerifyingOTP(false)
      setSelectedBillForPayment(null)
    }
  }

  const handleResendOTP = async (maintenanceId) => {
    return await dispatch(sendPaymentOTP(maintenanceId))
  }

  const handleOTPModalClose = () => {
    setShowOTPModal(false)
    setSelectedBillForPayment(null)
    setVerifyingOTP(false)
  }

  const handleDownloadReceipt = async (billId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/resident/receipt/${billId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || 'Failed to download receipt')
        return
      }

      // Create blob from response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = `maintenance_receipt_${billId}.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Receipt downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download receipt')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Maintenance Bills
      </h1>

      {/* Bills List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : maintenance.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            No maintenance bills found
          </div>
        ) : (
          maintenance.map((bill) => (
            <div key={bill._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/40 rounded-full">
                    <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bill.month} {bill.year}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        bill.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300' :
                        new Date(bill.dueDate) < new Date() ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                      }`}>
                        {bill.paymentStatus === 'paid' ? 'Paid' : 
                         new Date(bill.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{bill.totalAmount || bill.amount}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {bill.paymentStatus === 'paid' ? (
                  <>
                    <button 
                      onClick={() => setSelectedBillForReceipt(bill)}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-primary-600" />
                      View Receipt
                    </button>
                    <button 
                      onClick={() => handleDownloadReceipt(bill._id)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handlePayment(bill._id)}
                    disabled={processingPayment}
                    className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-600/30"
                  >
                    <CreditCard className="w-4 h-4" />
                    {processingPayment ? 'Sending OTP...' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt Modal Preview */}
      {selectedBillForReceipt && (
        <ReceiptModal
          bill={selectedBillForReceipt}
          onClose={() => setSelectedBillForReceipt(null)}
          onDownload={(billId) => {
            handleDownloadReceipt(billId)
          }}
        />
      )}

      {/* OTP Verification Modal */}
      <PaymentOTPModal
        isOpen={showOTPModal}
        onClose={handleOTPModalClose}
        onVerify={handleOTPVerify}
        onResendOTP={handleResendOTP}
        maintenanceId={selectedBillForPayment}
        loading={verifyingOTP}
      />
    </div>
  )
}

export default Maintenance
