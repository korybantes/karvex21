import { useTranslation } from 'next-i18next'
import { Bell, Calendar } from 'lucide-react'

export default function UpcomingReminders() {
  const { t } = useTranslation('common')

  const reminders = [
    {
      id: 1,
      title: 'Vehicle Inspection - PL 12345',
      date: '2024-01-15',
      priority: 'high',
      type: 'vehicle',
    },
    {
      id: 2,
      title: 'Driver License Expiry - Jan Kowalski',
      date: '2024-01-20',
      priority: 'medium',
      type: 'driver',
    },
    {
      id: 3,
      title: 'OC Insurance - PL 67890',
      date: '2024-01-25',
      priority: 'high',
      type: 'vehicle',
    },
    {
      id: 4,
      title: 'Code 95 Renewal - Piotr Nowak',
      date: '2024-02-01',
      priority: 'medium',
      type: 'driver',
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Reminders</h2>
        <Bell className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{reminder.title}</p>
              <p className="mt-1 text-sm text-gray-500">{reminder.date}</p>
            </div>
            <span className={`status-badge ${getPriorityColor(reminder.priority)}`}>
              {reminder.priority}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
        View all reminders →
      </button>
    </div>
  )
}
