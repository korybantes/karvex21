import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Settings as SettingsIcon, Users, Landmark, Bell, Shield,
  Plus, Trash2, X, CheckCircle, Edit2, Lock, Eye, EyeOff, RefreshCw, UserCog, KeyRound, Save
} from 'lucide-react'

type Tab = 'company' | 'users' | 'gdpr' | 'account'
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
  const [editUser, setEditUser] = useState<any>(null)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editPwVisible, setEditPwVisible] = useState(false)
  const [newPwVisible, setNewPwVisible] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [newUser, setNewUser] = useState({
    email: '', firstName: '', lastName: '', password: '', role: 'driver', driverId: ''
  })
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  // My Account
  const [myAccount, setMyAccount] = useState({ firstName: '', lastName: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [myAccSaving, setMyAccSaving] = useState(false)
  const [myAccMsg, setMyAccMsg] = useState('')
  const [myAccErr, setMyAccErr] = useState('')
  const [myPwVisible, setMyPwVisible] = useState(false)
  const [myNewPwVisible, setMyNewPwVisible] = useState(false)

  // GDPR
  const [gdprLogs, setGdprLogs] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    const u = JSON.parse(userData)
    setUser(u)
    setMyAccount(prev => ({ ...prev, firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '' }))

    if (u.role !== 'admin') {
      setActiveTab('account')
      setLoading(false)
      return
    }

    if (router.query.tab === 'users') {
      setActiveTab('users')
    } else if (router.query.tab === 'gdpr') {
      setActiveTab('gdpr')
    } else if (router.query.tab === 'account') {
      setActiveTab('account')
    } else {
      setActiveTab('company')
    }

    fetchData()
  }, [router.query.tab])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const [resUsers, resGdpr, resDrivers] = await Promise.all([
        fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/gdpr', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/drivers', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resUsers.ok) setUsersList(await resUsers.json())
      if (resGdpr.ok) setGdprLogs(await resGdpr.json())
      if (resDrivers.ok) setDrivers(await resDrivers.json())
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
    setDeleteUserId(userId)
  }

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setDeleteUserId(null)
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

  const openEditUser = (u: any) => {
    setEditUser({ ...u, password: '', currentPassword: '' })
    setEditError('')
    setEditSuccess('')
    setShowEditUser(true)
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess('')
    try {
      const token = localStorage.getItem('token')
      const body: any = {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        role: editUser.role,
        driverId: editUser.driverId || '',
        isActive: editUser.isActive,
      }
      if (editUser.password) body.password = editUser.password
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setEditSuccess(locale === 'tr' ? 'Kullanıcı güncellendi!' : 'User updated successfully!')
        fetchData()
        setTimeout(() => { setShowEditUser(false); setEditSuccess('') }, 1500)
      } else {
        const err = await res.json()
        setEditError(err.error || (locale === 'tr' ? 'Güncelleme başarısız' : 'Update failed'))
      }
    } catch (e) { console.error(e) }
  }

  const handleSaveMyAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setMyAccErr('')
    setMyAccMsg('')
    if (myAccount.newPassword && myAccount.newPassword !== myAccount.confirmPassword) {
      setMyAccErr(locale === 'tr' ? 'Yeni şifreler eşleşmiyor' : 'New passwords do not match')
      return
    }
    setMyAccSaving(true)
    try {
      const token = localStorage.getItem('token')
      const body: any = {
        firstName: myAccount.firstName,
        lastName: myAccount.lastName,
      }
      if (myAccount.newPassword) {
        body.password = myAccount.newPassword
        body.currentPassword = myAccount.currentPassword
      }
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setMyAccMsg(locale === 'tr' ? 'Hesabınız güncellendi!' : 'Account updated successfully!')
        setMyAccount(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
        // Update local storage name
        const updatedUser = await res.json()
        localStorage.setItem('user', JSON.stringify({ ...user, firstName: updatedUser.firstName, lastName: updatedUser.lastName }))
      } else {
        const err = await res.json()
        setMyAccErr(err.error || (locale === 'tr' ? 'Güncelleme başarısız' : 'Update failed'))
      }
    } catch (e) { console.error(e) }
    setMyAccSaving(false)
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
  const isAdmin = user.role === 'admin'

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
          {isAdmin && (
            <div onClick={() => setActiveTab('company')} className={`tab-item ${activeTab === 'company' ? 'active' : ''}`}>
              <Landmark size={14} /> {locale === 'tr' ? 'Şirket & Oranlar' : 'Company & Rates'}
            </div>
          )}
          {isAdmin && (
            <div onClick={() => setActiveTab('users')} className={`tab-item ${activeTab === 'users' ? 'active' : ''}`}>
              <Users size={14} /> {t('users')}
              {usersList.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{usersList.length}</span>
              )}
            </div>
          )}
          {isAdmin && (
            <div onClick={() => setActiveTab('gdpr')} className={`tab-item ${activeTab === 'gdpr' ? 'active' : ''}`}>
              <Shield size={14} /> {t('gdpr')}
            </div>
          )}
          <div onClick={() => setActiveTab('account')} className={`tab-item ${activeTab === 'account' ? 'active' : ''}`}>
            <UserCog size={14} /> {locale === 'tr' ? 'Hesabım' : 'My Account'}
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
                              onClick={() => openEditUser(u)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title={locale === 'tr' ? 'Düzenle' : 'Edit'}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleToggleActive(u.id, u.isActive)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
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

        {/* ── MY ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div className="space-y-5">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-1 inline-block ${roleColor(user.role)}`}>{roleLabel(user.role)}</span>
                </div>
              </div>
              <form onSubmit={handleSaveMyAccount} className="space-y-5">
                <div>
                  <p className="form-section-title mb-3"><UserCog size={14} /> {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Info'}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">{locale === 'tr' ? 'Ad' : 'First Name'}</label>
                      <input type="text" className="input-field" value={myAccount.firstName}
                        onChange={e => setMyAccount({ ...myAccount, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{locale === 'tr' ? 'Soyad' : 'Last Name'}</label>
                      <input type="text" className="input-field" value={myAccount.lastName}
                        onChange={e => setMyAccount({ ...myAccount, lastName: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-5">
                  <p className="form-section-title mb-3"><KeyRound size={14} /> {locale === 'tr' ? 'Şifre Değiştir' : 'Change Password'}</p>
                  <div className="space-y-3">
                    <div>
                      <label className="label">{locale === 'tr' ? 'Mevcut Şifre' : 'Current Password'}</label>
                      <div className="relative">
                        <input
                          type={myPwVisible ? 'text' : 'password'}
                          className="input-field pr-10"
                          placeholder={locale === 'tr' ? 'Mevcut şifrenizi girin' : 'Enter current password'}
                          value={myAccount.currentPassword}
                          onChange={e => setMyAccount({ ...myAccount, currentPassword: e.target.value })}
                        />
                        <button type="button" onClick={() => setMyPwVisible(!myPwVisible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {myPwVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="label">{locale === 'tr' ? 'Yeni Şifre' : 'New Password'}</label>
                        <div className="relative">
                          <input
                            type={myNewPwVisible ? 'text' : 'password'}
                            className="input-field pr-10"
                            placeholder={locale === 'tr' ? 'En az 6 karakter' : 'Min. 6 characters'}
                            value={myAccount.newPassword}
                            onChange={e => setMyAccount({ ...myAccount, newPassword: e.target.value })}
                          />
                          <button type="button" onClick={() => setMyNewPwVisible(!myNewPwVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {myNewPwVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="label">{locale === 'tr' ? 'Şifre Tekrar' : 'Confirm Password'}</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder={locale === 'tr' ? 'Yeni şifreyi tekrar girin' : 'Repeat new password'}
                          value={myAccount.confirmPassword}
                          onChange={e => setMyAccount({ ...myAccount, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {myAccErr && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{myAccErr}</div>
                )}
                {myAccMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <CheckCircle size={14} /> {myAccMsg}
                  </div>
                )}

                <div className="flex justify-end">
                  <button type="submit" disabled={myAccSaving} className="btn-primary flex items-center gap-2">
                    <Save size={15} />
                    {myAccSaving
                      ? (locale === 'tr' ? 'Kaydediliyor...' : 'Saving...')
                      : (locale === 'tr' ? 'Değişiklikleri Kaydet' : 'Save Changes')}
                  </button>
                </div>
              </form>
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
                      {locale === 'tr' ? 'Bağlanacak Şoför Profili (isteğe bağlı)' : 'Link Driver Profile (optional)'}
                    </label>
                    <select
                      className="input-field"
                      value={newUser.driverId}
                      onChange={e => setNewUser({ ...newUser, driverId: e.target.value })}
                    >
                      <option value="">{locale === 'tr' ? 'Seçiniz (isteğe bağlı)' : 'Select profile (optional)'}</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.firstName} {d.lastName} {d.pesel ? `(PESEL: ${d.pesel})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {locale === 'tr'
                        ? 'Şoför portalına erişim için kullanıcıyı şoför kaydıyla bağlar'
                        : 'Links this account to a driver profile for portal access'}
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

      {/* ── EDIT USER MODAL ── */}
      {showEditUser && editUser && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit2 size={16} className="text-blue-600" />
                {locale === 'tr' ? 'Kullanıcıyı Düzenle' : 'Edit User'}
              </h3>
              <button onClick={() => setShowEditUser(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="modal-body space-y-4">
                {/* Avatar + name header */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                    {editUser.firstName?.[0]}{editUser.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{editUser.firstName} {editUser.lastName}</p>
                    <p className="text-xs text-slate-400">{editUser.email}</p>
                  </div>
                  <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-lg ${roleColor(editUser.role)}`}>{roleLabel(editUser.role)}</span>
                </div>

                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{locale === 'tr' ? 'Ad' : 'First Name'}</label>
                    <input type="text" className="input-field" value={editUser.firstName}
                      onChange={e => setEditUser({ ...editUser, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{locale === 'tr' ? 'Soyad' : 'Last Name'}</label>
                    <input type="text" className="input-field" value={editUser.lastName}
                      onChange={e => setEditUser({ ...editUser, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" value={editUser.email}
                    onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{locale === 'tr' ? 'Rol' : 'Role'}</label>
                    <select className="input-field" value={editUser.role}
                      onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                      <option value="admin">{locale === 'tr' ? 'Yönetici' : 'Administrator'}</option>
                      <option value="accountant">{locale === 'tr' ? 'Muhasebeci' : 'Accountant'}</option>
                      <option value="driver">{locale === 'tr' ? 'Şoför' : 'Driver'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{locale === 'tr' ? 'Durum' : 'Status'}</label>
                    <select className="input-field" value={editUser.isActive ? 'active' : 'blocked'}
                      onChange={e => setEditUser({ ...editUser, isActive: e.target.value === 'active' })}>
                      <option value="active">{locale === 'tr' ? 'Aktif' : 'Active'}</option>
                      <option value="blocked">{locale === 'tr' ? 'Engellendi' : 'Blocked'}</option>
                    </select>
                  </div>
                </div>

                {editUser.role === 'driver' && (
                  <div>
                    <label className="label">{locale === 'tr' ? 'Bağlı Şoför Profili' : 'Linked Driver Profile'}</label>
                    <select className="input-field" value={editUser.driverId || ''}
                      onChange={e => setEditUser({ ...editUser, driverId: e.target.value })}>
                      <option value="">{locale === 'tr' ? 'Seçiniz' : 'None'}</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.firstName} {d.lastName} {d.pesel ? `(PESEL: ${d.pesel})` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password reset section */}
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                    <KeyRound size={12} />
                    {locale === 'tr' ? 'Şifre Sıfırla (isteğe bağlı)' : 'Reset Password (optional)'}
                  </p>
                  <div className="relative">
                    <input
                      type={editPwVisible ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder={locale === 'tr' ? 'Boş bırakılırsa şifre değişmez' : 'Leave blank to keep current password'}
                      value={editUser.password || ''}
                      onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                    />
                    <button type="button" onClick={() => setEditPwVisible(!editPwVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {editPwVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {editError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{editError}</div>}
                {editSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <CheckCircle size={14} /> {editSuccess}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditUser(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save size={14} /> {locale === 'tr' ? 'Kaydet' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE USER CONFIRM MODAL ── */}
      {deleteUserId && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{locale === 'tr' ? 'Kullanıcıyı Sil' : 'Delete User'}</h3>
              <button onClick={() => setDeleteUserId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-slate-600">
                {locale === 'tr' 
                  ? 'Bu kullanıcı hesabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
                  : 'Are you sure you want to delete this user account? This action cannot be undone.'}
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteUserId(null)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={confirmDeleteUser} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {locale === 'tr' ? 'Sil' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'tr', ['common'], nextI18nConfig as any)) }
})
