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
      const reminders = await prisma.reminder.findMany({
        orderBy: [
          { status: 'asc' },
          { triggerDate: 'asc' },
        ],
      })
      res.status(200).json(reminders)
    } catch (error) {
      console.error('Error fetching reminders:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        reminderType,
        triggerDate,
        priority,
        relatedEntityType,
        relatedEntityId,
      } = req.body

      const reminder = await prisma.reminder.create({
        data: {
          title,
          description,
          reminderType,
          triggerDate: new Date(triggerDate),
          priority,
          relatedEntityType,
          relatedEntityId,
          status: 'pending',
        },
      })

      res.status(201).json(reminder)
    } catch (error) {
      console.error('Error creating reminder:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
