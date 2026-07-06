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

  const { id } = req.query

  // Authorization check: Admin, accountant, or the driver themselves
  const isAuthorized = 
    user.role === 'admin' || 
    user.role === 'accountant' || 
    (user.role === 'driver' && user.driverId === id)

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    try {
      const payrollEntries = await prisma.driverPayrollEntry.findMany({
        where: { driverId: id as string },
        orderBy: { entryDate: 'desc' },
      })
      res.status(200).json(payrollEntries)
    } catch (error) {
      console.error('Error fetching payroll entries:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { entryType, amount, currency, entryDate, description, isPaid } = req.body

      const newEntry = await prisma.driverPayrollEntry.create({
        data: {
          driverId: id as string,
          entryType,
          amount,
          currency: currency || 'PLN',
          entryDate: entryDate ? new Date(entryDate) : new Date(),
          description,
          isPaid: !!isPaid,
          plnEquivalent: currency === 'EUR' ? Number(amount) * 4.27 : Number(amount)
        }
      })
      res.status(201).json(newEntry)
    } catch (error) {
      console.error('Error creating payroll entry:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
