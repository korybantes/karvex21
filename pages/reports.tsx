import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  BarChart3, TrendingUp, Users, Truck, Download, Calendar, ArrowUpRight, DollarSign,
  Fuel, Wrench, AlertTriangle, Clock, Route, MapPin, FileText, CheckCircle, XCircle,
  Activity, Zap, Target, Award, PieChart as PieChartIcon, BarChart as BarChartIcon
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#ea580c', '#71717a']
const EXPENSE_COLORS = {
  fuel: '#dc2626',
  toll: '#7c3aed',
  maintenance: '#059669',
  tire: '#d97706',
  insurance: '#2563eb',
  leasing: '#0891b2',
  other: '#71717a'
}

export default function Reports() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'operational' | 'drivers' | 'vehicles'>('overview')

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
  const vehicleProfitability = reportData?.vehicleProfitability || []
  const routeAnalytics = reportData?.routeAnalytics || []
  const fuelEfficiency = reportData?.fuelEfficiency || []
  const maintenanceCosts = reportData?.maintenanceCosts || []
  const tollCosts = reportData?.tollCosts || []
  const driverCompliance = reportData?.driverCompliance || []

  const pieData = expenseBreakdown.map((e: any) => ({
    name: e.category,
    value: e.amount
  }))

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const formatCurrency = (val: number) => `${val.toLocaleString('pl-PL')} PLN`
  const formatNumber = (val: number) => val.toLocaleString('pl-PL')

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

        {/* Tab Navigation */}
        <div className="tab-bar">
          <div onClick={() => setActiveTab('overview')} className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`}>
            <BarChartIcon size={14} /> {t('overview')}
          </div>
          <div onClick={() => setActiveTab('financial')} className={`tab-item ${activeTab === 'financial' ? 'active' : ''}`}>
            <DollarSign size={14} /> {t('financial')}
          </div>
          <div onClick={() => setActiveTab('operational')} className={`tab-item ${activeTab === 'operational' ? 'active' : ''}`}>
            <Activity size={14} /> {t('operational')}
          </div>
          <div onClick={() => setActiveTab('drivers')} className={`tab-item ${activeTab === 'drivers' ? 'active' : ''}`}>
            <Users size={14} /> {t('drivers')}
          </div>
          <div onClick={() => setActiveTab('vehicles')} className={`tab-item ${activeTab === 'vehicles' ? 'active' : ''}`}>
            <Truck size={14} /> {t('vehicles')}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('loadingAnalytics')}</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="card-gradient-blue">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">{t('totalRevenue')}</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {formatCurrency(reportData?.totalRevenue || 0)}
                        </p>
                        <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                          <ArrowUpRight size={12} /> +{calculateGrowth(reportData?.totalRevenue || 0, reportData?.previousRevenue || 0).toFixed(1)}%
                        </p>
                      </div>
                      <DollarSign size={32} className="text-white/20" />
                    </div>
                  </div>
                  <div className="card-gradient-red">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-xs font-semibold uppercase tracking-wider">{t('totalExpenses')}</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {formatCurrency(reportData?.totalExpenses || 0)}
                        </p>
                        <p className="text-red-200 text-xs mt-1">
                          {((reportData?.totalExpenses || 0) / (reportData?.totalRevenue || 1) * 100).toFixed(1)}% of revenue
                        </p>
                      </div>
                      <TrendingUp size={32} className="text-white/20" />
                    </div>
                  </div>
                  <div className="card-gradient-emerald">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">{t('netProfit')}</p>
                        <p className="text-white text-2xl font-bold mt-1">
                          {formatCurrency((reportData?.totalRevenue || 0) - (reportData?.totalExpenses || 0))}
                        </p>
                        <p className="text-emerald-200 text-xs mt-1">
                          {(((reportData?.totalRevenue || 0) - (reportData?.totalExpenses || 0)) / (reportData?.totalRevenue || 1) * 100).toFixed(1)}% margin
                        </p>
                      </div>
                      <Target size={32} className="text-white/20" />
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('activeDriversLabel')}</p>
                        <p className="text-slate-900 text-2xl font-bold mt-1">{reportData?.activeDrivers || 0}</p>
                        <p className="text-slate-400 text-xs mt-1">{reportData?.totalDrivers || 0} total</p>
                      </div>
                      <Users size={28} className="text-slate-200" />
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('activeVehiclesLabel')}</p>
                        <p className="text-slate-900 text-2xl font-bold mt-1">{reportData?.activeVehicles || 0}</p>
                        <p className="text-slate-400 text-xs mt-1">{reportData?.totalVehicles || 0} total</p>
                      </div>
                      <Truck size={28} className="text-slate-200" />
                    </div>
                  </div>
                </div>

                {/* Revenue vs Expenses Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-600" /> {t('revenueCostTrend')}
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} PLN`, '']} />
                        <Legend />
                        <Area type="monotone" dataKey="income" name={t('revenues')} stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="expenses" name={t('costs')} stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <PieChartIcon size={18} className="text-purple-600" /> {t('expenseBreakdown')}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                          {pieData.map((_: any, idx: number) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} PLN`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {pieData.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                            <span className="text-slate-600 capitalize">{item.name}</span>
                          </div>
                          <span className="font-semibold text-slate-700">{item.value.toLocaleString()} PLN</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Fuel size={24} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase">{t('fuel')}</p>
                      <p className="text-slate-900 text-lg font-bold">{formatCurrency(reportData?.fuelCost || 0)}</p>
                      <p className="text-slate-400 text-xs">{((reportData?.fuelCost || 0) / (reportData?.totalExpenses || 1) * 100).toFixed(1)}% of expenses</p>
                    </div>
                  </div>
                  <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Route size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase">{t('tollExpense')}</p>
                      <p className="text-slate-900 text-lg font-bold">{formatCurrency(reportData?.tollCost || 0)}</p>
                      <p className="text-slate-400 text-xs">{((reportData?.tollCost || 0) / (reportData?.totalExpenses || 1) * 100).toFixed(1)}% of expenses</p>
                    </div>
                  </div>
                  <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Wrench size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase">{t('maintenanceRepair')}</p>
                      <p className="text-slate-900 text-lg font-bold">{formatCurrency(reportData?.maintenanceCost || 0)}</p>
                      <p className="text-slate-400 text-xs">{((reportData?.maintenanceCost || 0) / (reportData?.totalExpenses || 1) * 100).toFixed(1)}% of expenses</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4">{t('incomeRegister')}</h3>
                    <div className="space-y-3">
                      {reportData?.recentIncome?.slice(0, 5).map((inc: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{inc.description}</p>
                            <p className="text-xs text-slate-400">{new Date(inc.incomeDate).toLocaleDateString()}</p>
                          </div>
                          <span className="font-bold text-emerald-600">+{formatCurrency(inc.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4">{t('expenseRegister')}</h3>
                    <div className="space-y-3">
                      {reportData?.recentExpenses?.slice(0, 5).map((exp: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{exp.description}</p>
                            <p className="text-xs text-slate-400">{exp.category}</p>
                          </div>
                          <span className="font-bold text-red-600">-{formatCurrency(exp.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold text-slate-800 text-base mb-4">{t('vatRegister')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-blue-600 text-xs font-semibold uppercase">{t('vatDue')}</p>
                      <p className="text-blue-900 text-xl font-bold mt-1">{formatCurrency(reportData?.vatDue || 0)}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-emerald-600 text-xs font-semibold uppercase">{t('vatDeductible')}</p>
                      <p className="text-emerald-900 text-xl font-bold mt-1">{formatCurrency(reportData?.vatDeductible || 0)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-purple-600 text-xs font-semibold uppercase">{t('vatBalanceOffice')}</p>
                      <p className={`text-xl font-bold mt-1 ${(reportData?.vatDue || 0) - (reportData?.vatDeductible || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency((reportData?.vatDue || 0) - (reportData?.vatDeductible || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OPERATIONAL TAB */}
            {activeTab === 'operational' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Route size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{t('totalTrips')}</p>
                        <p className="text-slate-900 text-xl font-bold">{formatNumber(reportData?.totalTrips || 0)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <MapPin size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{t('totalDistance')}</p>
                        <p className="text-slate-900 text-xl font-bold">{formatNumber(reportData?.totalDistance || 0)} km</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Fuel size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{t('avgFuelConsumption')}</p>
                        <p className="text-slate-900 text-xl font-bold">{(reportData?.avgFuelConsumption || 0).toFixed(1)} L/100km</p>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Clock size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase">{t('avgTripDuration')}</p>
                        <p className="text-slate-900 text-xl font-bold">{(reportData?.avgTripDuration || 0).toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <Route size={18} className="text-blue-600" /> {t('routeAnalytics')}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={routeAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="route" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} PLN`, 'Revenue']} />
                      <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* DRIVERS TAB */}
            {activeTab === 'drivers' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <Award size={18} className="text-amber-600" /> {t('driverEfficiency')}
                  </h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('driver')}</th>
                          <th>{t('numberOfTrips')}</th>
                          <th>{t('distanceTraveled')}</th>
                          <th>{t('revenueGenerated')}</th>
                          <th>{t('avgPerTrip')}</th>
                          <th>{t('efficiency')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {driverPerformance.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-400">{t('noAnalyticsData')}</td>
                          </tr>
                        ) : driverPerformance.map((d: any, idx: number) => (
                          <tr key={idx}>
                            <td className="font-semibold text-slate-900">{d.name}</td>
                            <td>{d.trips}</td>
                            <td>{formatNumber(d.distance)} km</td>
                            <td className="font-bold text-emerald-600">+{formatCurrency(d.revenue)}</td>
                            <td>{formatCurrency(d.revenue / d.trips)}</td>
                            <td>
                              <span className={`status-badge ${d.efficiency > 80 ? 'status-valid' : d.efficiency > 60 ? 'status-expiring' : 'status-expired'}`}>
                                {d.efficiency.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-600" /> {t('driverCompliance')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {driverCompliance.map((dc: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800">{dc.driver}</span>
                          <span className={`status-badge ${dc.complianceScore > 90 ? 'status-valid' : dc.complianceScore > 70 ? 'status-expiring' : 'status-expired'}`}>
                            {dc.complianceScore.toFixed(0)}%
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t('drivingTime')}</span>
                            <span className={dc.drivingTimeCompliance ? 'text-emerald-600' : 'text-red-600'}>
                              {dc.drivingTimeCompliance ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t('breaks')}</span>
                            <span className={dc.breakCompliance ? 'text-emerald-600' : 'text-red-600'}>
                              {dc.breakCompliance ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">{t('documents')}</span>
                            <span className={dc.documentCompliance ? 'text-emerald-600' : 'text-red-600'}>
                              {dc.documentCompliance ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VEHICLES TAB */}
            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-blue-600" /> {t('vehicleProfitability')}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vehicleProfitability} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <YAxis dataKey="vehicle" type="category" width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} PLN`, '']} />
                      <Bar dataKey="profit" name="Profit" fill="#059669" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Fuel size={18} className="text-amber-600" /> {t('fuelEfficiency')}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={fuelEfficiency}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={v => `${v.toFixed(1)}`} />
                        <Tooltip formatter={(v: any) => [`${v.toFixed(2)} L/100km`, '']} />
                        <Line type="monotone" dataKey="consumption" name="L/100km" stroke="#d97706" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card">
                    <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <Wrench size={18} className="text-emerald-600" /> {t('maintenanceCosts')}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={maintenanceCosts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="vehicle" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} PLN`, '']} />
                        <Bar dataKey="cost" name="Cost" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pl', ['common'], nextI18nConfig as any)),
    },
  }
}
