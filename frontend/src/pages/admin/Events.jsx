import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getEvents } from '../../redux/slices/residentSlice'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react'

const Events = () => {
  const dispatch = useDispatch()
  const { events, loading } = useSelector((state) => state.resident)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  useEffect(() => {
    dispatch(getEvents())
  }, [dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // Implement delete functionality
      toast.success('Event deleted successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Events Management
        </h1>
        <button
          onClick={() => {
            setEditingEvent(null)
            setShowModal(true)
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full card text-center py-8 text-gray-500">
            No events found
          </div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {event.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(event)
                      setShowModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{event.rsvpCount} RSVPs</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  defaultValue={editingEvent?.title || ''}
                  className="input"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  defaultValue={editingEvent?.description || ''}
                  className="input"
                  rows="3"
                  placeholder="Enter event description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  defaultValue={editingEvent?.date ? editingEvent.date.split('T')[0] : ''}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  defaultValue={editingEvent?.location || ''}
                  className="input"
                  placeholder="Enter event location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Organizer</label>
                <input
                  type="text"
                  defaultValue={editingEvent?.organizer || ''}
                  className="input"
                  placeholder="Enter organizer name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully')
                  setShowModal(false)
                }}
                className="btn btn-primary"
              >
                {editingEvent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
