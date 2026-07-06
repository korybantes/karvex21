import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { DocumentStatus } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const { id } = req.query

  if (req.method === 'PATCH') {
    try {
      const { status, rejectionReason } = req.body

      // Only admins and accountants can approve/reject documents
      if (user.role !== 'admin' && user.role !== 'accountant') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const updateData: any = { status: status as DocumentStatus }

      if (status === 'valid') {
        updateData.approvedBy = user.id
        updateData.approvedAt = new Date()
        updateData.rejectionReason = null
      } else if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || null
        updateData.approvedBy = null
        updateData.approvedAt = null
      }

      const document = await prisma.document.update({
        where: { id: id as string },
        data: updateData,
      })

      // Log to audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: `DOCUMENT_STATUS_${status.toUpperCase()}`,
            tableName: 'documents',
            recordId: document.id,
            newValues: updateData,
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
          },
        })
      } catch {}

      return res.status(200).json(document)
    } catch (error: any) {
      console.error('Error updating document:', error)
      return res.status(500).json({ error: 'Internal server error', details: error.message })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Find document to check ownership/permissions
      const existingDoc = await prisma.document.findUnique({
        where: { id: id as string },
      })

      if (!existingDoc) {
        return res.status(404).json({ error: 'Document not found' })
      }

      // Admins can delete anything; drivers can only delete their own if pending/rejected
      if (user.role !== 'admin' && user.id !== existingDoc.uploadedBy) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.document.delete({
        where: { id: id as string },
      })

      // Log to audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'DOCUMENT_DELETE',
            tableName: 'documents',
            recordId: id as string,
            oldValues: { documentName: existingDoc.documentName },
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
          },
        })
      } catch {}

      return res.status(204).end()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      return res.status(500).json({ error: 'Internal server error', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}
