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
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const rates = await prisma.exchangeRate.findMany({
        where: {
          rateDate: { gte: today },
        },
        orderBy: { rateDate: 'desc' },
      })
      
      if (rates.length === 0) {
        // Return default rates if none exist
        return res.status(200).json({
          PLN: 1,
          EUR: 0.23,
          TRY: 7.5,
        })
      }

      // Convert to simple format
      const rateMap: Record<string, number> = {
        PLN: 1,
      }

      rates.forEach((rate) => {
        const key = `${rate.fromCurrency}to${rate.toCurrency}`
        rateMap[key] = Number(rate.rate)
      })

      // Return in expected format
      res.status(200).json({
        PLN: 1,
        EUR: rateMap['EURtoPLN'] || 0.23,
        TRY: rateMap['TRYtoPLN'] || 7.5,
      })
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { eurToPln, tryToPln } = req.body
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create EUR to PLN rate
      await prisma.exchangeRate.create({
        data: {
          fromCurrency: 'EUR',
          toCurrency: 'PLN',
          rate: parseFloat(eurToPln),
          rateDate: today,
          source: 'manual',
        },
      })

      // Create TRY to PLN rate
      await prisma.exchangeRate.create({
        data: {
          fromCurrency: 'TRY',
          toCurrency: 'PLN',
          rate: parseFloat(tryToPln),
          rateDate: today,
          source: 'manual',
        },
      })

      res.status(201).json({ success: true })
    } catch (error) {
      console.error('Error creating exchange rate:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
