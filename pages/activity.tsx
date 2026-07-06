import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import { Activity as ActivityIcon, Search, ShieldAlert, Clock, RefreshCw } from 'lucide-react'

export default function ActivityPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/activity', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        setLogs(await response.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase()
    const name = `${log.user?.firstName || 'System'} ${log.user?.lastName || ''}`.toLowerCase()
    return name.includes(term) || log.action.toLowerCase().includes(term) || log.tableName.toLowerCase().includes(term)
  })

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('activityPageTitle')}</h1>
            <p className="page-subtitle">{t('activityPageSubtitle')}</p>
          </div>
          <button onClick={fetchLogs} className="btn-secondary text-xs flex items-center gap-1">
            <RefreshCw size={14} /> {t('refreshLogs')}
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('filterUserActionTable')}
              className="input-field pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data i godzina</th>
                <th>Użytkownik</th>
                <th>Operacja</th>
                <th>Tabela docelowa</th>
                <th>Adres IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">{t('fetchingLogs')}</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">{t('noActivityLogs')}</td>
                </tr>
              ) : filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="text-xs font-semibold flex items-center gap-1.5 py-4">
                    <Clock size={12} className="text-slate-400" />
                    <span>{new Date(log.createdAt).toLocaleString('pl-PL')}</span>
                  </td>
                  <td>
                    {log.user ? (
                      <div>
                        <p className="font-semibold text-slate-800">{log.user.firstName} {log.user.lastName}</p>
                        <p className="text-[10px] text-slate-400">{log.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">System (cron)</span>
                    )}
                  </td>
                  <td>
                    <span className="font-medium text-slate-700">{log.action}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 border rounded text-slate-600">
                      {log.tableName}
                    </span>
                  </td>
                  <td className="text-xs font-mono text-slate-500">
                    {log.ipAddress || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
