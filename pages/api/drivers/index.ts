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
      const drivers = await prisma.driver.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      })
      res.status(200).json(drivers)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        phoneNumbers,
        nationality,
        pesel,
        passportNumber,
        permitType,
        permitIssueDate,
        permitExpiryDate,
        licenseClass,
        licenseIssueCountry,
        licenseIssueDate,
        licenseExpiryDate,
        code95Number,
        code95IssueDate,
        code95ExpiryDate,
        driverCardNumber,
        driverCardIssueDate,
        driverCardExpiryDate,
        medicalExamDate,
        medicalExamExpiryDate,
        adrCertificateNumber,
        adrExpiryDate,
        employmentStartDate,
        contractType,
        address,
        emergencyContactName,
        emergencyContactPhone,
      } = req.body

      const driver = await prisma.driver.create({
        data: {
          firstName,
          lastName,
          phoneNumbers: phoneNumbers || [],
          nationality,
          pesel,
          passportNumber,
          permitType,
          permitIssueDate: permitIssueDate ? new Date(permitIssueDate) : null,
          permitExpiryDate: permitExpiryDate ? new Date(permitExpiryDate) : null,
          licenseClass,
          licenseIssueCountry,
          licenseIssueDate: licenseIssueDate ? new Date(licenseIssueDate) : null,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          code95Number,
          code95IssueDate: code95IssueDate ? new Date(code95IssueDate) : null,
          code95ExpiryDate: code95ExpiryDate ? new Date(code95ExpiryDate) : null,
          driverCardNumber,
          driverCardIssueDate: driverCardIssueDate ? new Date(driverCardIssueDate) : null,
          driverCardExpiryDate: driverCardExpiryDate ? new Date(driverCardExpiryDate) : null,
          medicalExamDate: medicalExamDate ? new Date(medicalExamDate) : null,
          medicalExamExpiryDate: medicalExamExpiryDate ? new Date(medicalExamExpiryDate) : null,
          adrCertificateNumber,
          adrExpiryDate: adrExpiryDate ? new Date(adrExpiryDate) : null,
          employmentStartDate: employmentStartDate ? new Date(employmentStartDate) : null,
          contractType,
          address,
          emergencyContactName,
          emergencyContactPhone,
        },
      })

      res.status(201).json(driver)
    } catch (error) {
      console.error('Error creating driver:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
