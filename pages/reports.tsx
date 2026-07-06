import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import { BarChart3, TrendingUp, Users, Truck, Download, Calendar, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626']

export default function Reports() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reports?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Process data for charts
  const monthlyRevenue = reportData?.monthlyRevenue || []
  const expenseBreakdown = reportData?.expenseBreakdown || []
  const vehicleUtilization = reportData?.vehicleUtilization || []
  const driverPerformance = reportData?.driverPerformance || []

  const pieData = expenseBreakdown.map((e: any) => ({
    name: e.category,
    value: e.amount
  }))

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('reportsPageTitle')}</h1>
            <p className="page-subtitle">{t('reportsPageSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="input-field py-2 text-xs"
            >
              <option value="month">{t('thisMonth')}</option>
              <option value="quarter">{t('thisQuarter')}</option>
              <option value="year">{t('thisYear')}</option>
            </select>
            <button className="btn-primary text-xs flex items-center gap-1.5">
              <Download size={14} /> {t('exportReport')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('loadingAnalytics')}</div>
        ) : (
          <>
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Przychody ogółem</p>
                <p className="text-slate-900 text-2xl font-bold mt-1">
                  {reportData?.totalRevenue?.toLocaleString('pl-PL')} PLN
                </p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Wszystkie wydatki</p>
                <p className="text-red-600 text-2xl font-bold mt-1">
                  {reportData?.totalExpenses?.toLocaleString('pl-PL')} PLN
                </p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Kierowcy (Aktywni)</p>
                <p className="text-slate-900 text-2xl font-bold mt-1">{reportData?.activeDrivers}</p>
              </div>
              <div className="card">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pojazdy (Aktywne)</p>
                <p className="text-slate-900 text-2xl font-bold mt-1">{reportData?.activeVehicles}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <div className="card lg:col-span-2">
                <h3 className="font-bold text-slate-800 text-base mb-4">Trend przychodów i kosztów</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} zł`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Przychody" stroke="#2563eb" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="expenses" name="Koszty" stroke="#ef4444" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Breakdown Pie */}
              <div className="card">
                <h3 className="font-bold text-slate-800 text-base mb-4">Podział wydatków</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                      {pieData.map((_: any, idx: number) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} zł`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-3">
                  {pieData.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-600 capitalize">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{item.value.toLocaleString()} zł</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drivers Performance */}
            <div className="card">
              <h3 className="font-bold text-slate-800 text-base mb-4">Efektywność i wygenerowany zysk kierowców</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Kierowca</th>
                      <th>Liczba tras</th>
                      <th>Przejechany dystans (km)</th>
                      <th>Wygenerowany przychód</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverPerformance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-400">Brak danych analitycznych</td>
                      </tr>
                    ) : driverPerformance.map((d: any, idx: number) => (
                      <tr key={idx}>
                        <td className="font-semibold text-slate-900">{d.name}</td>
                        <td>{d.trips}</td>
                        <td>{d.distance.toLocaleString()} km</td>
                        <td className="font-bold text-emerald-600">+{d.revenue.toLocaleString()} PLN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
    },
  }
}
