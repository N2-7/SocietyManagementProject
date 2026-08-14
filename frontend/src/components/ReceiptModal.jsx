import React from 'react'
import { X, Download, Printer, CheckCircle2, Building2, Calendar, CreditCard, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const ReceiptModal = ({ bill, onClose, onDownload }) => {
  if (!bill) return null

  const baseAmount = bill.baseAmount || bill.amount || 0
  const latePenalty = bill.latePenalty || 0
  const otherCharges = bill.otherCharges || 0
  const totalAmount = bill.totalAmount || bill.amount || 0
  const receiptId = bill.receiptId || `RCP-${bill._id?.slice(-8)?.toUpperCase() || 'OFFICIAL'}`
  const paymentDate = bill.paymentDate ? new Date(bill.paymentDate) : new Date()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Building2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Smart Society Management</h2>
              <p className="text-xs text-indigo-200">Official Payment & Maintenance Receipt</p>
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

        {/* Modal Scrollable Body (Printable Region) */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-6 print:p-0">
          
          {/* PAID Status & Top Highlights */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-3 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30 animate-pulse">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 mb-1">
                  ✓ PAID & VERIFIED
                </span>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  Payment Received in Full
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Receipt No: <span className="font-mono font-bold">{receiptId}</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 dark:sm:border-emerald-800/60 sm:pl-6">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-semibold">Total Amount</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Details Grid (Resident + Payment Info) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Resident Details Card */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Property & Resident Details
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Flat Number:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bill.flatNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Resident Type:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">{bill.residentType || 'Resident'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Billing Period:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{bill.month} {bill.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Info Card */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 font-semibold text-sm">
                <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Payment Transaction Details
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {paymentDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">Razorpay (Online)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300">
                    COMPLETED
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Itemized Charges Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Itemized Maintenance Breakdown
              </span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                <tr>
                  <td className="px-4 py-3 font-medium">
                    Base Maintenance Charge ({bill.month} {bill.year})
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Regular Monthly Bill</td>
                  <td className="px-4 py-3 font-semibold text-right">₹{baseAmount.toFixed(2)}</td>
                </tr>

                {latePenalty > 0 && (
                  <tr className="bg-red-50/50 dark:bg-red-950/20">
                    <td className="px-4 py-3 font-medium text-red-700 dark:text-red-400">
                      Late Penalty Fee
                    </td>
                    <td className="px-4 py-3 text-red-600 dark:text-red-400">Overdue Charge</td>
                    <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400 text-right">
                      + ₹{latePenalty.toFixed(2)}
                    </td>
                  </tr>
                )}

                {otherCharges > 0 && (
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      {bill.otherChargesDescription || 'Other / Utility Charges'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Additional Charges</td>
                    <td className="px-4 py-3 font-semibold text-right">+ ₹{otherCharges.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-indigo-50/70 dark:bg-indigo-950/40 font-bold border-t border-indigo-200 dark:border-indigo-800">
                <tr>
                  <td colSpan="2" className="px-4 py-3 text-indigo-950 dark:text-indigo-200 text-sm">
                    Grand Total Paid
                  </td>
                  <td className="px-4 py-3 text-indigo-700 dark:text-indigo-300 text-base text-right font-extrabold">
                    ₹{totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
            Thank you for your prompt payment. Computer-generated official receipt • Smart Society Inc.
          </p>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={() => onDownload(bill._id)}
            className="btn btn-primary flex items-center gap-2 text-xs shadow-lg shadow-primary-600/30"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

      </div>
    </div>
  )
}

export default ReceiptModal
