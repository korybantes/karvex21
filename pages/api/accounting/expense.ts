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
      const expenses = await prisma.expense.findMany({
        orderBy: { expenseDate: 'desc' },
      })
      res.status(200).json(expenses)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        expenseDate,
        category,
        description,
        amount,
        currency,
        vendorName,
        invoiceNumber,
        driverId,
        vehicleId,
      } = req.body

      const expense = await prisma.expense.create({
        data: {
          expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
          category,
          description,
          amount: parseFloat(amount),
          currency: currency || 'PLN',
          vendorName,
          invoiceNumber,
          driverId,
          vehicleId,
        },
      })

      res.status(201).json(expense)
    } catch (error) {
      console.error('Error creating expense:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
