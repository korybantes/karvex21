import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Plus, Search, Filter, MoreVertical, AlertCircle, Wrench, X, Truck, Calendar,
  CreditCard, Activity, DollarSign, Shield
} from 'lucide-react'

export default function Vehicles() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterLeasing, setFilterLeasing] = useState('all')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'docs' | 'service' | 'costs' | 'tolls'>('docs')

  // Service quick add
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceData, setServiceData] = useState({
    odometer: '', serviceType: 'periodical', description: '', cost: '', workshopName: '', invoiceNumber: '', serviceDate: ''
  })

  // Add form state
  const [formData, setFormData] = useState({
    plateNumber: '', plateCountry: 'PL', brand: 'Scania', model: '', year: '2023', vin: '',
    trailerInfo: '', leasingType: 'owned', leasingEndDate: '',
    ocPolicyNumber: '', ocCompany: 'PZU SA', ocStartDate: '', ocExpiryDate: '', ocPremium: '',
    acPolicyNumber: '', acCompany: 'PZU SA', acStartDate: '', acExpiryDate: '', acPremium: '',
    lastInspectionDate: '', nextInspectionDate: '',
    tachographCalibrationDate: '', tachographNextCalibrationDate: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setVehicles(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = async (vehicleId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedVehicle(data)
        setShowDetailsModal(true)
        setActiveTab('docs')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowAddModal(false)
        fetchVehicles()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle) return
    try {
      const token = localStorage.getItem('token')
      // Map to POST /api/vehicles/[id]/expenses with maintenance category
      const res = await fetch(`/api/accounting/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expenseDate: serviceData.serviceDate,
          category: 'maintenance',
          amount: parseFloat(serviceData.cost),
          currency: 'PLN',
          description: `${serviceData.serviceType}: ${serviceData.description} (Przebieg: ${serviceData.odometer} km)`,
          invoiceNumber: serviceData.invoiceNumber,
          vendorName: serviceData.workshopName,
          vehicleId: selectedVehicle.id
        })
      })
      if (res.ok) {
        setShowServiceModal(false)
        handleOpenDetails(selectedVehicle.id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getVehicleDocStatus = (vehicle: any) => {
    const today = new Date()
    const warningDate = new Date()
    warningDate.setDate(today.getDate() + 30)

    const docs = [
      { name: 'Ubezpieczenie OC', date: vehicle.ocExpiryDate },
      { name: 'Ubezpieczenie AC', date: vehicle.acExpiryDate },
      { name: 'Przegląd techniczny', date: vehicle.nextInspectionDate },
      { name: 'Kalibracja tachografu', date: vehicle.tachographNextCalibrationDate }
    ].filter(d => d.date)

    let status = 'valid'
    let worst = ''
    for (const doc of docs) {
      const d = new Date(doc.date)
      if (d < today) {
        return { status: 'expired', name: doc.name }
      } else if (d < warningDate) {
        status = 'expiring'
        worst = doc.name
      }
    }
    return { status, name: worst }
  }

  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = v.plateNumber.toLowerCase().includes(term) ||
      v.brand.toLowerCase().includes(term) ||
      v.model.toLowerCase().includes(term) ||
      v.vin?.toLowerCase().includes(term)

    const matchesBrand = filterBrand === 'all' || v.brand === filterBrand
    const matchesLeasing = filterLeasing === 'all' || v.leasingType === filterLeasing

    return matchesSearch && matchesBrand && matchesLeasing
  })

  const getFlag = (country: string) => {
    switch (country) {
      case 'PL': return '🇵🇱'
      case 'DE': return '🇩🇪'
      case 'FR': return '🇫🇷'
      case 'NL': return '🇳🇱'
      case 'CZ': return '🇨🇿'
      case 'SK': return '🇸🇰'
      case 'HU': return '🇭🇺'
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
            <h1 className="page-title">{t('vehiclesPageTitle')}</h1>
            <p className="page-subtitle">{t('vehiclesPageSubtitle')}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} /> {t('addVehicle')}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('totalFleet')}</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{vehicles.length}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('inLeasing')}</p>
            <p className="text-blue-600 text-2xl font-bold mt-1">{vehicles.filter(v => v.leasingType !== 'owned').length}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('inspectionsSoon')}</p>
            <p className="text-amber-600 text-2xl font-bold mt-1">
              {vehicles.filter(v => getVehicleDocStatus(v).status === 'expiring').length}
            </p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('criticalFailures')}</p>
            <p className="text-red-600 text-2xl font-bold mt-1">
              {vehicles.filter(v => getVehicleDocStatus(v).status === 'expired').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('searchVehicles')}
              className="input-field pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="input-field py-2 text-xs"
            >
              <option value="all">{t('allBrands')}</option>
              <option value="Scania">Scania</option>
              <option value="MAN">MAN</option>
              <option value="DAF">DAF</option>
              <option value="Volvo">Volvo</option>
              <option value="Mercedes-Benz Actros">Mercedes-Benz</option>
            </select>
            <select
              value={filterLeasing}
              onChange={e => setFilterLeasing(e.target.value)}
              className="input-field py-2 text-xs"
            >
              <option value="all">{t('financing')}</option>
              <option value="owned">{t('owned')}</option>
              <option value="operacyjny">{t('operationalLeasing')}</option>
              <option value="finansowy">{t('financialLeasing')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('vehicle')}</th>
                <th>{t('plate')}</th>
                <th>VIN</th>
                <th>{t('leasing')}</th>
                <th>{t('ocInsurance')}</th>
                <th>{t('technicalInspection')}</th>
                <th>{t('tachographCalibration')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">{t('loadingVehicles')}</td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">{t('noVehicles')}</td>
                </tr>
              ) : (
                filteredVehicles.map(v => {
                  const docInfo = getVehicleDocStatus(v)
                  return (
                    <tr key={v.id}>
                      <td className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {v.brand[0]}
                          </div>
                          <div>
                            <p>{v.brand} {v.model}</p>
                            <p className="text-xs text-slate-400 font-normal">{v.year}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 border rounded flex items-center gap-1.5 w-max">
                          <span>{getFlag(v.plateCountry)}</span>
                          <span>{v.plateNumber}</span>
                        </span>
                      </td>
                      <td className="text-xs font-mono">{v.vin || '-'}</td>
                      <td className="text-xs capitalize">{v.leasingType}</td>
                      <td className="text-xs">
                        {v.ocExpiryDate ? new Date(v.ocExpiryDate).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td className="text-xs">
                        {v.nextInspectionDate ? new Date(v.nextInspectionDate).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td className="text-xs">
                        {v.tachographNextCalibrationDate ? new Date(v.tachographNextCalibrationDate).toLocaleDateString('pl-PL') : '-'}
                      </td>
                      <td>
                        {docInfo.status === 'expired' && <span className="status-badge status-expired" title={docInfo.name}>Przeterminowane: {docInfo.name}</span>}
                        {docInfo.status === 'expiring' && <span className="status-badge status-expiring" title={docInfo.name}>Wygasa: {docInfo.name}</span>}
                        {docInfo.status === 'valid' && <span className="status-badge status-valid">Ważne</span>}
                      </td>
                      <td>
                        <button onClick={() => handleOpenDetails(v.id)} className="btn-secondary px-2.5 py-1.5 text-xs">
                          Szczegóły
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-lg">{t('addNewVehicle')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="modal-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('brand')}</label>
                    <select className="input-field" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })}>
                      <option value="Scania">Scania</option>
                      <option value="MAN">MAN</option>
                      <option value="DAF">DAF</option>
                      <option value="Volvo">Volvo</option>
                      <option value="Mercedes-Benz Actros">Mercedes-Benz Actros</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('model')}</label>
                    <input type="text" required className="input-field" placeholder="np. R450" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">{t('registrationCountry')}</label>
                    <select className="input-field" value={formData.plateCountry} onChange={e => setFormData({ ...formData, plateCountry: e.target.value })}>
                      <option value="PL">PL - Polska</option>
                      <option value="DE">DE - Niemcy</option>
                      <option value="FR">FR - Francja</option>
                      <option value="NL">NL - Holandia</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('plateNumber')}</label>
                    <input type="text" required className="input-field" placeholder="np. WA12345" value={formData.plateNumber} onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('year')}</label>
                    <input type="number" className="input-field" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('vinNumber')}</label>
                    <input type="text" required className="input-field" maxLength={17} placeholder="17-znakowy VIN" value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('trailerInfo')}</label>
                    <input type="text" className="input-field" placeholder="Model naczepy/tablice" value={formData.trailerInfo} onChange={e => setFormData({ ...formData, trailerInfo: e.target.value })} />
                  </div>
                </div>

                <div className="form-section space-y-4">
                  <p className="form-section-title"><CreditCard size={16} /> {t('purchaseLeasing')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">{t('financing')}</label>
                      <select className="input-field" value={formData.leasingType} onChange={e => setFormData({ ...formData, leasingType: e.target.value })}>
                        <option value="owned">Własny</option>
                        <option value="operacyjny">Leasing operacyjny</option>
                        <option value="finansowy">Leasing finansowy</option>
                      </select>
                    </div>
                    {formData.leasingType !== 'owned' && (
                      <>
                        <div>
                          <label className="label">{t('leasingEnd')}</label>
                          <input type="date" className="input-field" value={formData.leasingEndDate} onChange={e => setFormData({ ...formData, leasingEndDate: e.target.value })} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-section space-y-4">
                  <p className="form-section-title"><Shield size={16} /> {t('ocTechnical')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">{t('ocInsurer')}</label>
                      <select className="input-field" value={formData.ocCompany} onChange={e => setFormData({ ...formData, ocCompany: e.target.value })}>
                        <option value="PZU SA">PZU SA</option>
                        <option value="ERGO Hestia">ERGO Hestia</option>
                        <option value="Warta">Warta</option>
                        <option value="Allianz Polska">Allianz Polska</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('ocPolicyNumber')}</label>
                      <input type="text" className="input-field" value={formData.ocPolicyNumber} onChange={e => setFormData({ ...formData, ocPolicyNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('ocExpiry')}</label>
                      <input type="date" className="input-field" value={formData.ocExpiryDate} onChange={e => setFormData({ ...formData, ocExpiryDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">{t('nextInspection')}</label>
                      <input type="date" className="input-field" value={formData.nextInspectionDate} onChange={e => setFormData({ ...formData, nextInspectionDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('tachographExpiry')}</label>
                      <input type="date" className="input-field" value={formData.tachographNextCalibrationDate} onChange={e => setFormData({ ...formData, tachographNextCalibrationDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('addVehicleBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Pojazd: {selectedVehicle.brand} {selectedVehicle.model}</h3>
                <p className="text-xs text-slate-400">{selectedVehicle.plateNumber} • VIN: {selectedVehicle.vin}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="tab-bar mb-6">
                <div onClick={() => setActiveTab('docs')} className={`tab-item ${activeTab === 'docs' ? 'active' : ''}`}>Ubezpieczenie & przeglądy</div>
                <div onClick={() => setActiveTab('service')} className={`tab-item ${activeTab === 'service' ? 'active' : ''}`}>Książka serwisowa</div>
                <div onClick={() => setActiveTab('costs')} className={`tab-item ${activeTab === 'costs' ? 'active' : ''}`}>Koszty</div>
                <div onClick={() => setActiveTab('tolls')} className={`tab-item ${activeTab === 'tolls' ? 'active' : ''}`}>Systemy Toll</div>
              </div>

              {activeTab === 'docs' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Ubezpieczenie OC</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">Ubezpieczyciel: {selectedVehicle.ocCompany || 'Brak'}</p>
                      <p className="text-xs text-slate-500 mt-1">Numer polisy: {selectedVehicle.ocPolicyNumber || '-'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Wygasa: {selectedVehicle.ocExpiryDate ? new Date(selectedVehicle.ocExpiryDate).toLocaleDateString('pl-PL') : 'Nie ustawiono'}
                      </p>
                    </div>

                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Badanie techniczne</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        Termin następnego: {selectedVehicle.nextInspectionDate ? new Date(selectedVehicle.nextInspectionDate).toLocaleDateString('pl-PL') : 'Nie ustawiono'}
                      </p>
                    </div>

                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Ważność kalibracji tachografu</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        Następna kalibracja: {selectedVehicle.tachographNextCalibrationDate ? new Date(selectedVehicle.tachographNextCalibrationDate).toLocaleDateString('pl-PL') : 'Nie ustawiono'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'service' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">Historia napraw i serwisu</h4>
                    <button onClick={() => setShowServiceModal(true)} className="btn-primary text-xs py-1.5 px-3">
                      Dodaj wpis serwisowy
                    </button>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Opis</th>
                          <th>Warsztat</th>
                          <th>Kwota netto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVehicle.vehicleExpenses?.filter((e: any) => e.category === 'maintenance').length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-slate-400">Brak historii serwisowej</td>
                          </tr>
                        ) : selectedVehicle.vehicleExpenses?.filter((e: any) => e.category === 'maintenance').map((s: any) => (
                          <tr key={s.id}>
                            <td>{new Date(s.expenseDate).toLocaleDateString('pl-PL')}</td>
                            <td className="text-xs font-medium">{s.description}</td>
                            <td className="text-xs">{s.vendorName || '-'}</td>
                            <td className="font-bold text-slate-900">{Number(s.amount).toLocaleString('pl-PL')} PLN</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'costs' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Wszystkie wydatki przypisane do pojazdu</h4>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Kategoria</th>
                          <th>Opis</th>
                          <th>Dostawca</th>
                          <th>Kwota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVehicle.vehicleExpenses?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-slate-400">Brak zarejestrowanych wydatków</td>
                          </tr>
                        ) : selectedVehicle.vehicleExpenses?.map((e: any) => (
                          <tr key={e.id}>
                            <td>{new Date(e.expenseDate).toLocaleDateString('pl-PL')}</td>
                            <td className="capitalize font-semibold text-xs text-slate-500">{e.category}</td>
                            <td className="text-xs">{e.description || '-'}</td>
                            <td className="text-xs">{e.vendorName || '-'}</td>
                            <td className="font-bold text-red-600">-{Number(e.amount).toLocaleString('pl-PL')} {e.currency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'tolls' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Systemy opłat drogowych (Toll)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">e-TOLL (Polska)</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">Saldo: 450,00 PLN</p>
                      </div>
                      <span className="status-badge status-valid">Aktywny</span>
                    </div>
                    <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Toll Collect (Niemcy)</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">Abonament podpięty</p>
                      </div>
                      <span className="status-badge status-valid">Aktywny</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-t border-slate-100 pt-4">
              <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">Zamknij</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">Dodaj wpis serwisowy</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddService}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label">Typ serwisu</label>
                  <select
                    className="input-field"
                    value={serviceData.serviceType}
                    onChange={e => setServiceData({ ...serviceData, serviceType: e.target.value })}
                  >
                    <option value="periodical">Przegląd okresowy (Periodical)</option>
                    <option value="repair">Naprawa bieżąca (Repair)</option>
                    <option value="tires">Wymiana opon (Tires)</option>
                    <option value="accident">Szkoda/Kolizja (Accident)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Koszt netto (PLN)</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={serviceData.cost}
                      onChange={e => setServiceData({ ...serviceData, cost: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Przebieg (km)</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={serviceData.odometer}
                      onChange={e => setServiceData({ ...serviceData, odometer: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Data serwisu</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={serviceData.serviceDate}
                    onChange={e => setServiceData({ ...serviceData, serviceDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Nazwa warsztatu</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="np. Scania Serwis Warszawa"
                    value={serviceData.workshopName}
                    onChange={e => setServiceData({ ...serviceData, workshopName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Numer faktury</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="np. F/123/2024"
                    value={serviceData.invoiceNumber}
                    onChange={e => setServiceData({ ...serviceData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Opis wykonanych prac</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={serviceData.description}
                    onChange={e => setServiceData({ ...serviceData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowServiceModal(false)} className="btn-secondary">Anuluj</button>
                <button type="submit" className="btn-primary">Dodaj naprawę</button>
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
      ...(await serverSideTranslations(locale ?? 'pl', ['common'], nextI18nConfig as any)),
    },
  }
}
