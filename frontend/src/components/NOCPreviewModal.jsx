import React, { useEffect, useState } from 'react'
import { X, Download, Printer, Copy, Check, ShieldCheck, Eye, RefreshCw, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const NOCPreviewModal = ({ noc, isOpen, onClose, isAdmin = false }) => {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && noc && noc._id) {
      fetchPdfPreview()
    }

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, noc])

  const fetchPdfPreview = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const endpoint = isAdmin 
        ? `/api/admin/noc/${noc._id}/preview`
        : `/api/resident/noc/${noc._id}/preview`

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to load NOC preview')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      console.error('PDF preview error:', err)
      setError(err.message || 'Error rendering NOC PDF preview')
      toast.error('Could not load certificate preview')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = isAdmin 
        ? `/api/admin/noc/${noc._id}/download`
        : `/api/resident/noc/${noc._id}/download`

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `NOC_${noc.certificateNumber || noc._id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Certificate downloaded successfully')
    } catch (err) {
      toast.error('Failed to download NOC certificate')
    }
  }

  const handlePrint = () => {
    if (!pdfUrl) return
    const iframe = document.getElementById('noc-pdf-iframe')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } else {
      window.open(pdfUrl, '_blank')
    }
  }

  const copyCertNumber = () => {
    if (noc?.certificateNumber) {
      navigator.clipboard.writeText(noc.certificateNumber)
      setCopied(true)
      toast.success('Certificate number copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen || !noc) return null

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Official NOC Certificate</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified & Issued
                </span>
              </div>
              {noc.certificateNumber && (
                <div className="flex items-center gap-2 text-xs text-indigo-200 mt-0.5">
                  <span>Certificate ID: <strong className="text-amber-300 font-mono">{noc.certificateNumber}</strong></span>
                  <button 
                    onClick={copyCertNumber}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-indigo-200 hover:text-white"
                    title="Copy Certificate Number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !pdfUrl}
              className="px-3 py-2 bg-indigo-700/60 hover:bg-indigo-600 border border-indigo-500/40 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !pdfUrl}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-amber-500/25 disabled:opacity-50"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area (PDF Preview iframe) */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-10 h-10 animate-spin" />
              <p className="font-medium text-slate-700 dark:text-slate-300">Generating Official NOC Certificate PDF...</p>
              <p className="text-xs text-slate-500">Including security watermark, resident credentials & verification QR code</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-lg max-w-md">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Preview Unavailable</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <button
                onClick={fetchPdfPreview}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 text-sm"
              >
                Retry Loading
              </button>
            </div>
          )}

          {pdfUrl && !loading && (
            <iframe
              id="noc-pdf-iframe"
              src={pdfUrl}
              title={`NOC Certificate Preview - ${noc.certificateNumber || noc._id}`}
              className="w-full h-full rounded-xl shadow-inner border border-slate-300 dark:border-slate-800 bg-white"
            />
          )}
        </div>

        {/* Modal Footer Security Badge info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Digital Certificate • Embedded Authenticity QR Code Active</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Issued: {noc.issueDate ? new Date(noc.issueDate).toLocaleDateString() : 'N/A'}</span>
            <span>Type: {(noc.nocType || 'General').toUpperCase()}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default NOCPreviewModal
