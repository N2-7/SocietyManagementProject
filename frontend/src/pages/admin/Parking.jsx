import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getParking, assignParking, updateParking, deleteParking } from '../../redux/slices/adminSlice'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Car, MapPin } from 'lucide-react'

const Parking = () => {
  const dispatch = useDispatch()
  const { parking, loading } = useSelector((state) => state.admin)
  const [showModal, setShowModal] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [formData, setFormData] = useState({
    flatNo: '',
    vehicleNumber: '',
    slotNo: '',
    vehicleType: 'car'
  })

  useEffect(() => {
    dispatch(getParking())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this parking assignment?')) {
      try {
        await dispatch(deleteParking(id)).unwrap()
        toast.success('Parking slot freed successfully')
      } catch (error) {
        toast.error(error || 'Failed to delete parking')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSlot) {
        await dispatch(updateParking({ id: editingSlot._id, ...formData })).unwrap()
        toast.success('Assignment updated successfully')
      } else {
        await dispatch(assignParking(formData)).unwrap()
        toast.success('Slot assigned successfully')
      }
      setShowModal(false)
      setEditingSlot(null)
      setFormData({ flatNo: '', vehicleNumber: '', slotNo: '', vehicleType: 'car' })
    } catch (error) {
      toast.error(error || 'Failed to save parking')
    }
  }

  const handleEdit = (slot) => {
    setEditingSlot(slot)
    setFormData({
      flatNo: slot.flatNo,
      vehicleNumber: slot.vehicleNumber,
      slotNo: slot.slotNo,
      vehicleType: slot.vehicleType
    })
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingSlot(null)
    setFormData({ flatNo: '', vehicleNumber: '', slotNo: '', vehicleType: 'car' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Parking Management
        </h1>
        <button
          onClick={() => {
            setEditingSlot(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Assign Slot
        </button>
      </div>

      {/* Parking Slots Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading parking slots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {parking && parking.length > 0 ? parking.map((slot) => (
            <div key={slot._id} className={`card ${!slot.isOccupied ? 'border-2 border-green-500' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${slot.isOccupied ? 'bg-blue-100' : 'bg-green-100'}`}>
                    <Car className={`w-5 h-5 ${slot.isOccupied ? 'text-blue-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Slot {slot.slotNo}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      slot.isOccupied ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {slot.isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                </div>
                {slot.isOccupied && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(slot)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {slot.isOccupied ? (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Flat: {slot.flatNo}</span>
                  </div>
                  <div>
                    Vehicle: {slot.vehicleNumber}
                  </div>
                  <div className="capitalize">
                    Type: {slot.vehicleType}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Available for assignment</p>
              )}
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No parking slots available</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingSlot ? 'Edit Assignment' : 'Assign Parking Slot'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Flat Number</label>
                <input
                  type="text"
                  value={formData.flatNo}
                  onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
                  className="input"
                  placeholder="Enter flat number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="input"
                  placeholder="Enter vehicle number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slot Number</label>
                <input
                  type="text"
                  value={formData.slotNo}
                  onChange={(e) => setFormData({ ...formData, slotNo: e.target.value })}
                  className="input"
                  placeholder="Enter slot number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="input"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleModalClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {editingSlot ? 'Update' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Parking
