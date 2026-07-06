import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { range = 'month' } = req.query
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    try {
      const now = new Date()
      let startDate = new Date()
      
      if (range === 'month') {
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
      } else if (range === 'quarter') {
        startDate.setMonth(now.getMonth() - 3)
      } else if (range === 'year') {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      const [incomeResult, expenseResult, drivers, vehicles] = await Promise.all([
        prisma.income.aggregate({
          where: { incomeDate: { gte: startDate } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { expenseDate: { gte: startDate } },
          _sum: { amount: true },
        }),
        prisma.driver.count({ where: { isActive: true } }),
        prisma.vehicle.count({ where: { isActive: true } }),
      ])

      const totalRevenue = Number(incomeResult._sum.amount) || 0
      const totalExpenses = Number(expenseResult._sum.amount) || 0

      // Mock data for demonstration
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const income = Math.floor(Math.random() * 50000) + 20000;
        const expenses = Math.floor(income * 0.75 + Math.random() * 5000);
        return {
          month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          income,
          expenses,
        };
      })

      const expenseBreakdown = [
        { category: 'Fuel (Paliwo)', amount: totalExpenses * 0.35, percentage: 35 },
        { category: 'Toll (Yol Ücreti)', amount: totalExpenses * 0.15, percentage: 15 },
        { category: 'Salary (Maaş)', amount: totalExpenses * 0.25, percentage: 25 },
        { category: 'Maintenance (Bakım)', amount: totalExpenses * 0.10, percentage: 10 },
        { category: 'Other (Diğer)', amount: totalExpenses * 0.15, percentage: 15 },
      ]

      const vehicleUtilization = [
        { plate: 'PL 12345', driver: 'Jan Kowalski', utilization: 85 },
        { plate: 'PL 67890', driver: 'Piotr Nowak', utilization: 92 },
        { plate: 'DE 54321', driver: 'Marek Wiśniewski', utilization: 78 },
        { plate: 'FR 98765', driver: 'Adam Kowalczyk', utilization: 88 },
      ]

      const driverPerformance = [
        { name: 'Jan Kowalski', trips: 24, distance: 12500, revenue: 45000, rating: 4.8 },
        { name: 'Piotr Nowak', trips: 28, distance: 14200, revenue: 52000, rating: 4.9 },
        { name: 'Marek Wiśniewski', trips: 20, distance: 10800, revenue: 38000, rating: 4.5 },
        { name: 'Adam Kowalczyk', trips: 26, distance: 13500, revenue: 49000, rating: 4.7 },
      ]

      res.status(200).json({
        totalRevenue,
        totalExpenses,
        activeDrivers: drivers,
        activeVehicles: vehicles,
        monthlyRevenue,
        expenseBreakdown,
        vehicleUtilization,
        driverPerformance,
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
