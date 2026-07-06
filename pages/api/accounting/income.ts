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
      const incomes = await prisma.income.findMany({
        orderBy: { incomeDate: 'desc' },
      })
      res.status(200).json(incomes)
    } catch (error) {
      console.error('Error fetching incomes:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        incomeDate,
        description,
        amount,
        currency,
        clientName,
        invoiceNumber,
        driverId,
        vehicleId,
      } = req.body

      const income = await prisma.income.create({
        data: {
          incomeDate: incomeDate ? new Date(incomeDate) : new Date(),
          description,
          amount: parseFloat(amount),
          currency: currency || 'PLN',
          clientName,
          invoiceNumber,
          driverId,
          vehicleId,
        },
      })

      res.status(201).json(income)
    } catch (error) {
      console.error('Error creating income:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
