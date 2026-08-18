import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { visitorEntry, searchFlat } from '../../redux/slices/guardSlice'
import toast from 'react-hot-toast'
import { Users, Search, Car, Package } from 'lucide-react'

const VisitorEntry = () => {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.guard)
  const [searchResult, setSearchResult] = useState(null)
  const [visitorType, setVisitorType] = useState('general')
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    vehicleNumber: '',
    purpose: 'personal',
    customPurpose: '',
    flatNo: '',
  })

  const handleSearchFlat = async (flatNo) => {
    if (flatNo.length >= 3) {
      try {
        const result = await dispatch(searchFlat(flatNo))
        setSearchResult(result.payload)
      } catch (error) {
        setSearchResult(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      visitorName: formData.visitorName,
      phone: formData.phone,
      vehicleNumber: formData.vehicleNumber,
      purpose: formData.purpose === 'other' ? formData.customPurpose : formData.purpose,
      customPurpose: formData.purpose === 'other' ? formData.customPurpose : '',
      flatNo: formData.flatNo,
    }

    try {
      await dispatch(visitorEntry(data))
      toast.success('Visitor entry recorded successfully')
      setFormData({
        visitorName: '',
        phone: '',
        vehicleNumber: '',
        purpose: 'personal',
        customPurpose: '',
        flatNo: '',
      })
      setSearchResult(null)
    } catch (error) {
      toast.error('Failed to record visitor entry')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Visitor Entry
      </h1>

      {/* Visitor Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setVisitorType('general')}
          className={`card p-4 flex flex-col items-center gap-2 ${
            visitorType === 'general' ? 'border-2 border-primary-500' : ''
          }`}
        >
          <Users className="w-6 h-6 text-primary-600" />
          <span className="font-medium">General Visitor</span>
        </button>
        <button
          onClick={() => setVisitorType('delivery')}
          className={`card p-4 flex flex-col items-center gap-2 ${
            visitorType === 'delivery' ? 'border-2 border-primary-500' : ''
          }`}
        >
          <Package className="w-6 h-6 text-primary-600" />
          <span className="font-medium">Delivery</span>
        </button>
        <button
          onClick={() => setVisitorType('cab')}
          className={`card p-4 flex flex-col items-center gap-2 ${
            visitorType === 'cab' ? 'border-2 border-primary-500' : ''
          }`}
        >
          <Car className="w-6 h-6 text-primary-600" />
          <span className="font-medium">Cab/Taxi</span>
        </button>
      </div>

      {/* Entry Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Flat Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Flat Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.flatNo}
                onChange={(e) => {
                  setFormData({ ...formData, flatNo: e.target.value })
                  handleSearchFlat(e.target.value)
                }}
                className="input pl-10"
                placeholder="Enter flat number (e.g., A-101)"
                required
              />
            </div>
            {searchResult && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Resident found: {searchResult.name} ({searchResult.flatNo})
                </p>
              </div>
            )}
          </div>

          {visitorType === 'general' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Visitor Name</label>
                <input
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="input"
                  placeholder="Enter visitor name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="input"
                  placeholder="Enter vehicle number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input"
                >
                  <option value="personal">Personal Visit</option>
                  <option value="business">Business</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.purpose === 'other' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Please specify purpose</label>
                  <input
                    type="text"
                    value={formData.customPurpose}
                    onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                    className="input"
                    placeholder="Enter visit purpose"
                    required
                  />
                </div>
              )}
            </>
          )}

          {visitorType === 'delivery' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Person Name</label>
                <input
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="input"
                  placeholder="Enter delivery person name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Type</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input"
                >
                  <option value="food">Food Delivery</option>
                  <option value="courier">Courier/Package</option>
                  <option value="grocery">Grocery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.purpose === 'other' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Please specify delivery type</label>
                  <input
                    type="text"
                    value={formData.customPurpose}
                    onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                    className="input"
                    placeholder="Enter delivery type"
                    required
                  />
                </div>
              )}
            </>
          )}

          {visitorType === 'cab' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Driver Name</label>
                <input
                  type="text"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="input"
                  placeholder="Enter driver name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value }, setFormData({ ...formData, vehicleNumber: e.target.value }))}
                  className="input"
                  placeholder="Enter vehicle number"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Recording...' : 'Record Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default VisitorEntry
