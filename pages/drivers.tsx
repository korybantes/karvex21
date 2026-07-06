import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Plus, Search, Filter, MoreVertical, FileText, AlertCircle, Trash2, Edit2,
  Calendar, CreditCard, Shield, HeartPulse, User, Award, PlusCircle, CheckCircle, Truck, Clock
} from 'lucide-react'

export default function Drivers() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNationality, setFilterNationality] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDocStatus, setFilterDocStatus] = useState('all')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'docs' | 'payroll' | 'vehicle'>('docs')

  // Add form state
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', DOB: '', gender: 'M', nationality: 'PL',
    pesel: '', passportNumber: '', permitType: 'Karta pobytu',
    permitIssueDate: '', permitExpiryDate: '', licenseClass: 'C+E',
    licenseIssueCountry: 'PL', licenseIssueDate: '', licenseExpiryDate: '',
    code95Number: '', code95IssueDate: '', code95ExpiryDate: '',
    driverCardNumber: '', driverCardIssueDate: '', driverCardExpiryDate: '',
    medicalExamDate: '', medicalExamExpiryDate: '', adrCertificateNumber: '',
    adrExpiryDate: '', employmentStartDate: '', contractType: 'umowa_o_prace',
    address: '', emergencyContactName: '', emergencyContactPhone: '',
    baseSalary: '4500', iban: '', phone1: '', phone2: '', picture: ''
  })

  // Payroll Quick Add
  const [showPayrollModal, setShowPayrollModal] = useState(false)
  const [payrollData, setPayrollData] = useState({
    entryType: 'salary', amount: '', currency: 'PLN', description: '', entryDate: '', isPaid: false
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/drivers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = async (driverId: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const d = await res.json()
        setSelectedDriver(d)
        setShowDetailsModal(true)
        setActiveTab('docs')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const phones = []
      if (formData.phone1) phones.push(formData.phone1)
      if (formData.phone2) phones.push(formData.phone2)

      const body = {
        ...formData,
        phoneNumbers: phones
      }

      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        setShowAddModal(false)
        fetchDrivers()
        // Reset form
        setFormData({
          firstName: '', lastName: '', DOB: '', gender: 'M', nationality: 'PL',
          pesel: '', passportNumber: '', permitType: 'Karta pobytu',
          permitIssueDate: '', permitExpiryDate: '', licenseClass: 'C+E',
          licenseIssueCountry: 'PL', licenseIssueDate: '', licenseExpiryDate: '',
          code95Number: '', code95IssueDate: '', code95ExpiryDate: '',
          driverCardNumber: '', driverCardIssueDate: '', driverCardExpiryDate: '',
          medicalExamDate: '', medicalExamExpiryDate: '', adrCertificateNumber: '',
          adrExpiryDate: '', employmentStartDate: '', contractType: 'umowa_o_prace',
          address: '', emergencyContactName: '', emergencyContactPhone: '',
          baseSalary: '4500', iban: '', phone1: '', phone2: '', picture: ''
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddPayrollEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDriver) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/drivers/${selectedDriver.id}/payroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...payrollData,
          amount: parseFloat(payrollData.amount)
        })
      })

      if (response.ok) {
        setShowPayrollModal(false)
        // Refresh details
        handleOpenDetails(selectedDriver.id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleGdprRequest = async () => {
    if (!selectedDriver) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestType: 'export',
          requesterId: selectedDriver.id,
          requesterEmail: `${selectedDriver.firstName.toLowerCase()}.${selectedDriver.lastName.toLowerCase()}@fleet.pl`,
          notes: 'Zarządzenie danych z poziomu profilu administratora.'
        })
      })
      if (response.ok) {
        alert('Zgłoszenie RODO zostało pomyślnie utworzone!')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getDriverDocStatus = (driver: any) => {
    const today = new Date()
    const warningDate = new Date()
    warningDate.setDate(today.getDate() + 30)

    const expiries = [
      { name: 'Karta pobytu', date: driver.permitExpiryDate },
      { name: 'Prawo jazdy', date: driver.licenseExpiryDate },
      { name: 'Kod 95', date: driver.code95ExpiryDate },
      { name: 'Karta kierowcy', date: driver.driverCardExpiryDate },
      { name: 'Badania lekarskie', date: driver.medicalExamExpiryDate },
      { name: 'Certyfikat ADR', date: driver.adrExpiryDate }
    ].filter(d => d.date)

    let status = 'valid'
    let worstDoc = ''
    for (const exp of expiries) {
      const d = new Date(exp.date)
      if (d < today) {
        return { status: 'expired', docName: exp.name }
      } else if (d < warningDate) {
        status = 'expiring'
        worstDoc = exp.name
      }
    }
    return { status, docName: worstDoc }
  }

  const filteredDrivers = drivers.filter(d => {
    const fullName = `${d.firstName} ${d.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      d.pesel?.includes(searchTerm) ||
      d.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesNat = filterNationality === 'all' || d.nationality === filterNationality
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? d.isActive : !d.isActive)

    const docStatusInfo = getDriverDocStatus(d)
    const matchesDoc = filterDocStatus === 'all' || docStatusInfo.status === filterDocStatus

    return matchesSearch && matchesNat && matchesStatus && matchesDoc
  })

  // Expiry counts
  const expiredDocsCount = drivers.filter(d => getDriverDocStatus(d).status === 'expired').length
  const expiringDocsCount = drivers.filter(d => getDriverDocStatus(d).status === 'expiring').length

  const getFlag = (nat: string) => {
    switch (nat) {
      case 'PL': return '🇵🇱'
      case 'TR': return '🇹🇷'
      case 'UA': return '🇺🇦'
      case 'BY': return '🇧🇾'
      case 'DE': return '🇩🇪'
      case 'RO': return '🇷🇴'
      case 'LT': return '🇱🇹'
      default: return '🌍'
    }
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('driversPageTitle')}</h1>
            <p className="page-subtitle">{t('driversPageSubtitle')}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} /> {t('addDriver')}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('totalDrivers')}</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{drivers.length}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('activeDriversLabel')}</p>
            <p className="text-emerald-600 text-2xl font-bold mt-1">{drivers.filter(d => d.isActive).length}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('expiredDocuments')}</p>
            <p className="text-red-600 text-2xl font-bold mt-1">{expiredDocsCount}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('expiringDocuments')}</p>
            <p className="text-amber-600 text-2xl font-bold mt-1">{expiringDocsCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('searchDrivers')}
              className="input-field pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterNationality}
              onChange={e => setFilterNationality(e.target.value)}
              className="input-field py-2 text-xs"
            >
              <option value="all">{t('allNationalities')}</option>
              <option value="PL">Polski (PL)</option>
              <option value="TR">Turecki (TR)</option>
              <option value="UA">Ukraiński (UA)</option>
              <option value="BY">Białoruski (BY)</option>
            </select>
            <select
              value={filterDocStatus}
              onChange={e => setFilterDocStatus(e.target.value)}
              className="input-field py-2 text-xs"
            >
              <option value="all">{t('docStatus')}</option>
              <option value="valid">{t('allValid')}</option>
              <option value="expiring">{t('expiringSoon')}</option>
              <option value="expired">{t('expired')}</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-field py-2 text-xs"
            >
              <option value="all">{t('allDrivers')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('driver')}</th>
                <th>{t('country')}</th>
                <th>{t('license')}</th>
                <th>{t('code95')}</th>
                <th>{t('driverCard')}</th>
                <th>{t('docStatusShort')}</th>
                <th>{t('status')}</th>
                <th className="no-print">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">{t('loadingDrivers')}</td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">{t('noResults')}</td>
                </tr>
              ) : (
                filteredDrivers.map(d => {
                  const docInfo = getDriverDocStatus(d)
                  return (
                    <tr key={d.id}>
                      <td className="font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          {d.picture ? (
                            <img src={d.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {d.firstName[0]}{d.lastName[0]}
                            </div>
                          )}
                          <div>
                            <p>{d.firstName} {d.lastName}</p>
                            <p className="text-xs text-slate-400 font-normal">{d.pesel || d.passportNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlag(d.nationality)}</span>
                          <span className="text-xs text-slate-500">{d.nationality}</span>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium">{d.licenseClass || '-'}</p>
                        <p className="text-xs text-slate-400">
                          {t('expires')}: {d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString('pl-PL') : '-'}
                        </p>
                      </td>
                      <td className="text-xs font-mono">{d.code95Number || '-'}</td>
                      <td className="text-xs">
                        {d.driverCardExpiryDate ? new Date(d.driverCardExpiryDate).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td>
                        {docInfo.status === 'expired' && <span className="status-badge status-expired" title={docInfo.docName}>{t('expired')}: {docInfo.docName}</span>}
                        {docInfo.status === 'expiring' && <span className="status-badge status-expiring" title={docInfo.docName}>{t('soon')}: {docInfo.docName}</span>}
                        {docInfo.status === 'valid' && <span className="status-badge status-valid">{t('valid')}</span>}
                      </td>
                      <td>
                        <span className={`status-badge ${d.isActive ? 'status-valid' : 'status-info'}`}>
                          {d.isActive ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="no-print">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenDetails(d.id)} className="btn-secondary px-2.5 py-1.5 text-xs">
                            {t('details')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-lg">{t('addNewDriver')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddDriver}>
              <div className="modal-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('firstName')}</label>
                    <input type="text" required className="input-field" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('lastName')}</label>
                    <input type="text" required className="input-field" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">{t('nationality')}</label>
                    <select className="input-field" value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })}>
                      <option value="PL">PL - Polska</option>
                      <option value="TR">TR - Turcja</option>
                      <option value="UA">UA - Ukraina</option>
                      <option value="BY">BY - Białoruś</option>
                      <option value="DE">DE - Niemcy</option>
                    </select>
                  </div>
                  {formData.nationality === 'PL' ? (
                    <div>
                      <label className="label">{t('pesel')}</label>
                      <input type="text" className="input-field" value={formData.pesel} onChange={e => setFormData({ ...formData, pesel: e.target.value })} />
                    </div>
                  ) : (
                    <div>
                      <label className="label">{t('passportNumber')}</label>
                      <input type="text" className="input-field" value={formData.passportNumber} onChange={e => setFormData({ ...formData, passportNumber: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <label className="label">{t('permitExpiry')}</label>
                    <input type="date" className="input-field" value={formData.permitExpiryDate} onChange={e => setFormData({ ...formData, permitExpiryDate: e.target.value })} />
                  </div>
                </div>

                <div className="form-section space-y-4">
                  <p className="form-section-title"><CreditCard size={16} /> {t('drivingLicense')} & {t('code95')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">{t('licenseClass')}</label>
                      <select className="input-field" value={formData.licenseClass} onChange={e => setFormData({ ...formData, licenseClass: e.target.value })}>
                        <option value="C">C</option>
                        <option value="C+E">C+E</option>
                        <option value="C1">C1</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('licenseExpiry')}</label>
                      <input type="date" className="input-field" value={formData.licenseExpiryDate} onChange={e => setFormData({ ...formData, licenseExpiryDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('code95Expiry')}</label>
                      <input type="date" className="input-field" value={formData.code95ExpiryDate} onChange={e => setFormData({ ...formData, code95ExpiryDate: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="form-section space-y-4">
                  <p className="form-section-title"><Shield size={16} /> {t('driverCard')} & {t('medicalExam')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">{t('driverCardNumber')}</label>
                      <input type="text" className="input-field" value={formData.driverCardNumber} onChange={e => setFormData({ ...formData, driverCardNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('driverCardExpiry')}</label>
                      <input type="date" className="input-field" value={formData.driverCardExpiryDate} onChange={e => setFormData({ ...formData, driverCardExpiryDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('medicalExamExpiry')}</label>
                      <input type="date" className="input-field" value={formData.medicalExamExpiryDate} onChange={e => setFormData({ ...formData, medicalExamExpiryDate: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('contractType')}</label>
                    <select className="input-field" value={formData.contractType} onChange={e => setFormData({ ...formData, contractType: e.target.value })}>
                      <option value="umowa_o_prace">Umowa o pracę</option>
                      <option value="B2B">Kontrakt B2B</option>
                      <option value="umowa_zlecenie">Umowa zlecenie</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('baseSalary')}</label>
                    <input type="number" className="input-field" value={formData.baseSalary} onChange={e => setFormData({ ...formData, baseSalary: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('phone')}</label>
                    <input type="text" className="input-field" placeholder="+48 123 456 789" value={formData.phone1} onChange={e => setFormData({ ...formData, phone1: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('pictureUrl')}</label>
                    <input type="text" className="input-field" placeholder="https://..." value={formData.picture} onChange={e => setFormData({ ...formData, picture: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('saveDriver')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{t('driverProfile')}: {selectedDriver.firstName} {selectedDriver.lastName}</h3>
                <p className="text-xs text-slate-400">{selectedDriver.pesel || selectedDriver.passportNumber} • {getFlag(selectedDriver.nationality)} {selectedDriver.nationality}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Tab navigation */}
              <div className="tab-bar mb-6">
                <div onClick={() => setActiveTab('docs')} className={`tab-item ${activeTab === 'docs' ? 'active' : ''}`}>{t('documents')}</div>
                <div onClick={() => setActiveTab('payroll')} className={`tab-item ${activeTab === 'payroll' ? 'active' : ''}`}>{t('settlements')}</div>
                <div onClick={() => setActiveTab('vehicle')} className={`tab-item ${activeTab === 'vehicle' ? 'active' : ''}`}>{t('vehicleEu')}</div>
              </div>

              {activeTab === 'docs' && (
                <div className="space-y-6">
                  {/* Grid of documents */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: t('residencePermit'), expiry: selectedDriver.permitExpiryDate },
                      { name: t('drivingLicense'), expiry: selectedDriver.licenseExpiryDate },
                      { name: t('code95'), expiry: selectedDriver.code95ExpiryDate },
                      { name: t('driverCard'), expiry: selectedDriver.driverCardExpiryDate },
                      { name: t('medicalExam'), expiry: selectedDriver.medicalExamExpiryDate },
                      { name: t('adr'), expiry: selectedDriver.adrExpiryDate },
                    ].map(doc => {
                      const days = doc.expiry ? Math.ceil((new Date(doc.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
                      return (
                        <div key={doc.name} className="border border-slate-100 p-4 rounded-xl bg-slate-50 flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">{doc.name}</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">
                              {doc.expiry ? new Date(doc.expiry).toLocaleDateString('pl-PL') : t('noData')}
                            </p>
                          </div>
                          <div className="mt-3">
                            {days === null ? (
                              <span className="status-badge status-info">{t('noDate')}</span>
                            ) : days < 0 ? (
                              <span className="status-badge status-expired">{t('expiredAgo')} ({Math.abs(days)}d temu)</span>
                            ) : days <= 30 ? (
                              <span className="status-badge status-expiring">{t('expiresInDays')} ({days}d)</span>
                            ) : (
                              <span className="status-badge status-valid">{t('validForDays')} ({days}d)</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-3 justify-between pt-4 border-t border-slate-100">
                    <button onClick={handleGdprRequest} className="btn-secondary text-xs">
                      <Shield size={14} /> {t('gdprRequest')}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">{t('transactionHistory')}</h4>
                    <button onClick={() => setShowPayrollModal(true)} className="btn-primary text-xs py-1.5 px-3">
                      {t('addPaymentEntry')}
                    </button>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('type')}</th>
                          <th>{t('description')}</th>
                          <th>{t('amount')}</th>
                          <th>{t('date')}</th>
                          <th>{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDriver.payrollEntries?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-slate-400">{t('noTransactions')}</td>
                          </tr>
                        ) : selectedDriver.payrollEntries?.map((e: any) => (
                          <tr key={e.id}>
                            <td className="capitalize font-medium">{e.entryType}</td>
                            <td className="text-xs text-slate-500">{e.description || '-'}</td>
                            <td className={`font-bold ${['salary', 'diet'].includes(e.entryType) ? 'text-emerald-600' : 'text-red-500'}`}>
                              {['salary', 'diet'].includes(e.entryType) ? '+' : '-'}{Number(e.amount).toLocaleString('pl-PL')} {e.currency}
                            </td>
                            <td>{new Date(e.entryDate).toLocaleDateString('pl-PL')}</td>
                            <td>
                              <span className={`status-badge ${e.isPaid ? 'status-valid' : 'status-expiring'}`}>
                                {e.isPaid ? t('paid') : t('pending')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'vehicle' && (
                <div className="space-y-6">
                  {selectedDriver.assignments?.length > 0 && selectedDriver.assignments[0].isActive ? (
                    <div className="card-gradient-blue p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs font-semibold uppercase">{t('assignedVehicle')}</p>
                        <p className="text-white text-lg font-bold mt-1">
                          {selectedDriver.assignments[0].vehicle.brand} {selectedDriver.assignments[0].vehicle.model}
                        </p>
                        <p className="text-blue-100 text-xs">{selectedDriver.assignments[0].vehicle.plateNumber}</p>
                      </div>
                      <Truck size={32} className="text-white/30" />
                    </div>
                  ) : (
                    <div className="alert-amber">
                      <AlertCircle size={16} />
                      <p className="text-sm">{t('noVehicleAssigned')}</p>
                    </div>
                  )}

                  <div className="form-section">
                    <p className="form-section-title"><Clock size={16} /> {t('drivingTimeRegulations')}</p>
                    <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                      <li><strong>{t('dailyDrivingTime')}:</strong> {t('dailyDrivingTimeDesc')}</li>
                      <li><strong>{t('breaks')}:</strong> {t('breaksDesc')}</li>
                      <li><strong>{t('weeklyDrivingTime')}:</strong> {t('weeklyDrivingTimeDesc')}</li>
                      <li><strong>{t('biweeklyDrivingTime')}:</strong> {t('biweeklyDrivingTimeDesc')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-t border-slate-100 pt-4">
              <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">Dodaj rozliczenie płacowe</h3>
              <button onClick={() => setShowPayrollModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddPayrollEntry}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">Typ wpisu</label>
                  <select
                    className="input-field"
                    value={payrollData.entryType}
                    onChange={e => setPayrollData({ ...payrollData, entryType: e.target.value })}
                  >
                    <option value="salary">Wynagrodzenie (Salary)</option>
                    <option value="diet">Dieta (Diet)</option>
                    <option value="advance">Zaliczka (Advance)</option>
                    <option value="fine">Mandat/Kara (Fine)</option>
                    <option value="deduction">Potrącenie (Deduction)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Kwota</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={payrollData.amount}
                      onChange={e => setPayrollData({ ...payrollData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Waluta</label>
                    <select
                      className="input-field"
                      value={payrollData.currency}
                      onChange={e => setPayrollData({ ...payrollData, currency: e.target.value })}
                    >
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Data wpisu</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={payrollData.entryDate}
                    onChange={e => setPayrollData({ ...payrollData, entryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Opis / Referencja</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="np. Dieta zagraniczna czerwiec"
                    value={payrollData.description}
                    onChange={e => setPayrollData({ ...payrollData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={payrollData.isPaid}
                    onChange={e => setPayrollData({ ...payrollData, isPaid: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPaid" className="text-xs text-slate-600 font-semibold">Oznaczyć jako wypłacone / opłacone</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPayrollModal(false)} className="btn-secondary">Anuluj</button>
                <button type="submit" className="btn-primary">Dodaj wpis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

function X({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pl', ['common'], nextI18nConfig as any)),
    },
  }
}
