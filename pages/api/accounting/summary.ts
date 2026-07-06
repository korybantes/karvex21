import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    try {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const [incomeResult, expenseResult] = await Promise.all([
        prisma.income.aggregate({
          where: {
            incomeDate: { gte: currentMonth },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            expenseDate: { gte: currentMonth },
          },
          _sum: { amount: true },
        }),
      ])

      const totalIncome = Number(incomeResult._sum.amount) || 0
      const totalExpenses = Number(expenseResult._sum.amount) || 0
      const netProfit = totalIncome - totalExpenses

      res.status(200).json({
        totalIncome,
        totalExpenses,
        netProfit,
      })
    } catch (error) {
      console.error('Error fetching summary:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
