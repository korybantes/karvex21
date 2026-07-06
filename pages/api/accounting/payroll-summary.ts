import { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        payrollEntries: {
          select: {
            entryType: true,
            amount: true,
            isPaid: true
          }
        }
      }
    })

    const result = drivers.map(d => {
      const totalPaid = d.payrollEntries
        .filter(p => p.isPaid)
        .reduce((sum, p) => sum + Number(p.amount), 0)

      return {
        id: d.id,
        name: `${d.firstName} ${d.lastName}`,
        totalPaid
      }
    })

    return res.status(200).json(result)
  } catch (e: any) {
    console.error('Payroll summary API error:', e)
    return res.status(500).json({ error: e.message })
  }
}
