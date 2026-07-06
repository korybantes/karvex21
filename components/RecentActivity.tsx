import { useTranslation } from 'next-i18next'
import { Clock } from 'lucide-react'

export default function RecentActivity() {
  const { t } = useTranslation('common')

  const activities = [
    {
      id: 1,
      action: 'New driver added',
      entity: 'Marek Wiśniewski',
      time: '2 hours ago',
      type: 'driver',
    },
    {
      id: 2,
      action: 'Vehicle inspection completed',
      entity: 'PL 12345',
      time: '5 hours ago',
      type: 'vehicle',
    },
    {
      id: 3,
      action: 'Invoice recorded',
      entity: 'INV-2024-001',
      time: '1 day ago',
      type: 'accounting',
    },
    {
      id: 4,
      action: 'Document uploaded',
      entity: 'Driver License - Jan Kowalski',
      time: '2 days ago',
      type: 'document',
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'driver':
        return 'bg-blue-100 text-blue-800'
      case 'vehicle':
        return 'bg-green-100 text-green-800'
      case 'accounting':
        return 'bg-purple-100 text-purple-800'
      case 'document':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <Clock className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <p className="mt-1 text-sm text-gray-500">{activity.entity}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`status-badge ${getTypeColor(activity.type)}`}>
                {activity.type}
              </span>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all activity →
      </button>
    </div>
  )
}
