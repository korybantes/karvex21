import { useTranslation } from 'next-i18next'
import { Users, Truck, DollarSign, AlertTriangle } from 'lucide-react'

export default function DashboardStats() {
  const { t } = useTranslation('common')

  const stats = [
    {
      name: 'Active Drivers',
      value: '24',
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 from last month',
    },
    {
      name: 'Active Vehicles',
      value: '18',
      icon: Truck,
      color: 'bg-green-500',
      change: '+1 from last month',
    },
    {
      name: 'Monthly Revenue',
      value: 'PLN 245,000',
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+12% from last month',
    },
    {
      name: 'Expiring Documents',
      value: '5',
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Requires attention',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
