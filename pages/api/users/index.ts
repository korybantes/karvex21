import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import * as bcryptjs from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized. Admin only.' })
  }

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          driverId: true,
          createdAt: true
        }
      })
      return res.status(200).json(users)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    const { email, password, firstName, lastName, role, driverId } = req.body
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    try {
      const passwordHash = await bcryptjs.hash(password, 10)
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          driverId: driverId || null
        }
      })
      return res.status(201).json(newUser)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else {
    return res.status(405).end()
  }
}
