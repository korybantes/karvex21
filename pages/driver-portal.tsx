import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  FileText, Calendar, DollarSign, AlertCircle, Upload, LogOut, User, Truck,
  Clock, Shield, Globe, CheckCircle
} from 'lucide-react'

export default function DriverPortal() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [driver, setDriver] = useState<any>(null)
  const [payrollEntries, setPayrollEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])

  // Driving time logger state
  const [logHours, setLogHours] = useState('09:00')
  const [logBreaks, setLogBreaks] = useState('00:45')
  const [weeklyDriveTime, setWeeklyDriveTime] = useState(38) // mock

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'driver') {
      router.push('/dashboard')
      return
    }
    setUser(parsedUser)
    fetchDriverData(parsedUser.driverId)
  }, [])

  const fetchDriverData = async (driverId: string) => {
    if (!driverId) {
      setLoading(false)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDriver(data)
        setPayrollEntries(data.payrollEntries || [])
      }

      // Fetch alerts/reminders
      const resAlerts = await fetch(`/api/reminders?driverId=${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resAlerts.ok) {
        setAlerts(await resAlerts.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleGdprRequest = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestType: 'access',
          requesterId: driver.id,
          requesterEmail: user.email,
          notes: 'Żądanie dostępu do danych osobowych wysłane przez kierowcę przez portal.'
        })
      })
      if (response.ok) {
        alert(t('gdprRequestSent'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getDocStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: t('missing'), color: 'bg-slate-100 text-slate-600 border-slate-200' }
    const today = new Date()
    const exp = new Date(expiryDate)
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { status: `${t('expired')} (${Math.abs(diff)}d)`, color: 'bg-red-50 text-red-700 border-red-100' }
    if (diff <= 30) return { status: `${t('expiresIn')} ${diff}d`, color: 'bg-amber-50 text-amber-700 border-amber-100' }
    return { status: t('valid'), color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  }

  const calculateNetPay = () => {
    const plus = payrollEntries
      .filter(e => ['salary', 'diet'].includes(e.entryType) && e.isPaid)
      .reduce((sum, e) => sum + Number(e.amount), 0)
    const minus = payrollEntries
      .filter(e => ['advance', 'fine', 'deduction'].includes(e.entryType))
      .reduce((sum, e) => sum + Number(e.amount), 0)
    return plus - minus
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900/10 backdrop-blur flex items-center justify-center">
        <p className="text-slate-500 font-semibold">{t('loadingDriverPortal')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Gradient Header */}
      <header className="bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #2563eb, transparent 60%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Truck className="text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">KarVex Portal</span>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider">{t('portalTitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={router.locale}
              onChange={(e) => router.push(router.pathname, router.pathname, { locale: e.target.value })}
              className="bg-white/10 border-0 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="pl" className="text-slate-900">🇵🇱 PL</option>
              <option value="en" className="text-slate-900">🇬🇧 EN</option>
              <option value="tr" className="text-slate-900">🇹🇷 TR</option>
            </select>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-semibold transition-colors">
              <LogOut size={16} /> <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <div className="card flex flex-col md:flex-row items-center md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center shadow-inner">
              {driver?.firstName?.[0]}{driver?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{driver?.firstName} {driver?.lastName}</h2>
              <p className="text-sm text-slate-500">{t('nationality')}: {driver?.nationality} • PESEL/Pasport: {driver?.pesel || driver?.passportNumber}</p>
              <p className="text-xs text-slate-400 mt-1">{t('contractType')}: <span className="font-semibold">{driver?.contractType || 'umowa_o_prace'}</span></p>
            </div>
          </div>
          <button onClick={handleGdprRequest} className="btn-secondary text-xs flex items-center gap-1.5">
            <Shield size={14} /> {t('copyGdpr')}
          </button>
        </div>

        {/* Expiry documents grid */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 text-base">{t('myDocuments')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: t('licenseCE'), expiry: driver?.licenseExpiryDate },
              { name: t('residencePermit'), expiry: driver?.permitExpiryDate },
              { name: t('code95Cert'), expiry: driver?.code95ExpiryDate },
              { name: t('driverCardTacho'), expiry: driver?.driverCardExpiryDate },
              { name: t('medicalExam'), expiry: driver?.medicalExamExpiryDate },
              { name: t('adrCert'), expiry: driver?.adrExpiryDate },
            ].map(doc => {
              const statusInfo = getDocStatus(doc.expiry)
              return (
                <div key={doc.name} className="card flex flex-col justify-between p-4 bg-white border border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">{doc.name}</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {doc.expiry ? new Date(doc.expiry).toLocaleDateString(router.locale === 'tr' ? 'tr-TR' : router.locale === 'en' ? 'en-GB' : 'pl-PL') : t('noData')}
                      </p>
                    </div>
                    <span className={`status-badge ${statusInfo.color} text-[10px]`}>{statusInfo.status}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <label className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-1">
                      <Upload size={12} /> {t('uploadDocument')}
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assigned truck */}
        {driver?.assignments?.length > 0 && driver.assignments[0].isActive && (
          <div className="card space-y-3">
            <h3 className="font-bold text-slate-800 text-base">{t('assignedTruck')}</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Truck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {driver.assignments[0].vehicle.brand} {driver.assignments[0].vehicle.model}
                </p>
                <p className="text-xs text-slate-400">{t('registration')}: {driver.assignments[0].vehicle.plateNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Driving times tracker (Compliance with EU 561/2006) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <Clock size={18} className="text-blue-600" />
              {t('drivingTimeTracker')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('drivingTimeToday')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={logHours}
                  onChange={e => setLogHours(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t('breaksToday')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={logBreaks}
                  onChange={e => setLogBreaks(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>{t('weeklyLimit')}</span>
                <span>{weeklyDriveTime}h / 56h</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-blue-500" style={{ width: `${(weeklyDriveTime/56)*100}%` }} />
              </div>
            </div>
          </div>

          {/* Payroll Summary */}
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <DollarSign size={18} className="text-emerald-600" />
              {t('mySettlements')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('paidThisMonth')}:</span>
                <span className="font-bold text-emerald-600">+{calculateNetPay().toLocaleString()} PLN</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{t('recentTransactions')}</p>
                <div className="space-y-1.5">
                  {payrollEntries.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="flex justify-between text-xs py-1">
                      <span className="text-slate-600 capitalize">{e.entryType} ({e.description})</span>
                      <span className={`font-bold ${['salary', 'diet'].includes(e.entryType) ? 'text-emerald-600' : 'text-red-500'}`}>
                        {['salary', 'diet'].includes(e.entryType) ? '+' : '-'}{Number(e.amount).toLocaleString()} {e.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
    },
  }
}
