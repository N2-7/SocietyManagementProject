import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getNotices } from '../../redux/slices/residentSlice'
import { Bell, Pin } from 'lucide-react'

const Notices = () => {
  const dispatch = useDispatch()
  const { notices, loading } = useSelector((state) => state.resident)

  useEffect(() => {
    dispatch(getNotices())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Notices
      </h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading notices...</p>
        </div>
      ) : notices && notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {notice.title}
                  </h3>
                </div>
                {notice.isPinned && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <Pin className="w-4 h-4" />
                    <span className="text-sm">Pinned</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {notice.description}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(notice.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="p-4 rounded-full bg-gray-100 mx-auto w-fit mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Notices
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no notices at the moment.
          </p>
        </div>
      )}
    </div>
  )
}

export default Notices
