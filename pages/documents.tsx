import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Plus, Search, FileText, Download, AlertCircle, Calendar,
  Trash2, X, Upload, CheckCircle, Eye, RefreshCw, Filter
} from 'lucide-react'

type DocTab = 'company' | 'driver' | 'vehicle' | 'pending'

const COMPANY_STATIC = [
  { type: 'krsCompany', num: 'KRS 0000123456', expiry: null, file: null },
  { type: 'transportLicense', num: 'WGT/2020/98765', expiry: '2030-05-12', file: null },
  { type: 'communityLicense', num: 'GITD-LW-54321', expiry: '2030-05-12', file: null },
  { type: 'ocpPolicy', num: 'OCP-PZU-998811', expiry: '2027-02-15', file: null },
]

export default function Documents() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const locale = router.locale || 'tr'
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<DocTab>('company')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const [documents, setDocuments] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterEntityId, setFilterEntityId] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Alert/Confirm modals
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectDocId, setRejectDocId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [formData, setFormData] = useState({
    documentName: '',
    documentType: 'driver_license',
    relatedEntityType: 'driver',
    relatedEntityId: '',
    issueDate: '',
    expiryDate: '',
    documentNumber: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const [resDocs, resDrv, resVeh] = await Promise.all([
        fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/drivers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (resDocs.ok) setDocuments(await resDocs.json())
      if (resDrv.ok) setDrivers(await resDrv.json())
      if (resVeh.ok) setVehicles(await resVeh.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && formData.relatedEntityType !== 'company') {
      setErrorMessage(locale === 'tr' ? 'Lütfen bir dosya seçin.' : 'Please select a file.')
      setShowErrorModal(true)
      return
    }
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      if (selectedFile) fd.append('file', selectedFile)
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))

      const endpoint = selectedFile ? '/api/documents/upload' : '/api/documents'
      let res: Response
      if (selectedFile) {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...formData, filePath: '/uploads/placeholder.pdf' }),
        })
      }
      if (res.ok) {
        setUploadSuccess(true)
        setTimeout(() => {
          setUploadSuccess(false)
          setShowAddModal(false)
          setSelectedFile(null)
          setFormData({ documentName: '', documentType: 'driver_license', relatedEntityType: 'driver', relatedEntityId: '', issueDate: '', expiryDate: '', documentNumber: '' })
          fetchData()
        }, 1200)
      } else {
        const err = await res.json()
        setErrorMessage(`Error: ${err.error || 'Upload failed'}`)
        setShowErrorModal(true)
      }
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleDeleteDoc = async (id: string) => {
    setDeleteDocId(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteDoc = async () => {
    if (!deleteDocId) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/documents/${deleteDocId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setShowDeleteConfirm(false)
      setDeleteDocId(null)
      fetchData()
    } catch (e) { console.error(e) }
  }

  const handleApproveDoc = async (id: string, approve: boolean, reason?: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: approve ? 'valid' : 'rejected',
          rejectionReason: reason || null
        })
      })

      if (response.ok) {
        fetchData()
      } else {
        setErrorMessage('Action failed')
        setShowErrorModal(true)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const openRejectModal = (id: string) => {
    setRejectDocId(id)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (rejectDocId) {
      handleApproveDoc(rejectDocId, false, rejectionReason)
      setShowRejectModal(false)
      setRejectDocId(null)
      setRejectionReason('')
    }
  }

  const handleDownload = async (doc: any) => {
    if (!doc.filePath) {
      setErrorMessage(locale === 'tr' ? 'Bu belge için dosya bulunamadı.' : 'No file found for this document.')
      setShowErrorModal(true)
      return
    }
    try {
      // Fetch the file as a blob to force download (bypasses cross-origin download restriction)
      const response = await fetch(doc.filePath)
      if (!response.ok) throw new Error('Failed to fetch file')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Try to preserve extension from the URL
      const urlParts = doc.filePath.split('/')
      const originalFilename = urlParts[urlParts.length - 1].split('?')[0]
      a.download = doc.documentName ? `${doc.documentName}_${originalFilename}` : originalFilename || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      // Fallback: open in new tab
      window.open(doc.filePath, '_blank')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }, [])

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return 'valid'
    const today = new Date()
    const expiry = new Date(expiryDate)
    const warn = new Date(); warn.setDate(today.getDate() + 30)
    if (expiry < today) return 'expired'
    if (expiry < warn) return 'expiring'
    return 'valid'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'expired') return <span className="status-badge status-expired">{t('expired')}</span>
    if (status === 'expiring') return <span className="status-badge status-expiring">{t('expiringSoon')}</span>
    return <span className="status-badge status-valid">{t('valid')}</span>
  }

  const docTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      company_license: t('krsCompany'), community_license: t('communityLicense'),
      ocp: t('ocpPolicy'), vehicle_registration: t('vehicleRegistration'),
      vehicle_insurance: t('vehicleInsurance'), vehicle_inspection: t('vehicleTechnicalInspection'),
      driver_license: t('driverLicense'), driver_permit: t('workPermit'),
      code_95: t('code95'), driver_card: t('driverCard'),
      krsCompany: t('krsCompany'), transportLicense: t('transportLicense'),
      communityLicense: t('communityLicense'), ocpPolicy: t('ocpPolicy'),
    }
    return map[type] || type
  }

  const fmtDate = (d: string | null) => {
    if (!d) return t('unlimited')
    return new Date(d).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB')
  }

  const filteredDriverDocs = documents.filter(doc => {
    if (doc.relatedEntityType !== 'driver') return false
    const matchSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEntity = filterEntityId === 'all' || doc.relatedEntityId === filterEntityId
    return matchSearch && matchEntity
  })

  const filteredVehicleDocs = documents.filter(doc => {
    if (doc.relatedEntityType !== 'vehicle') return false
    const matchSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchEntity = filterEntityId === 'all' || doc.relatedEntityId === filterEntityId
    return matchSearch && matchEntity
  })

  if (!user) return null

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t('documents')}</h1>
            <p className="page-subtitle">
              {locale === 'tr'
                ? 'Şirket, araç ve şoför belgelerinin yönetimi'
                : 'Manage company, vehicle and driver document archive'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="btn-secondary p-2" title={t('refresh')}>
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> {t('addDocument')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <div onClick={() => { setActiveTab('company'); setFilterEntityId('all'); setSearchTerm('') }}
            className={`tab-item ${activeTab === 'company' ? 'active' : ''}`}>
            {t('companyDocuments')}
          </div>
          <div onClick={() => { setActiveTab('driver'); setFilterEntityId('all'); setSearchTerm('') }}
            className={`tab-item ${activeTab === 'driver' ? 'active' : ''}`}>
            {t('driverDocuments')}
            {filteredDriverDocs.filter(d => getExpiryStatus(d.expiryDate) !== 'valid').length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {filteredDriverDocs.filter(d => getExpiryStatus(d.expiryDate) !== 'valid').length}
              </span>
            )}
          </div>
          <div onClick={() => { setActiveTab('vehicle'); setFilterEntityId('all'); setSearchTerm('') }}
            className={`tab-item ${activeTab === 'vehicle' ? 'active' : ''}`}>
            {t('vehicleDocuments')}
            {filteredVehicleDocs.filter(d => getExpiryStatus(d.expiryDate) !== 'valid').length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {filteredVehicleDocs.filter(d => getExpiryStatus(d.expiryDate) !== 'valid').length}
              </span>
            )}
          </div>
          <div onClick={() => { setActiveTab('pending'); setFilterEntityId('all'); setSearchTerm('') }}
            className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}>
            {locale === 'tr' ? 'Onay Bekleyenler' : 'Pending Approval'}
            {documents.filter(d => d.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {documents.filter(d => d.status === 'pending').length}
              </span>
            )}
          </div>
        </div>

        {/* ── COMPANY DOCS ── */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('mainLicensesAndRegistrations')}
            </p>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('licenseType')}</th>
                    <th>{t('registrationNumber')}</th>
                    <th>{t('expiryDate')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPANY_STATIC.map((d, i) => {
                    const status = getExpiryStatus(d.expiry)
                    return (
                      <tr key={i}>
                        <td className="font-semibold text-slate-800">{docTypeLabel(d.type)}</td>
                        <td className="font-mono text-xs text-slate-600">{d.num}</td>
                        <td className="text-xs">{fmtDate(d.expiry)}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          <button className="btn-secondary p-1.5 flex items-center gap-1 text-xs">
                            <Download size={13} /> {t('download')}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {/* DB company docs */}
                  {documents.filter(d => d.relatedEntityType === 'company').map(doc => {
                    const status = getExpiryStatus(doc.expiryDate)
                    return (
                      <tr key={doc.id}>
                        <td className="font-semibold text-slate-800 flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" /> {doc.documentName}
                        </td>
                        <td className="font-mono text-xs text-slate-600">{doc.documentNumber || '-'}</td>
                        <td className="text-xs">{fmtDate(doc.expiryDate)}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {doc.filePath && (
                              <button onClick={() => handleDownload(doc)} className="btn-secondary p-1.5" title={t('download')}>
                                <Download size={13} />
                              </button>
                            )}
                            <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors" title={t('delete')}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DRIVER DOCS ── */}
        {activeTab === 'driver' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder={locale === 'tr' ? 'Belge adına göre ara...' : 'Search by document name...'}
                  className="input-field pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterEntityId}
                onChange={e => setFilterEntityId(e.target.value)}
                className="input-field py-2 text-xs w-full sm:w-56"
              >
                <option value="all">{t('allDrivers')}</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
              </select>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('documentName')}</th>
                    <th>{locale === 'tr' ? 'Tür' : 'Type'}</th>
                    <th>{locale === 'tr' ? 'Belge No' : 'Doc No.'}</th>
                    <th>{locale === 'tr' ? 'Şoför' : 'Driver'}</th>
                    <th>{t('expiryDate')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">{t('loading')}</td></tr>
                  ) : filteredDriverDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">{t('noDriverDocuments')}</p>
                      </td>
                    </tr>
                  ) : filteredDriverDocs.map(doc => {
                    const status = getExpiryStatus(doc.expiryDate)
                    const driver = drivers.find(d => d.id === doc.relatedEntityId)
                    return (
                      <tr key={doc.id}>
                        <td className="font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-blue-400 flex-shrink-0" />
                            <span>{doc.documentName}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600">{docTypeLabel(doc.documentType)}</td>
                        <td className="font-mono text-xs text-slate-500">{doc.documentNumber || '-'}</td>
                        <td className="text-sm">
                          {driver ? `${driver.firstName} ${driver.lastName}` : (doc.driver ? `${doc.driver.firstName} ${doc.driver.lastName}` : '-')}
                        </td>
                        <td className="text-xs">{fmtDate(doc.expiryDate)}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {doc.filePath && (
                              <button
                                onClick={() => handleDownload(doc)}
                                className="btn-secondary p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title={t('download')}
                              >
                                <Download size={13} />
                              </button>
                            )}
                            {doc.filePath && (
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary p-1.5 hover:bg-slate-100 transition-colors"
                                title={t('view')}
                              >
                                <Eye size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VEHICLE DOCS ── */}
        {activeTab === 'vehicle' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder={locale === 'tr' ? 'Belge adına göre ara...' : 'Search by document name...'}
                  className="input-field pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterEntityId}
                onChange={e => setFilterEntityId(e.target.value)}
                className="input-field py-2 text-xs w-full sm:w-56"
              >
                <option value="all">{t('allVehicles')}</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand}</option>)}
              </select>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('documentName')}</th>
                    <th>{locale === 'tr' ? 'Tür' : 'Type'}</th>
                    <th>{locale === 'tr' ? 'Belge No' : 'Doc No.'}</th>
                    <th>{locale === 'tr' ? 'Araç' : 'Vehicle'}</th>
                    <th>{t('expiryDate')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-6 text-slate-400">{t('loading')}</td></tr>
                  ) : filteredVehicleDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        <FileText size={28} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">{t('noVehicleDocuments')}</p>
                      </td>
                    </tr>
                  ) : filteredVehicleDocs.map(doc => {
                    const status = getExpiryStatus(doc.expiryDate)
                    const vehicle = vehicles.find(v => v.id === doc.relatedEntityId)
                    return (
                      <tr key={doc.id}>
                        <td className="font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-purple-400 flex-shrink-0" />
                            <span>{doc.documentName}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600">{docTypeLabel(doc.documentType)}</td>
                        <td className="font-mono text-xs text-slate-500">{doc.documentNumber || '-'}</td>
                        <td className="text-sm">{vehicle ? vehicle.plateNumber : (doc.vehicle ? doc.vehicle.plateNumber : '-')}</td>
                        <td className="text-xs">{fmtDate(doc.expiryDate)}</td>
                        <td>{getStatusBadge(status)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {doc.filePath && (
                              <button
                                onClick={() => handleDownload(doc)}
                                className="btn-secondary p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title={t('download')}
                              >
                                <Download size={13} />
                              </button>
                            )}
                            {doc.filePath && (
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary p-1.5"
                                title={t('view')}
                              >
                                <Eye size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PENDING APPROVAL DOCS ── */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">
              {locale === 'tr' ? 'Onay Bekleyen Sürücü Belgeleri' : 'Driver Documents Pending Approval'}
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('documentName')}</th>
                    <th>{locale === 'tr' ? 'Tür' : 'Type'}</th>
                    <th>{locale === 'tr' ? 'Şoför' : 'Driver'}</th>
                    <th>{t('expiryDate')}</th>
                    <th>{locale === 'tr' ? 'Yükleyen' : 'Uploaded By'}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.filter(d => d.status === 'pending').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        <CheckCircle size={28} className="mx-auto text-emerald-500 mb-2" />
                        <p className="text-sm">{locale === 'tr' ? 'Onay bekleyen belge bulunmamaktadır.' : 'All documents are processed. No pending approval.'}</p>
                      </td>
                    </tr>
                  ) : (
                    documents.filter(d => d.status === 'pending').map(doc => {
                      const driver = drivers.find(d => d.id === doc.relatedEntityId)
                      return (
                        <tr key={doc.id}>
                          <td className="font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-blue-400 flex-shrink-0" />
                              <span>{doc.documentName}</span>
                            </div>
                          </td>
                          <td className="text-xs text-slate-600">{docTypeLabel(doc.documentType)}</td>
                          <td className="text-sm">
                            {driver ? `${driver.firstName} ${driver.lastName}` : (doc.driver ? `${doc.driver.firstName} ${doc.driver.lastName}` : '-')}
                          </td>
                          <td className="text-xs">{fmtDate(doc.expiryDate)}</td>
                          <td className="text-xs text-slate-500">
                            {doc.uploadedByUser ? `${doc.uploadedByUser.firstName} ${doc.uploadedByUser.lastName}` : (doc.uploadedBy ? 'Kierowca / Driver' : '-')}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {doc.filePath && (
                                <a
                                  href={doc.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn-secondary p-1.5 hover:bg-slate-100 transition-colors"
                                  title={t('view')}
                                >
                                  <Eye size={13} />
                                </a>
                              )}
                              {doc.filePath && (
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="btn-secondary p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                  title={t('download')}
                                >
                                  <Download size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleApproveDoc(doc.id, true)}
                                className="btn-primary py-1 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 flex items-center gap-1"
                              >
                                {locale === 'tr' ? 'Onayla' : 'Approve'}
                              </button>
                              <button
                                onClick={() => openRejectModal(doc.id)}
                                className="btn-secondary py-1 px-2.5 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 flex items-center gap-1"
                              >
                                {locale === 'tr' ? 'Reddet' : 'Reject'}
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
        )}
      </div>

      {/* ── ADD / UPLOAD MODAL ── */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{t('addDocument')}</h3>
              <button onClick={() => { setShowAddModal(false); setSelectedFile(null) }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body space-y-4">

                {/* Document name */}
                <div>
                  <label className="label">{t('documentName')} *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder={locale === 'tr' ? 'örn. Sürücü Belgesi 2024' : 'e.g. Driver License 2024'}
                    value={formData.documentName}
                    onChange={e => setFormData({ ...formData, documentName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Doc type */}
                  <div>
                    <label className="label">{locale === 'tr' ? 'Belge Türü' : 'Document Type'}</label>
                    <select
                      className="input-field"
                      value={formData.documentType}
                      onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                    >
                      <option value="driver_license">{t('driverLicense')}</option>
                      <option value="driver_permit">{t('workPermit')}</option>
                      <option value="code_95">{t('code95')}</option>
                      <option value="driver_card">{t('driverCard')}</option>
                      <option value="vehicle_registration">{t('vehicleRegistration')}</option>
                      <option value="vehicle_insurance">{t('vehicleInsurance')}</option>
                      <option value="vehicle_inspection">{t('vehicleTechnicalInspection')}</option>
                      <option value="community_license">{t('communityLicense')}</option>
                      <option value="ocp">{t('ocpPolicy')}</option>
                      <option value="other">{locale === 'tr' ? 'Diğer' : 'Other'}</option>
                    </select>
                  </div>

                  {/* Associated with */}
                  <div>
                    <label className="label">{t('associatedWith')}</label>
                    <select
                      className="input-field"
                      value={formData.relatedEntityType}
                      onChange={e => setFormData({ ...formData, relatedEntityType: e.target.value, relatedEntityId: '' })}
                    >
                      <option value="company">{t('company')}</option>
                      <option value="driver">{t('driver')}</option>
                      <option value="vehicle">{t('vehicle')}</option>
                    </select>
                  </div>
                </div>

                {/* Entity selector */}
                {formData.relatedEntityType === 'driver' && (
                  <div>
                    <label className="label">{locale === 'tr' ? 'Şoför Seç *' : 'Select Driver *'}</label>
                    <select
                      required
                      className="input-field"
                      value={formData.relatedEntityId}
                      onChange={e => setFormData({ ...formData, relatedEntityId: e.target.value })}
                    >
                      <option value="">{t('chooseDriver')}</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                    </select>
                  </div>
                )}
                {formData.relatedEntityType === 'vehicle' && (
                  <div>
                    <label className="label">{locale === 'tr' ? 'Araç Seç *' : 'Select Vehicle *'}</label>
                    <select
                      required
                      className="input-field"
                      value={formData.relatedEntityId}
                      onChange={e => setFormData({ ...formData, relatedEntityId: e.target.value })}
                    >
                      <option value="">{t('chooseVehicle')}</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} – {v.brand} {v.model}</option>)}
                    </select>
                  </div>
                )}

                {/* Document number */}
                <div>
                  <label className="label">{t('documentNumber')} ({t('optional')})</label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder={locale === 'tr' ? 'Belge/Seri numarası' : 'Document / serial number'}
                    value={formData.documentNumber}
                    onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('issueDate')}</label>
                    <input type="date" className="input-field" value={formData.issueDate}
                      onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('expiryDate')}</label>
                    <input type="date" className="input-field" value={formData.expiryDate}
                      onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                </div>

                {/* File upload zone */}
                <div>
                  <label className="label">{t('upload')} (PDF, JPG, PNG, DOCX)</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                      dragOver ? 'border-blue-400 bg-blue-50' : selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-700 truncate max-w-xs">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setSelectedFile(null) }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">
                          {locale === 'tr' ? 'Dosya sürükle & bırak veya tıkla' : 'Drag & drop or click to select'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {locale === 'tr' ? 'Maks. 25 MB – PDF, JPG, PNG, DOCX' : 'Max 25 MB – PDF, JPG, PNG, DOCX'}
                        </p>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      className="hidden"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setSelectedFile(null) }}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary min-w-[120px]" disabled={uploading}>
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" />
                      </svg>
                      {locale === 'tr' ? 'Yükleniyor...' : 'Uploading...'}
                    </span>
                  ) : uploadSuccess ? (
                    <span className="flex items-center gap-2"><CheckCircle size={16} /> {t('success')}</span>
                  ) : (
                    <span className="flex items-center gap-2"><Upload size={16} /> {locale === 'tr' ? 'Yükle & Kaydet' : 'Upload & Save'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ERROR MODAL ── */}
      {showErrorModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{locale === 'tr' ? 'Hata' : 'Error'}</h3>
              <button onClick={() => setShowErrorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-slate-600">{errorMessage}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowErrorModal(false)} className="btn-primary">{locale === 'tr' ? 'Tamam' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{locale === 'tr' ? 'Belgeyi Sil' : 'Delete Document'}</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-slate-600">
                {locale === 'tr' 
                  ? 'Bu belgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
                  : 'Are you sure you want to delete this document? This action cannot be undone.'}
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={confirmDeleteDoc} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {locale === 'tr' ? 'Sil' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{locale === 'tr' ? 'Belgeyi Reddet' : 'Reject Document'}</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <p className="text-sm text-slate-600">
                {locale === 'tr' 
                  ? 'Bu belgeyi reddetmek istediğinizden emin misiniz?'
                  : 'Are you sure you want to reject this document?'}
              </p>
              <div>
                <label className="label">{locale === 'tr' ? 'Reddetme nedeni (isteğe bağlı)' : 'Rejection reason (optional)'}</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder={locale === 'tr' ? 'Neden belge reddedildi?' : 'Why is this document being rejected?'}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={confirmReject} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600">
                {locale === 'tr' ? 'Reddet' : 'Reject'}
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
