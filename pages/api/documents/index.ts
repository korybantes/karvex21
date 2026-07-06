import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { DocumentType, RelatedEntityType } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  if (req.method === 'GET') {
    try {
      const { entityType, entityId, search } = req.query
      const documents = await prisma.document.findMany({
        where: {
          ...(entityType && { relatedEntityType: entityType as RelatedEntityType }),
          ...(entityId && { relatedEntityId: entityId as string }),
          ...(search && {
            documentName: { contains: search as string, mode: 'insensitive' }
          }),
        },
        orderBy: { createdAt: 'desc' },
      })
      return res.status(200).json(documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        documentName,
        documentType,
        relatedEntityType,
        relatedEntityId,
        issueDate,
        expiryDate,
        filePath,
        documentNumber,
      } = req.body

      const document = await prisma.document.create({
        data: {
          documentName,
          documentType: (documentType as DocumentType) || DocumentType.other,
          relatedEntityType: relatedEntityType ? (relatedEntityType as RelatedEntityType) : undefined,
          relatedEntityId: relatedEntityId || undefined,
          issueDate: issueDate ? new Date(issueDate) : null,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          filePath: filePath || '/uploads/placeholder.pdf',
          uploadedBy: user.id,
        },
      })

      return res.status(201).json(document)
    } catch (error) {
      console.error('Error creating document:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
