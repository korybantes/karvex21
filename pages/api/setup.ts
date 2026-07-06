import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Secret key to protect this endpoint - set SETUP_SECRET in your .env
const SETUP_SECRET = process.env.SETUP_SECRET || 'karvex-setup-2024'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, firstName, lastName, secret } = req.body

  // Must provide the correct setup secret
  if (secret !== SETUP_SECRET) {
    return res.status(403).json({ error: 'Invalid setup secret' })
  }

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    // Check if user with this email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // Update password and make admin
      const passwordHash = await hashPassword(password)
      const updated = await prisma.user.update({
        where: { email },
        data: { passwordHash, role: 'admin', isActive: true, firstName, lastName },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
      })
      return res.status(200).json({ message: 'User updated to admin', user: updated })
    }

    // Create new admin user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: 'admin', isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    })

    return res.status(201).json({ message: 'Admin created successfully', user })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
