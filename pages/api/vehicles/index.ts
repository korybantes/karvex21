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
      const vehicles = await prisma.vehicle.findMany({
        where: { isActive: true },
        include: {
          assignments: {
            include: { driver: true },
            where: { isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      res.status(200).json(vehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        plateNumber,
        plateCountry,
        brand,
        model,
        year,
        vin,
        trailerInfo,
        purchaseDate,
        leasingType,
        leasingEndDate,
        ocPolicyNumber,
        ocCompany,
        ocStartDate,
        ocExpiryDate,
        ocPremium,
        acPolicyNumber,
        acCompany,
        acStartDate,
        acExpiryDate,
        acPremium,
        lastInspectionDate,
        nextInspectionDate,
        tachographCalibrationDate,
        tachographNextCalibrationDate,
      } = req.body

      const vehicle = await prisma.vehicle.create({
        data: {
          plateNumber,
          plateCountry: plateCountry || 'PL',
          brand,
          model,
          year: year ? parseInt(year) : null,
          vin,
          trailerInfo,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
          leasingType,
          leasingEndDate: leasingEndDate ? new Date(leasingEndDate) : null,
          ocPolicyNumber,
          ocCompany,
          ocStartDate: ocStartDate ? new Date(ocStartDate) : null,
          ocExpiryDate: ocExpiryDate ? new Date(ocExpiryDate) : null,
          ocPremium: ocPremium ? parseFloat(ocPremium) : null,
          acPolicyNumber,
          acCompany,
          acStartDate: acStartDate ? new Date(acStartDate) : null,
          acExpiryDate: acExpiryDate ? new Date(acExpiryDate) : null,
          acPremium: acPremium ? parseFloat(acPremium) : null,
          lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : null,
          nextInspectionDate: nextInspectionDate ? new Date(nextInspectionDate) : null,
          tachographCalibrationDate: tachographCalibrationDate ? new Date(tachographCalibrationDate) : null,
          tachographNextCalibrationDate: tachographNextCalibrationDate ? new Date(tachographNextCalibrationDate) : null,
        },
      })

      res.status(201).json(vehicle)
    } catch (error) {
      console.error('Error creating vehicle:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
