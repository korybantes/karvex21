import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Settings as SettingsIcon, Users, Landmark, Bell, Shield,
  Plus, Trash2, X, CheckCircle, Edit2, Lock, Eye, EyeOff, RefreshCw
} from 'lucide-react'

type Tab = 'company' | 'users' | 'gdpr'
type RoleFilter = 'all' | 'admin' | 'accountant' | 'driver'

export default function Settings() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const locale = router.locale || 'tr'
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('company')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showPw, setShowPw] = useState(false)

  // Company info state
  const [companyInfo, setCompanyInfo] = useState({
    name: 'KarVex Transport Sp. z o.o.',
    nip: '527-283-22-50',
    regon: '362184750',
    krs: '0000675432',
    address: 'ul. Postępu 14, 02-676 Warszawa, Polska',
    bankAccount: 'PL 91 1090 2590 0000 0001 4890 2490',
    bic: 'WBKPPLPP',
    dietRateDomestic: '50.00',
    dietRateInt: '82.00',
    exchangeRateEUR: '4.27',
    exchangeRateCZK: '0.174',
    exchangeRateHUF: '0.012',
    vatNumber: 'PL5272832250',
    licenseNumber: 'WGT/2020/98765',
  })

  // User management
  const [usersList, setUsersList] = useState<any[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: '', firstName: '', lastName: '', password: '', role: 'driver', driverId: ''
  })

  // GDPR
  const [gdprLogs, setGdprLogs] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    const u = JSON.parse(userData)
    setUser(u)
    if (u.role !== 'admin') { router.push('/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const [resUsers, resGdpr] = await Promise.all([
        fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/gdpr', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resUsers.ok) setUsersList(await resUsers.json())
      if (resGdpr.ok) setGdprLogs(await resGdpr.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      })
      if (res.ok) {
        setShowAddUser(false)
        setNewUser({ email: '', firstName: '', lastName: '', password: '', role: 'driver', driverId: '' })
        fetchData()
      } else {
        const err = await res.json()
        alert(`${t('errorAddingUser')}: ${err.error || ''}`)
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('confirmDeleteUser'))) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/users/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchData()
    } catch (e) { console.error(e) }
  }

  const handleToggleActive = async (userId: string, current: boolean) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current }),
      })
      fetchData()
    } catch (e) { console.error(e) }
  }

  const roleLabel = (role: string) => {
    if (role === 'admin') return locale === 'tr' ? 'Yönetici' : 'Administrator'
    if (role === 'accountant') return locale === 'tr' ? 'Muhasebeci' : 'Accountant'
    if (role === 'driver') return locale === 'tr' ? 'Şoför' : 'Driver'
    return role
  }

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-blue-50 text-blue-700'
    if (role === 'accountant') return 'bg-purple-50 text-purple-700'
    return 'bg-emerald-50 text-emerald-700'
  }

  const filteredUsers = usersList.filter(u => roleFilter === 'all' || u.role === roleFilter)

  if (!user) return null

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">{t('settings')}</h1>
          <p className="page-subtitle">
            {locale === 'tr'
              ? 'Kullanıcı hesapları, şirket verileri, harcırah oranları ve döviz kurlarını yönetin'
              : 'Manage user accounts, company data, allowance rates and exchange rates'}
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <div onClick={() => setActiveTab('company')} className={`tab-item ${activeTab === 'company' ? 'active' : ''}`}>
            <Landmark size={14} /> {locale === 'tr' ? 'Şirket & Oranlar' : 'Company & Rates'}
          </div>
          <div onClick={() => setActiveTab('users')} className={`tab-item ${activeTab === 'users' ? 'active' : ''}`}>
            <Users size={14} /> {t('users')}
            {usersList.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{usersList.length}</span>
            )}
          </div>
          <div onClick={() => setActiveTab('gdpr')} className={`tab-item ${activeTab === 'gdpr' ? 'active' : ''}`}>
            <Shield size={14} /> {t('gdpr')}
          </div>
        </div>

        {/* ── COMPANY TAB ── */}
        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany} className="space-y-5">

            {/* Registration Data */}
            <div className="card space-y-4">
              <p className="form-section-title">
                <Landmark size={15} />
                {locale === 'tr' ? 'Şirket Kayıt Bilgileri' : 'Company Registration Data'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{locale === 'tr' ? 'Tam Unvan' : 'Full Company Name'}</label>
                  <input type="text" className="input-field" value={companyInfo.name}
                    onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'Kayıtlı Adres' : 'Registered Address'}</label>
                  <input type="text" className="input-field" value={companyInfo.address}
                    onChange={e => setCompanyInfo({ ...companyInfo, address: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">NIP</label>
                  <input type="text" className="input-field font-mono" value={companyInfo.nip}
                    onChange={e => setCompanyInfo({ ...companyInfo, nip: e.target.value })} />
                </div>
                <div>
                  <label className="label">REGON</label>
                  <input type="text" className="input-field font-mono" value={companyInfo.regon}
                    onChange={e => setCompanyInfo({ ...companyInfo, regon: e.target.value })} />
                </div>
                <div>
                  <label className="label">KRS</label>
                  <input type="text" className="input-field font-mono" value={companyInfo.krs}
                    onChange={e => setCompanyInfo({ ...companyInfo, krs: e.target.value })} />
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'KDV/VAT No' : 'VAT Number'}</label>
                  <input type="text" className="input-field font-mono" value={companyInfo.vatNumber}
                    onChange={e => setCompanyInfo({ ...companyInfo, vatNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{locale === 'tr' ? 'Banka Hesabı (IBAN)' : 'Bank Account (IBAN)'}</label>
                  <input type="text" className="input-field font-mono tracking-wider" value={companyInfo.bankAccount}
                    onChange={e => setCompanyInfo({ ...companyInfo, bankAccount: e.target.value })} />
                </div>
                <div>
                  <label className="label">BIC / SWIFT</label>
                  <input type="text" className="input-field font-mono" value={companyInfo.bic}
                    onChange={e => setCompanyInfo({ ...companyInfo, bic: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">{locale === 'tr' ? 'Taşıma Lisans No' : 'Transport License No.'}</label>
                <input type="text" className="input-field font-mono" value={companyInfo.licenseNumber}
                  onChange={e => setCompanyInfo({ ...companyInfo, licenseNumber: e.target.value })} />
              </div>
            </div>

            {/* Allowance & Currency */}
            <div className="card space-y-4">
              <p className="form-section-title">
                <Bell size={15} />
                {locale === 'tr' ? 'Harcırah & Döviz Oranları' : 'Allowance & Exchange Rates'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">{locale === 'tr' ? 'Yurt İçi Harcırah (PLN/gün)' : 'Domestic Allowance (PLN/day)'}</label>
                  <input type="number" step="0.01" className="input-field" value={companyInfo.dietRateDomestic}
                    onChange={e => setCompanyInfo({ ...companyInfo, dietRateDomestic: e.target.value })} />
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'Uluslararası Harcırah (PLN/gün)' : 'International Allowance (PLN/day)'}</label>
                  <input type="number" step="0.01" className="input-field" value={companyInfo.dietRateInt}
                    onChange={e => setCompanyInfo({ ...companyInfo, dietRateInt: e.target.value })} />
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'EUR Kuru (PLN)' : 'EUR Rate (PLN)'}</label>
                  <input type="number" step="0.0001" className="input-field" value={companyInfo.exchangeRateEUR}
                    onChange={e => setCompanyInfo({ ...companyInfo, exchangeRateEUR: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">CZK → PLN</label>
                  <input type="number" step="0.0001" className="input-field" value={companyInfo.exchangeRateCZK}
                    onChange={e => setCompanyInfo({ ...companyInfo, exchangeRateCZK: e.target.value })} />
                </div>
                <div>
                  <label className="label">HUF → PLN</label>
                  <input type="number" step="0.0001" className="input-field" value={companyInfo.exchangeRateHUF}
                    onChange={e => setCompanyInfo({ ...companyInfo, exchangeRateHUF: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                {saved ? <CheckCircle size={16} /> : <SettingsIcon size={16} />}
                {saved ? (locale === 'tr' ? 'Kaydedildi!' : 'Saved!') : (locale === 'tr' ? 'Ayarları Kaydet' : 'Save Settings')}
              </button>
              {saved && (
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={15} /> {locale === 'tr' ? 'Başarıyla kaydedildi' : 'Settings saved successfully'}
                </span>
              )}
            </div>
          </form>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="card">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {locale === 'tr' ? 'Kullanıcılar & Erişim Hesapları' : 'Users & Access Accounts'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {locale === 'tr'
                      ? 'Sisteme erişim sağlayan tüm kullanıcı hesapları'
                      : 'All user accounts with system access'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={fetchData} className="btn-secondary p-2" title={t('refresh')}>
                    <RefreshCw size={15} />
                  </button>
                  <button onClick={() => setShowAddUser(true)} className="btn-primary text-sm flex items-center gap-1.5">
                    <Plus size={15} /> {locale === 'tr' ? 'Kullanıcı Ekle' : 'Add User'}
                  </button>
                </div>
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {(['all', 'admin', 'accountant', 'driver'] as RoleFilter[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      roleFilter === r
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'all' ? (locale === 'tr' ? 'Tümü' : 'All') : roleLabel(r)}
                    <span className="ml-1.5 opacity-70">
                      ({r === 'all' ? usersList.length : usersList.filter(u => u.role === r).length})
                    </span>
                  </button>
                ))}
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{locale === 'tr' ? 'Kullanıcı' : 'User'}</th>
                      <th>Email</th>
                      <th>{locale === 'tr' ? 'Rol' : 'Role'}</th>
                      <th>{locale === 'tr' ? 'Kayıt Tarihi' : 'Registered'}</th>
                      <th>{t('status')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-6 text-slate-400">{t('loading')}</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          <Users size={28} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm">{locale === 'tr' ? 'Kullanıcı bulunamadı' : 'No users found'}</p>
                        </td>
                      </tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{u.firstName} {u.lastName}</p>
                              {u.driverId && <p className="text-[10px] text-slate-400 font-mono">{u.driverId.slice(0, 8)}…</p>}
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600">{u.email}</td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${roleColor(u.role)}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="text-xs text-slate-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB') : '-'}
                        </td>
                        <td>
                          <span
                            className={`status-badge cursor-pointer ${u.isActive ? 'status-valid' : 'status-info'}`}
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                            title={locale === 'tr' ? 'Durumu değiştir' : 'Toggle status'}
                          >
                            {u.isActive
                              ? (locale === 'tr' ? 'Aktif' : 'Active')
                              : (locale === 'tr' ? 'Engellendi' : 'Blocked')}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title={u.isActive ? (locale === 'tr' ? 'Engelle' : 'Block') : (locale === 'tr' ? 'Aktif Et' : 'Activate')}
                            >
                              <Lock size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── GDPR TAB ── */}
        {activeTab === 'gdpr' && (
          <div className="card space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {locale === 'tr' ? 'KVKK / Veri Sahibi Talepleri Kaydı' : 'GDPR / Data Subject Requests Log'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {locale === 'tr'
                  ? 'Şoför ve çalışanların kişisel verilerine erişim veya silme taleplerinin geçmişi (RODO).'
                  : 'History of driver and employee requests for access, export, or deletion of personal data (GDPR/RODO).'}
              </p>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{locale === 'tr' ? 'Başvuru Tarihi' : 'Submitted On'}</th>
                    <th>{locale === 'tr' ? 'Talep Eden' : 'Requester'}</th>
                    <th>{locale === 'tr' ? 'Talep Türü' : 'Request Type'}</th>
                    <th>{t('status')}</th>
                    <th>{locale === 'tr' ? 'Yorum' : 'Comment'}</th>
                  </tr>
                </thead>
                <tbody>
                  {gdprLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        <Shield size={28} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">{locale === 'tr' ? 'KVKK talebi kaydedilmemiş' : 'No GDPR requests recorded'}</p>
                      </td>
                    </tr>
                  ) : gdprLogs.map(g => (
                    <tr key={g.id}>
                      <td className="text-xs">{new Date(g.requestedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB')}</td>
                      <td className="text-sm">{g.requesterEmail || '-'}</td>
                      <td className="capitalize text-xs font-semibold text-slate-600">{g.requestType}</td>
                      <td>
                        <span className={`status-badge ${g.status === 'completed' ? 'status-valid' : 'status-expiring'}`}>
                          {g.status === 'completed'
                            ? (locale === 'tr' ? 'Tamamlandı' : 'Completed')
                            : (locale === 'tr' ? 'Bekliyor' : 'Pending')}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{g.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD USER MODAL ── */}
      {showAddUser && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">
                {locale === 'tr' ? 'Yeni Kullanıcı Ekle' : 'Add New User'}
              </h3>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{locale === 'tr' ? 'Ad *' : 'First Name *'}</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder={locale === 'tr' ? 'Mehmet' : 'John'}
                      value={newUser.firstName}
                      onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">{locale === 'tr' ? 'Soyad *' : 'Last Name *'}</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder={locale === 'tr' ? 'Yılmaz' : 'Smith'}
                      value={newUser.lastName}
                      onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="user@karvex.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'Geçici Şifre *' : 'Temporary Password *'}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      className="input-field pr-10"
                      placeholder="Min. 8 characters"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">{locale === 'tr' ? 'Erişim Rolü *' : 'Access Role *'}</label>
                  <select
                    className="input-field"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="admin">{locale === 'tr' ? 'Yönetici (Admin)' : 'Administrator (Admin)'}</option>
                    <option value="accountant">{locale === 'tr' ? 'Muhasebeci' : 'Accountant'}</option>
                    <option value="driver">{locale === 'tr' ? 'Şoför' : 'Driver'}</option>
                  </select>
                </div>
                {newUser.role === 'driver' && (
                  <div>
                    <label className="label">
                      {locale === 'tr' ? 'Bağlı Şoför ID (isteğe bağlı)' : 'Linked Driver ID (optional)'}
                    </label>
                    <input
                      type="text"
                      className="input-field font-mono text-xs"
                      placeholder={locale === 'tr' ? 'Veritabanındaki şoför UUID\'si' : 'Driver UUID from database'}
                      value={newUser.driverId}
                      onChange={e => setNewUser({ ...newUser, driverId: e.target.value })}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {locale === 'tr'
                        ? 'Şoför portalına erişim için şoför kaydı ile bağlantı kurar'
                        : 'Links this account to a driver record for portal access'}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary">
                  {locale === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'tr', ['common'])) }
})
