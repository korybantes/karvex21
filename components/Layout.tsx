import { ReactNode, useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  AlertTriangle,
  Globe,
  Activity,
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  user: any
}

export default function Layout({ children, user }: LayoutProps) {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/reminders?status=pending&limit=8', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : (data.reminders || [])
        setNotifications(items.slice(0, 8))
        setUnread(items.filter((r: any) => !r.isRead).length)
      }
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'accountant': return 'Księgowy'
      case 'driver': return 'Kierowca'
      default: return role
    }
  }

  const adminNav = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('drivers'), href: '/drivers', icon: Users },
    { name: t('vehicles'), href: '/vehicles', icon: Truck },
    { name: t('documents'), href: '/documents', icon: FileText },
    { name: t('accounting'), href: '/accounting', icon: Calculator },
    { name: t('reports'), href: '/reports', icon: BarChart3 },
    { name: t('reminders'), href: '/reminders', icon: Bell },
    { name: t('activity'), href: '/activity', icon: Activity },
    { name: t('settings'), href: '/settings', icon: Settings },
  ]

  const accountantNav = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('accounting'), href: '/accounting', icon: Calculator },
    { name: t('reports'), href: '/reports', icon: BarChart3 },
    { name: t('documents'), href: '/documents', icon: FileText },
  ]

  const navigation = user?.role === 'accountant' ? accountantNav : adminNav

  const getPriorityDot = (priority: string) => {
    if (priority === 'critical' || priority === 'high') return 'bg-red-500'
    if (priority === 'medium') return 'bg-amber-500'
    return 'bg-blue-500'
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Truck className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none">KarVex</span>
              <div className="text-blue-400 text-[10px] font-medium tracking-widest">FLEET</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-400 text-xs truncate">{roleLabel(user?.role)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Nawigacja</p>
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = router.pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`nav-item group ${isActive ? 'active' : 'text-slate-400'}`}>
                  <Icon size={18} className={`nav-item-icon ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={isActive ? 'text-white' : 'group-hover:text-slate-200'}>{item.name}</span>
                  {item.href === '/reminders' && unread > 0 && (
                    <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{unread}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
                <Menu size={22} />
              </button>
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {navigation.find(n => n.href === router.pathname)?.name || 'KarVex'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language */}
              <div className="relative">
                <select
                  value={router.locale}
                  onChange={(e) => router.push(router.pathname, router.pathname, { locale: e.target.value })}
                  className="appearance-none pl-8 pr-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none"
                >
                  <option value="pl">🇵🇱 PL</option>
                  <option value="en">🇬🇧 EN</option>
                  <option value="tr">🇹🇷 TR</option>
                </select>
                <Globe size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-slide-up">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">Przypomnienia</span>
                      <Link href="/reminders" onClick={() => setNotifOpen(false)}>
                        <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">Zobacz wszystkie</span>
                      </Link>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">Brak przypomnień</div>
                      ) : notifications.map((n: any) => (
                        <div key={n.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(n.priority)}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {n.triggerDate ? new Date(n.triggerDate).toLocaleDateString('pl-PL') : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout button in header */}
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors text-slate-600"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
