import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getParking } from '../../redux/slices/residentSlice'
import { Car, MapPin } from 'lucide-react'

const Parking = () => {
  const dispatch = useDispatch()
  const { parking, loading } = useSelector((state) => state.resident)

  useEffect(() => {
    dispatch(getParking())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Parking
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading parking information...</p>
        </div>
      ) : parking ? (
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Slot {parking.slotNo}
                </h3>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  Assigned
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Flat Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{parking.flatNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Car className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{parking.vehicleNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Car className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{parking.vehicleType}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="p-4 rounded-full bg-gray-100 mx-auto w-fit mb-4">
            <Car className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Parking Assigned
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have a parking slot assigned yet. Please contact the admin for parking assignment.
          </p>
        </div>
      )}
    </div>
  )
}

export default Parking
