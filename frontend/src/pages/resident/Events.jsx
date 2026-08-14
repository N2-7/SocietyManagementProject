import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getEvents, rsvpEvent } from '../../redux/slices/residentSlice'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const Events = () => {
  const dispatch = useDispatch()
  const { events, loading } = useSelector((state) => state.resident)

  useEffect(() => {
    dispatch(getEvents())
  }, [dispatch])

  const handleRSVP = async (eventId) => {
    try {
      await dispatch(rsvpEvent(eventId)).unwrap()
      toast.success('RSVP successful')
    } catch (error) {
      toast.error(error || 'Failed to RSVP')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Events
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="card">
              {event.image && (
                <div className="h-48 w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                    <span>{event.attendees?.length || 0} attending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Organized by: {event.organizer}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRSVP(event._id)}
                  className="btn btn-primary w-full"
                  disabled={event.attendees?.includes('currentUserId')}
                >
                  {event.attendees?.includes('currentUserId') ? 'Already RSVPed' : 'RSVP'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="p-4 rounded-full bg-gray-100 mx-auto w-fit mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no upcoming events at the moment.
          </p>
        </div>
      )}
    </div>
  )
}

export default Events
