import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized. Admin only.' })
  }

  if (req.method === 'GET') {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        take: 100
      })
      return res.status(200).json(logs)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else {
    return res.status(405).end()
  }
}
