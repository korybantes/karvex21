import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken, hashPassword } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const currentUser = await getUserFromToken(token)
  if (!currentUser) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { id } = req.query
    // Must be admin to view others, or own profile
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' })
    }
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
    const { id } = req.query
    // Admins can edit anyone; non-admins can only edit themselves
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    try {
      const { isActive, role, firstName, lastName, email, password, currentPassword, driverId } = req.body

      // Password change: requires currentPassword for self-service, admin can reset directly
      let passwordHash: string | undefined
      if (password) {
        if (currentUser.role !== 'admin') {
          // Self service: verify current password first
          if (!currentPassword) {
            return res.status(400).json({ error: 'Current password required' })
          }
          const dbUser = await prisma.user.findUnique({ where: { id: id as string } })
          const bcrypt = require('bcryptjs')
          const valid = dbUser && await bcrypt.compare(currentPassword, dbUser.passwordHash)
          if (!valid) {
            return res.status(400).json({ error: 'Current password is incorrect' })
          }
        }
        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' })
        }
        passwordHash = await hashPassword(password)
      }

      const updateData: any = {
        ...(typeof isActive !== 'undefined' && currentUser.role === 'admin' && { isActive }),
        ...(role && currentUser.role === 'admin' && { role }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && currentUser.role === 'admin' && { email }),
        ...(typeof driverId !== 'undefined' && currentUser.role === 'admin' && { driverId: driverId || null }),
        ...(passwordHash && { passwordHash }),
      }

      const updated = await prisma.user.update({
        where: { id: id as string },
        data: updateData,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, driverId: true }
      })
      return res.status(200).json(updated)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    const { id } = req.query
    // Prevent self-deletion
    if (currentUser.id === id) return res.status(400).json({ error: 'Cannot delete your own account' })
    try {
      await prisma.user.delete({ where: { id: id as string } })
      return res.status(204).end()
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
