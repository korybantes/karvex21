import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Users, Truck, AlertTriangle, CheckCircle,
  Clock, Euro, Banknote, FileWarning, ArrowUpRight, ArrowDownRight,
  Fuel, ShieldAlert, Wrench, FileText, Bell, Calendar, ChevronRight,
  Activity as ActivityIcon
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2']

export default function Dashboard() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<'PLN' | 'EUR'>('PLN')

  const locale = router.locale || 'en'

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    const u = JSON.parse(userData)
    setUser(u)
    if (u.role === 'driver') { router.push('/driver-portal'); return }
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/reports/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v: number) => {
    if (currency === 'EUR') {
      return `€${(v / 4.27).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `${v.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB')
  const fmtDateTime = (d: string) => new Date(d).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB')

  if (!user) return null

  const totalIncome = data?.totalIncome || 0
  const totalExpenses = data?.totalExpenses || 0
  const netProfit = totalIncome - totalExpenses
  const activeDrivers = data?.activeDrivers || 0
  const activeVehicles = data?.activeVehicles || 0
  const criticalAlerts = data?.criticalAlerts || 0
  const monthlyRevenue = data?.monthlyRevenue || []
  const expenseBreakdown = data?.expenseBreakdown || []
  const upcomingExpirations = data?.upcomingExpirations || []
  const upcomingPayments = data?.upcomingPayments || []
  const recentActivity = data?.recentActivity || []
  const vehiclePL = data?.vehicleProfitLoss || []

  const expensePieData = expenseBreakdown.slice(0, 6).map((e: any) => ({
    name: e.category, value: parseFloat(e.amount) || 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm border border-white/10">
        <p className="font-semibold text-slate-300 mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }

  const getDaysUntil = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getExpiryBadge = (days: number) => {
    if (days < 0) return <span className="status-badge status-expired">{t('expired')}</span>
    if (days <= 7) return <span className="status-badge status-expired">{days}d</span>
    if (days <= 30) return <span className="status-badge status-expiring">{days}d</span>
    return <span className="status-badge status-valid">{days}d</span>
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t('dashboard')}</h1>
            <p className="page-subtitle">
              {locale === 'tr'
                ? `Hoş geldiniz, ${user.firstName}! İşte bugünkü filo özetin.`
                : `Welcome back, ${user.firstName}! Here is your fleet overview for today.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrency(currency === 'PLN' ? 'EUR' : 'PLN')}
              className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
            >
              {currency === 'PLN' ? <><Euro size={14} /> EUR</> : <><Banknote size={14} /> PLN</>}
            </button>
            <span className="text-xs text-slate-400 hidden sm:block">EUR/PLN: 4.27</span>
          </div>
        </div>

        {/* Critical alerts banner */}
        {criticalAlerts > 0 && (
          <div className="alert-red flex items-start gap-3 rounded-2xl p-4">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {locale === 'tr'
                  ? `Uyarı: ${criticalAlerts} kritik hatırlatıcı acil dikkat gerektiriyor`
                  : `Warning: ${criticalAlerts} critical alerts require immediate attention`}
              </p>
              <Link href="/reminders">
                <span className="text-xs underline font-medium">
                  {locale === 'tr' ? 'Hatırlatıcıları gör →' : 'See reminders →'}
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="card-gradient-blue rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-widest">
                    {t('revenueThisMonth')}
                  </p>
                  <p className="text-white text-2xl font-bold mt-2">{fmt(totalIncome)}</p>
                  {data?.revenueDelta !== undefined && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {data.revenueDelta >= 0
                        ? <ArrowUpRight size={13} className="text-green-300" />
                        : <ArrowDownRight size={13} className="text-red-300" />}
                      <span className={`text-xs font-medium ${data.revenueDelta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {data.revenueDelta >= 0 ? '+' : ''}{data.revenueDelta?.toFixed(1)}% {t('vsLastMonth')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="card-gradient-red rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-red-200 text-[11px] font-semibold uppercase tracking-widest">
                    {t('expensesThisMonth')}
                  </p>
                  <p className="text-white text-2xl font-bold mt-2">{fmt(totalExpenses)}</p>
                  {data?.expensesDelta !== undefined && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {data.expensesDelta >= 0
                        ? <ArrowUpRight size={13} className="text-red-300" />
                        : <ArrowDownRight size={13} className="text-green-300" />}
                      <span className={`text-xs font-medium ${data.expensesDelta >= 0 ? 'text-red-300' : 'text-green-300'}`}>
                        {data.expensesDelta >= 0 ? '+' : ''}{data.expensesDelta?.toFixed(1)}% {t('vsLastMonth')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingDown size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div
              className={netProfit >= 0 ? 'card-gradient-green' : 'card-gradient-red'}
              style={{ borderRadius: '1rem', padding: '1.25rem' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest">
                    {t('netProfit')}
                  </p>
                  <p className="text-white text-2xl font-bold mt-2">{fmt(netProfit)}</p>
                  <p className="text-emerald-200 text-xs mt-1.5">
                    {t('margin')}: {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  {netProfit >= 0 ? <TrendingUp size={20} className="text-white" /> : <TrendingDown size={20} className="text-white" />}
                </div>
              </div>
            </div>

            {/* Fleet */}
            <div className="card-gradient-purple rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-200 text-[11px] font-semibold uppercase tracking-widest">
                    {t('fleet')}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <div>
                      <p className="text-white text-2xl font-bold">{activeDrivers}</p>
                      <p className="text-purple-300 text-[11px] font-medium">{t('drivers')}</p>
                    </div>
                    <div className="w-px h-9 bg-white/20" />
                    <div>
                      <p className="text-white text-2xl font-bold">{activeVehicles}</p>
                      <p className="text-purple-300 text-[11px] font-medium">{t('vehicles')}</p>
                    </div>
                  </div>
                </div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Expenses Area Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h2 className="font-bold text-slate-800 text-base">{t('revenueVsExpenses')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('last6Months')}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{t('revenue')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />{t('expenses')}
                </span>
              </div>
            </div>
            {loading ? (
              <div className="skeleton h-56 rounded-xl" />
            ) : monthlyRevenue.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-400 text-sm">{t('noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.14} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name={t('revenue')} stroke="#2563eb" strokeWidth={2.5} fill="url(#gradBlue)" dot={{ fill: '#2563eb', r: 3.5 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="expenses" name={t('expenses')} stroke="#ef4444" strokeWidth={2.5} fill="url(#gradRed)" dot={{ fill: '#ef4444', r: 3.5 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Expense Breakdown Pie */}
          <div className="card">
            <div className="mb-4">
              <h2 className="font-bold text-slate-800 text-base">{t('expenseBreakdown')}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t('expenseCategories')}</p>
            </div>
            {loading ? (
              <div className="skeleton h-56 rounded-xl" />
            ) : expensePieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-400 text-sm">{t('noData')}</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [`${Number(v).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 0 })} zł`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {expensePieData.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600 capitalize truncate max-w-[110px]">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {Number(item.value).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 0 })} zł
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expiring Documents */}
          <div className="card lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-base">{t('expiringDocuments')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('next30Days')}</p>
              </div>
              <Link href="/reminders">
                <span className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-0.5">
                  {t('viewAll')} <ChevronRight size={12} />
                </span>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            ) : upcomingExpirations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={32} className="mx-auto text-emerald-300 mb-2" />
                <p className="text-sm">{t('allDocumentsValid')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingExpirations.slice(0, 7).map((exp: any, i: number) => {
                  const days = getDaysUntil(exp.expiryDate)
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{exp.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{exp.entityName}</p>
                      </div>
                      {getExpiryBadge(days)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Vehicle P&L Bar Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-base">{t('vehicleProfitability')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('profitLossPerVehicle')}</p>
              </div>
              <Link href="/reports">
                <span className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-0.5">
                  {t('reports')} <ChevronRight size={12} />
                </span>
              </Link>
            </div>
            {loading ? (
              <div className="skeleton h-48 rounded-xl" />
            ) : vehiclePL.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Truck size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm">{t('noData')}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {vehiclePL.slice(0, 6).map((v: any, i: number) => {
                  const income = parseFloat(v.income || 0)
                  const exp = parseFloat(v.expenses || 0)
                  const profit = income - exp
                  const maxVal = Math.max(...vehiclePL.slice(0, 6).map((x: any) => Math.abs(parseFloat(x.income || 0))))
                  const pct = maxVal > 0 ? Math.min(100, (income / maxVal) * 100) : 0
                  const profPct = income > 0 ? Math.min(100, (Math.abs(profit) / income) * 100) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Truck size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{v.plateNumber}</p>
                            <p className="text-xs text-slate-400">{v.brand} {v.model}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}{profit.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 0 })} zł
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {income.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 0 })} zł {t('revenue').toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: 'linear-gradient(90deg, #2563eb, #7c3aed)'
                          }}
                        />
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 mix-blend-multiply`}
                          style={{
                            width: `${profPct}%`,
                            background: profit >= 0 ? 'rgba(5,150,105,0.35)' : 'rgba(220,38,38,0.35)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Payments + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Payments */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-base">{t('upcomingPayments')}</h2>
              <Calendar size={16} className="text-slate-400" />
            </div>
            {loading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            ) : upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={28} className="mx-auto text-emerald-300 mb-2" />
                <p className="text-sm">{t('noUpcomingPayments')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingPayments.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{p.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtDate(p.dueDate)}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {parseFloat(p.amount).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-GB', { minimumFractionDigits: 2 })} {p.currency}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-base">{t('recentActivity')}</h2>
              <Link href="/activity">
                <span className="text-blue-600 hover:text-blue-700 text-xs font-medium">{t('viewMore')}</span>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ActivityIcon size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm">{t('noActivity')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((a: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ActivityIcon size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 leading-snug">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'tr', ['common'])) }
})
