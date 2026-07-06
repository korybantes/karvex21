import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import { Plus, Search, Bell, Calendar, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react'

export default function Reminders() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: '', description: '', reminderType: 'document_expiry', triggerDate: '', priority: 'medium'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reminders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setReminders(data)
      } else if (data.reminders) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newReminder)
      })
      if (response.ok) {
        setShowAddModal(false)
        fetchReminders()
        setNewReminder({
          title: '', description: '', reminderType: 'document_expiry', triggerDate: '', priority: 'medium'
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'acknowledged' }),
      })
      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'status-badge status-expired'
      case 'medium':
        return 'status-badge status-expiring'
      default:
        return 'status-badge status-valid'
    }
  }

  const filteredReminders = reminders.filter(r => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = r.title.toLowerCase().includes(term) || (r.description && r.description.toLowerCase().includes(term))
    const matchesPriority = filterPriority === 'all' || r.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('remindersPageTitle')}</h1>
            <p className="page-subtitle">{t('remindersPageSubtitle')}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} /> {t('addReminder')}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('allReminders')}</p>
              <p className="text-slate-900 text-2xl font-bold mt-0.5">{reminders.length}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('pending')}</p>
              <p className="text-amber-600 text-2xl font-bold mt-0.5">{reminders.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('critical')}</p>
              <p className="text-red-600 text-2xl font-bold mt-0.5">
                {reminders.filter(r => r.priority === 'critical' && r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('searchReminders')}
              className="input-field pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="input-field py-2 text-xs w-full sm:w-48"
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="critical">{t('critical')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>
        </div>

        {/* Reminders Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Przypomnienie</th>
                <th>Typ</th>
                <th>Data wyzwolenia</th>
                <th>Priorytet</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">{t('loading')}</td>
                </tr>
              ) : filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">{t('noActiveReminders')}</td>
                </tr>
              ) : (
                filteredReminders.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p className="font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">{r.description || '-'}</p>
                    </td>
                    <td className="text-xs capitalize font-medium text-slate-500">{r.reminderType.replace('_', ' ')}</td>
                    <td className="text-xs font-semibold">{new Date(r.triggerDate).toLocaleDateString('pl-PL')}</td>
                    <td>
                      <span className={getPriorityBadge(r.priority)}>{r.priority}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${r.status === 'pending' ? 'status-expiring' : 'status-valid'}`}>
                        {r.status === 'pending' ? t('pending') : t('completed')}
                      </span>
                    </td>
                    <td>
                      {r.status === 'pending' && (
                        <button onClick={() => handleAcknowledge(r.id)} className="btn-secondary py-1 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50">
                          {t('acknowledge')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{t('newReminder')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddReminder}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">{t('reminderTitle')}</label>
                  <input type="text" required className="input-field" placeholder="np. Badanie techniczne tacho WA12345" value={newReminder.title} onChange={e => setNewReminder({ ...newReminder, title: e.target.value })} />
                </div>
                <div>
                  <label className="label">{t('detailedDescription')}</label>
                  <textarea className="input-field" rows={2} value={newReminder.description} onChange={e => setNewReminder({ ...newReminder, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('reminderDate')}</label>
                    <input type="date" required className="input-field" value={newReminder.triggerDate} onChange={e => setNewReminder({ ...newReminder, triggerDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Priorytet</label>
                    <select className="input-field" value={newReminder.priority} onChange={e => setNewReminder({ ...newReminder, priority: e.target.value })}>
                      <option value="low">Niski (Low)</option>
                      <option value="medium">Średni (Medium)</option>
                      <option value="high">Wysoki (High)</option>
                      <option value="critical">Krytyczny (Critical)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('addReminder')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
