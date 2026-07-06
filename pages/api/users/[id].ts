import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin only.' })
  }

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const u = await prisma.user.findUnique({
        where: { id: id as string },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, driverId: true }
      })
      if (!u) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(u)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { isActive, role, firstName, lastName } = req.body
      const updated = await prisma.user.update({
        where: { id: id as string },
        data: {
          ...(typeof isActive !== 'undefined' && { isActive }),
          ...(role && { role }),
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
      })
      return res.status(200).json(updated)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({ where: { id: id as string } })
      return res.status(204).end()
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
