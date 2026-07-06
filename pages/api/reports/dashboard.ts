import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // This month income
    const incomeThis = await prisma.income.aggregate({
      where: { incomeDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    })
    const incomeLast = await prisma.income.aggregate({
      where: { incomeDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true }
    })

    const totalIncome = Number(incomeThis._sum.amount || 0)
    const lastIncome = Number(incomeLast._sum.amount || 0)
    const revenueDelta = lastIncome > 0 ? ((totalIncome - lastIncome) / lastIncome) * 100 : 0

    // This month expenses
    const expThis = await prisma.expense.aggregate({
      where: { expenseDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true }
    })
    const expLast = await prisma.expense.aggregate({
      where: { expenseDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true }
    })
    const totalExpenses = Number(expThis._sum.amount || 0)
    const lastExpenses = Number(expLast._sum.amount || 0)
    const expensesDelta = lastExpenses > 0 ? ((totalExpenses - lastExpenses) / lastExpenses) * 100 : 0

    // Fleet stats
    const activeDrivers = await prisma.driver.count({ where: { isActive: true } })
    const activeVehicles = await prisma.vehicle.count({ where: { isActive: true } })

    // Critical reminders
    const criticalAlerts = await prisma.reminder.count({
      where: {
        status: { in: ['pending', 'sent'] },
        priority: { in: ['high', 'critical'] },
        triggerDate: { lte: in30Days }
      }
    })

    // Monthly revenue last 6 months
    const months = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const inc = await prisma.income.aggregate({ where: { incomeDate: { gte: start, lte: end } }, _sum: { amount: true } })
      const exp = await prisma.expense.aggregate({ where: { expenseDate: { gte: start, lte: end } }, _sum: { amount: true } })
      const monthNames = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru']
      months.push({
        month: `${monthNames[start.getMonth()]} ${start.getFullYear()}`,
        income: Number(inc._sum.amount || 0),
        expenses: Number(exp._sum.amount || 0),
      })
    }

    // Expense breakdown by category
    const expCategories = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    })
    const expenseBreakdown = expCategories.map(e => ({
      category: e.category,
      amount: Number(e._sum.amount || 0)
    }))

    // Upcoming expirations (30 days)
    const expirations: any[] = []

    // Driver document expirations
    const driversExpiring = await prisma.driver.findMany({
      where: {
        isActive: true,
        OR: [
          { licenseExpiryDate: { lte: in30Days, gte: now } },
          { permitExpiryDate: { lte: in30Days, gte: now } },
          { code95ExpiryDate: { lte: in30Days, gte: now } },
          { driverCardExpiryDate: { lte: in30Days, gte: now } },
          { medicalExamExpiryDate: { lte: in30Days, gte: now } },
          { adrExpiryDate: { lte: in30Days, gte: now } },
        ]
      },
      select: { id: true, firstName: true, lastName: true, licenseExpiryDate: true, permitExpiryDate: true, code95ExpiryDate: true, driverCardExpiryDate: true, medicalExamExpiryDate: true, adrExpiryDate: true }
    })

    driversExpiring.forEach(d => {
      const checks = [
        { title: 'Prawo jazdy', expiry: d.licenseExpiryDate },
        { title: 'Zezwolenie/Karta pobytu', expiry: d.permitExpiryDate },
        { title: 'Kod 95', expiry: d.code95ExpiryDate },
        { title: 'Karta kierowcy', expiry: d.driverCardExpiryDate },
        { title: 'Badania lekarskie', expiry: d.medicalExamExpiryDate },
        { title: 'Certyfikat ADR', expiry: d.adrExpiryDate },
      ]
      checks.forEach(c => {
        if (c.expiry && c.expiry <= in30Days) {
          expirations.push({ title: c.title, entityName: `${d.firstName} ${d.lastName}`, expiryDate: c.expiry, type: 'driver' })
        }
      })
    })

    // Vehicle doc expirations
    const vehiclesExpiring = await prisma.vehicle.findMany({
      where: {
        isActive: true,
        OR: [
          { ocExpiryDate: { lte: in30Days, gte: now } },
          { acExpiryDate: { lte: in30Days, gte: now } },
          { nextInspectionDate: { lte: in30Days, gte: now } },
          { tachographNextCalibrationDate: { lte: in30Days, gte: now } },
        ]
      },
      select: { id: true, plateNumber: true, brand: true, model: true, ocExpiryDate: true, acExpiryDate: true, nextInspectionDate: true, tachographNextCalibrationDate: true }
    })

    vehiclesExpiring.forEach(v => {
      const checks = [
        { title: 'Ubezpieczenie OC', expiry: v.ocExpiryDate },
        { title: 'Ubezpieczenie AC', expiry: v.acExpiryDate },
        { title: 'Przegląd techniczny', expiry: v.nextInspectionDate },
        { title: 'Kalibracja tachografu', expiry: v.tachographNextCalibrationDate },
      ]
      checks.forEach(c => {
        if (c.expiry && c.expiry <= in30Days) {
          expirations.push({ title: c.title, entityName: `${v.plateNumber} (${v.brand} ${v.model})`, expiryDate: c.expiry, type: 'vehicle' })
        }
      })
    })

    expirations.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

    // Upcoming leasing payments
    const upcomingPayments: any[] = []
    const leasingVehicles = await prisma.vehicle.findMany({
      where: { isActive: true, leasingType: { not: 'owned' } },
      select: { id: true, plateNumber: true, brand: true, model: true, leasingEndDate: true }
    })
    leasingVehicles.forEach(v => {
      if (v.leasingEndDate) {
        const days = Math.ceil((v.leasingEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (days >= 0 && days <= 30) {
          upcomingPayments.push({ description: `Leasing ${v.plateNumber} - rata`, dueDate: v.leasingEndDate, amount: 0, currency: 'PLN' })
        }
      }
    })

    // Vehicle P&L
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      select: { id: true, plateNumber: true, brand: true, model: true },
      take: 8
    })

    const vehicleProfitLoss = await Promise.all(vehicles.map(async v => {
      const inc = await prisma.income.aggregate({
        where: { vehicleId: v.id, incomeDate: { gte: startOfMonth } },
        _sum: { amount: true }
      })
      const exp = await prisma.expense.aggregate({
        where: { vehicleId: v.id, expenseDate: { gte: startOfMonth } },
        _sum: { amount: true }
      })
      return {
        ...v,
        income: Number(inc._sum.amount || 0),
        expenses: Number(exp._sum.amount || 0),
      }
    }))
    vehicleProfitLoss.sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses))

    // Recent audit log activity
    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { firstName: true, lastName: true } } }
    })

    return res.json({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      revenueDelta,
      expensesDelta,
      activeDrivers,
      activeVehicles,
      criticalAlerts,
      monthlyRevenue: months,
      expenseBreakdown,
      upcomingExpirations: expirations,
      upcomingPayments,
      vehicleProfitLoss,
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        description: `${a.user?.firstName || 'System'}: ${a.action} (${a.tableName})`,
        createdAt: a.createdAt
      }))
    })
  } catch (e: any) {
    console.error('Dashboard API error:', e)
    return res.status(500).json({ error: e.message })
  }
}
