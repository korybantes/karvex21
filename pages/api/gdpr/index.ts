import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const requests = await prisma.gdprRequest.findMany({
        orderBy: { requestedAt: 'desc' }
      })
      return res.status(200).json(requests)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    const { requestType, requesterId, requesterEmail, notes } = req.body
    if (!requestType) {
      return res.status(400).json({ error: 'Missing request type' })
    }
    try {
      const newReq = await prisma.gdprRequest.create({
        data: {
          requestType,
          requesterId: requesterId || null,
          requesterEmail: requesterEmail || user.email,
          notes: notes || 'Zgłoszenie RODO wygenerowane z poziomu panelu użytkownika.'
        }
      })
      return res.status(201).json(newReq)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else {
    return res.status(405).end()
  }
}
