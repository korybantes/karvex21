import nextI18nConfig from '@/next-i18next.config'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/Layout'
import {
  Plus, Search, Filter, Trash2, Edit2, FileText, Download, AlertCircle, TrendingUp,
  TrendingDown, DollarSign, Calculator, RefreshCw, Landmark
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function Accounting() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'vat'>('income')
  const [currency, setCurrency] = useState<'PLN' | 'EUR'>('PLN')
  const [rates, setRates] = useState<any>({ EUR: 4.27 })
  const [loading, setLoading] = useState(true)

  // API Lists
  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [vehiclesPL, setVehiclesPL] = useState<any[]>([])
  const [driversPayroll, setDriversPayroll] = useState<any[]>([])

  // Modals
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)

  // Forms
  const [incomeForm, setIncomeForm] = useState({
    incomeDate: '', invoiceNumber: '', clientName: '', clientNip: '', clientCountry: 'PL',
    description: '', amount: '', vatRate: '23.00', currency: 'PLN', vehicleId: '', driverId: ''
  })
  const [expenseForm, setExpenseForm] = useState({
    expenseDate: '', category: 'fuel', description: '', amount: '', vatRate: '23.00',
    currency: 'PLN', vendorName: '', vendorNip: '', invoiceNumber: '', vehicleId: '', driverId: ''
  })

  // Dropdowns
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      // Incomes
      const resInc = await fetch('/api/accounting/income', { headers: { Authorization: `Bearer ${token}` } })
      if (resInc.ok) setIncomes(await resInc.json())

      // Expenses
      const resExp = await fetch('/api/accounting/expense', { headers: { Authorization: `Bearer ${token}` } })
      if (resExp.ok) setExpenses(await resExp.json())

      // Drivers & Vehicles for forms
      const resDrv = await fetch('/api/drivers', { headers: { Authorization: `Bearer ${token}` } })
      if (resDrv.ok) setDrivers(await resDrv.json())

      const resVeh = await fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } })
      if (resVeh.ok) setVehicles(await resVeh.json())

      // P&L & Payroll
      const resReport = await fetch('/api/reports/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      if (resReport.ok) {
        const d = await resReport.json()
        setVehiclesPL(d.vehicleProfitLoss || [])
      }

      // Fetch driver payroll details
      const resPay = await fetch('/api/accounting/payroll-summary', { headers: { Authorization: `Bearer ${token}` } })
      if (resPay.ok) setDriversPayroll(await resPay.json())

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/accounting/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...incomeForm,
          amount: parseFloat(incomeForm.amount),
          vatRate: parseFloat(incomeForm.vatRate)
        })
      })
      if (res.ok) {
        setShowAddIncome(false)
        fetchAllData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/accounting/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
          vatRate: parseFloat(expenseForm.vatRate)
        })
      })
      if (res.ok) {
        setShowAddExpense(false)
        fetchAllData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Formatting helpers
  const fmt = (v: number) => {
    if (currency === 'EUR') return `€${(v / rates.EUR).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return `${v.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`
  }

  // Computations
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.plnEquivalent || item.amount), 0)
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.plnEquivalent || item.amount), 0)
  const netProfit = totalIncome - totalExpense

  // VAT calculations
  const vatReceived = incomes.reduce((sum, item) => {
    const netto = Number(item.plnEquivalent || item.amount)
    const rate = Number(item.vatRate || 23)
    return sum + (netto * (rate / 100))
  }, 0)

  const vatPaid = expenses.reduce((sum, item) => {
    const netto = Number(item.plnEquivalent || item.amount)
    const rate = Number(item.vatRate || 23)
    return sum + (netto * (rate / 100))
  }, 0)

  const vatBalance = vatReceived - vatPaid

  const getTollFlag = (country: string) => {
    switch (country) {
      case 'PL': return '🇵🇱'
      case 'DE': return '🇩🇪'
      case 'AT': return '🇦🇹'
      case 'FR': return '🇫🇷'
      case 'BE': return '🇧🇪'
      default: return '🇪🇺'
    }
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('accountingPageTitle')}</h1>
            <p className="page-subtitle">{t('accountingPageSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrency(currency === 'PLN' ? 'EUR' : 'PLN')}
              className="btn-secondary text-xs"
            >
              {currency === 'PLN' ? t('showInEur') : t('showInPln')}
            </button>
            <button className="btn-primary text-xs flex items-center gap-1.5">
              <Download size={14} /> {t('exportToExcel')}
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('totalRevenue')}</p>
            <p className="text-emerald-600 text-2xl font-bold mt-1">{fmt(totalIncome)}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('totalExpenses')}</p>
            <p className="text-red-600 text-2xl font-bold mt-1">{fmt(totalExpense)}</p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('netProfit')}</p>
            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(netProfit)}
            </p>
          </div>
          <div className="card">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('vatBalance')}</p>
            <p className={`text-2xl font-bold mt-1 ${vatBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {fmt(vatBalance)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <div onClick={() => setActiveTab('income')} className={`tab-item ${activeTab === 'income' ? 'active' : ''}`}>{t('incomeSales')}</div>
          <div onClick={() => setActiveTab('expenses')} className={`tab-item ${activeTab === 'expenses' ? 'active' : ''}`}>{t('operatingExpenses')}</div>
          <div onClick={() => setActiveTab('vat')} className={`tab-item ${activeTab === 'vat' ? 'active' : ''}`}>{t('vatSummary')}</div>
        </div>

        {/* Incomes Tab */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">{t('incomeRegister')}</h3>
              <button onClick={() => setShowAddIncome(true)} className="btn-primary text-xs py-1.5 px-3">
                <Plus size={14} /> {t('issueInvoice')}
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('invoiceNumber')}</th>
                    <th>{t('contractor')}</th>
                    <th>NIP</th>
                    <th>{t('serviceDescription')}</th>
                    <th>{t('netAmount')}</th>
                    <th>{t('vat')}</th>
                    <th>{t('gross')}</th>
                    <th>{t('currency')}</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-6 text-slate-400">{t('noIncomeRegistered')}</td>
                    </tr>
                  ) : incomes.map(inc => {
                    const rate = Number(inc.vatRate || 23)
                    const net = Number(inc.amount)
                    const gross = net * (1 + rate / 100)
                    return (
                      <tr key={inc.id}>
                        <td>{new Date(inc.incomeDate).toLocaleDateString('pl-PL')}</td>
                        <td className="font-semibold text-slate-800">{inc.invoiceNumber || 'Brak'}</td>
                        <td>{inc.clientName || '-'}</td>
                        <td className="text-xs font-mono">{inc.clientNip || '-'}</td>
                        <td className="text-xs font-medium">{inc.description}</td>
                        <td className="font-bold">{fmt(Number(inc.plnEquivalent || inc.amount))}</td>
                        <td className="text-xs">{inc.vatRate}%</td>
                        <td className="font-bold text-emerald-600">
                          {fmt(Number(inc.plnEquivalent || gross))}
                        </td>
                        <td className="text-xs text-slate-500 font-bold">{inc.currency}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">{t('expenseRegister')}</h3>
              <button onClick={() => setShowAddExpense(true)} className="btn-primary text-xs py-1.5 px-3">
                <Plus size={14} /> {t('addExpense')}
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('category')}</th>
                    <th>{t('vendorDistributor')}</th>
                    <th>NIP</th>
                    <th>{t('invoiceNumber')}</th>
                    <th>{t('transactionDescription')}</th>
                    <th>{t('netAmount')}</th>
                    <th>{t('vat')}</th>
                    <th>{t('gross')}</th>
                    <th>{t('vehicle')}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-slate-400">{t('noExpensesRegisteredLabel')}</td>
                    </tr>
                  ) : expenses.map(exp => {
                    const rate = Number(exp.vatRate || 23)
                    const net = Number(exp.amount)
                    const gross = net * (1 + rate / 100)
                    return (
                      <tr key={exp.id}>
                        <td>{new Date(exp.expenseDate).toLocaleDateString('pl-PL')}</td>
                        <td className="capitalize font-semibold text-xs text-slate-500">
                          {exp.category === 'fuel' ? '⛽ Paliwo' : exp.category === 'toll' ? `${getTollFlag(exp.vendorCountry || 'PL')} Opłata drogowa` : exp.category}
                        </td>
                        <td>{exp.vendorName || '-'}</td>
                        <td className="text-xs font-mono">{exp.vendorNip || '-'}</td>
                        <td className="font-semibold text-xs">{exp.invoiceNumber || '-'}</td>
                        <td className="text-xs">{exp.description || '-'}</td>
                        <td className="font-bold">-{fmt(Number(exp.plnEquivalent || exp.amount))}</td>
                        <td className="text-xs">{exp.vatRate}%</td>
                        <td className="font-bold text-red-600">
                          -{fmt(Number(exp.plnEquivalent || gross))}
                        </td>
                        <td className="text-xs font-medium">{exp.vehicle?.plateNumber || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VAT Summary Tab */}
        {activeTab === 'vat' && (
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-800 text-base">{t('vatRegister')}</h3>
            <p className="text-xs text-slate-400">{t('vatRegisterDesc')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('vatDue')}</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{fmt(vatReceived)}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('vatDeductible')}</p>
                <p className="text-xl font-bold text-red-600 mt-1">{fmt(vatPaid)}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('vatBalanceOffice')}</p>
                <p className={`text-xl font-bold mt-1 ${vatBalance >= 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                  {vatBalance >= 0 ? `${t('toPay')}: ${fmt(vatBalance)}` : `${t('toRefund')}: ${fmt(Math.abs(vatBalance))}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Profitability section */}
        {vehiclesPL.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            <div className="card lg:col-span-2">
              <h3 className="font-bold text-slate-800 text-base mb-4">Rentowność pojazdów (Miesięczna)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vehiclesPL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="plateNumber" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} zł`, '']} />
                  <Legend />
                  <Bar dataKey="income" name="Przychody" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Koszty" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-800 text-base mb-4">Wydatki kierowców</h3>
              <div className="space-y-3 overflow-y-auto max-h-60">
                {driversPayroll.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">Brak danych płacowych</p>
                ) : driversPayroll.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{d.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Miesięczna podstawa + diety</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      -{fmt(d.totalPaid || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Income Modal */}
      {showAddIncome && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">{t('addNewIncomeInvoice')}</h3>
              <button onClick={() => setShowAddIncome(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddIncomeSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('issueDate')}</label>
                    <input type="date" required className="input-field" value={incomeForm.incomeDate} onChange={e => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('invoiceNumber')}</label>
                    <input type="text" required className="input-field" placeholder="np. FV/2024/001" value={incomeForm.invoiceNumber} onChange={e => setIncomeForm({ ...incomeForm, invoiceNumber: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="label">{t('clientContractor')}</label>
                  <input type="text" required className="input-field" placeholder="Nazwa firmy" value={incomeForm.clientName} onChange={e => setIncomeForm({ ...incomeForm, clientName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('clientNip')}</label>
                    <input type="text" className="input-field" placeholder="NIP" value={incomeForm.clientNip} onChange={e => setIncomeForm({ ...incomeForm, clientNip: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('clientCountry')}</label>
                    <select className="input-field" value={incomeForm.clientCountry} onChange={e => setIncomeForm({ ...incomeForm, clientCountry: e.target.value })}>
                      <option value="PL">Polska (PL)</option>
                      <option value="DE">Niemcy (DE)</option>
                      <option value="FR">Francja (FR)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="label">{t('netAmountLabel')}</label>
                    <input type="number" step="0.01" required className="input-field" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">{t('currencyLabel')}</label>
                    <select className="input-field" value={incomeForm.currency} onChange={e => setIncomeForm({ ...incomeForm, currency: e.target.value })}>
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('vatRate')}</label>
                    <select className="input-field" value={incomeForm.vatRate} onChange={e => setIncomeForm({ ...incomeForm, vatRate: e.target.value })}>
                      <option value="23.00">23%</option>
                      <option value="8.00">8%</option>
                      <option value="5.00">5%</option>
                      <option value="0.00">0% / np. transakcje UE</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('linkedVehicle')}</label>
                    <select className="input-field" value={incomeForm.vehicleId} onChange={e => setIncomeForm({ ...incomeForm, vehicleId: e.target.value })}>
                      <option value="">{t('selectVehicleOptional')}</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">{t('serviceDescriptionLabel')}</label>
                  <input type="text" required className="input-field" placeholder="np. Usługa transportowa na trasie PL-DE" value={incomeForm.description} onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddIncome(false)} className="btn-secondary">{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('addIncome')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 text-base">Dodaj nową fakturę kosztową</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddExpenseSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Data kosztu</label>
                    <input type="date" required className="input-field" value={expenseForm.expenseDate} onChange={e => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Kategoria kosztu</label>
                    <select className="input-field" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                      <option value="fuel">⛽ Paliwo</option>
                      <option value="toll">🛣️ Toll / Opłaty drogowe</option>
                      <option value="maintenance">🔧 Serwis & Naprawy</option>
                      <option value="tire">⏺ Opony</option>
                      <option value="insurance">🛡️ Ubezpieczenia OC/AC/OCP</option>
                      <option value="leasing">🏦 Leasing / raty</option>
                      <option value="other">📦 Inne</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Dostawca (Dystrybutor)</label>
                    <input type="text" required className="input-field" placeholder="np. Orlen, DKV" value={expenseForm.vendorName} onChange={e => setExpenseForm({ ...expenseForm, vendorName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Numer faktury</label>
                    <input type="text" required className="input-field" placeholder="np. F/456789/2024" value={expenseForm.invoiceNumber} onChange={e => setExpenseForm({ ...expenseForm, invoiceNumber: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="label">Kwota netto</label>
                    <input type="number" step="0.01" required className="input-field" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Waluta</label>
                    <select className="input-field" value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })}>
                      <option value="PLN">PLN</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Stawka VAT</label>
                    <select className="input-field" value={expenseForm.vatRate} onChange={e => setExpenseForm({ ...expenseForm, vatRate: e.target.value })}>
                      <option value="23.00">23%</option>
                      <option value="8.00">8%</option>
                      <option value="5.00">5%</option>
                      <option value="0.00">0% (odwrotne obciążenie / np. Toll DE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Powiązany pojazd</label>
                    <select className="input-field" value={expenseForm.vehicleId} onChange={e => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
                      <option value="">Wybierz pojazd (opcjonalnie)</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Opis transakcji</label>
                  <input type="text" required className="input-field" placeholder="np. Zakup paliwa DKV" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddExpense(false)} className="btn-secondary">Anuluj</button>
                <button type="submit" className="btn-primary">Dodaj koszt</button>
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
