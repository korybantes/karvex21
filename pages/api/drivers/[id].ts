import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
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
      const driver = await prisma.driver.findUnique({
        where: { id: id as string },
        include: {
          assignments: {
            include: { vehicle: true },
            orderBy: { assignedDate: 'desc' },
          },
          payrollEntries: {
            orderBy: { entryDate: 'desc' },
          },
          documents: true,
        },
      })

      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' })
      }

      res.status(200).json(driver)
    } catch (error) {
      console.error('Error fetching driver:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    try {
      const driver = await prisma.driver.update({
        where: { id: id as string },
        data: req.body,
      })

      res.status(200).json(driver)
    } catch (error) {
      console.error('Error updating driver:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.driver.update({
        where: { id: id as string },
        data: { isActive: false },
      })

      res.status(204).end()
    } catch (error) {
      console.error('Error deleting driver:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
