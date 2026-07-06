import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { put } from '@vercel/blob'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Valid enum values from prisma schema
const VALID_DOC_TYPES = [
  'company_license', 'community_license', 'ocp', 'vehicle_registration',
  'vehicle_insurance', 'vehicle_inspection', 'tachograph_certificate',
  'driver_license', 'driver_passport', 'driver_permit', 'code_95',
  'driver_card', 'medical_report', 'adr_certificate', 'contract',
  'invoice', 'receipt', 'other'
] as const

type DocType = typeof VALID_DOC_TYPES[number]

const VALID_ENTITY_TYPES = ['company', 'vehicle', 'driver', 'general'] as const
type EntityType = typeof VALID_ENTITY_TYPES[number]

function toDocType(s: string): DocType {
  return (VALID_DOC_TYPES.includes(s as DocType) ? s : 'other') as DocType
}

function toEntityType(s: string): EntityType {
  return (VALID_ENTITY_TYPES.includes(s as EntityType) ? s : 'general') as EntityType
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const user = await getUserFromToken(token)
  if (!user) return res.status(401).json({ error: 'Invalid token' })

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 25 * 1024 * 1024, // 25 MB
  })

  return new Promise<void>((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'File upload failed', details: err.message })
        return resolve()
      }

      try {
        const rawFile = Array.isArray(files.file) ? files.file[0] : (files.file as unknown)
        const file = rawFile as { filepath: string; originalFilename?: string; size?: number; mimetype?: string } | null

        if (!file || !file.filepath) {
          res.status(400).json({ error: 'No file uploaded' })
          return resolve()
        }

        // Read file from temporary location
        const fs = require('fs')
        const fileBuffer = fs.readFileSync(file.filepath)
        const fileName = file.originalFilename || 'document'

        // Upload to Vercel Blob
        const blob = await put(fileName, fileBuffer, {
          access: 'public',
          addRandomSuffix: true,
        })

        const getString = (v: unknown) =>
          Array.isArray(v) ? (v[0] as string) : (v as string | undefined) || ''

        const documentName = getString(fields.documentName) || file.originalFilename || 'document'
        const documentType = toDocType(getString(fields.documentType))
        const relatedEntityType = toEntityType(getString(fields.relatedEntityType))
        const relatedEntityId = getString(fields.relatedEntityId) || null
        const issueDate = getString(fields.issueDate) || null
        const expiryDate = getString(fields.expiryDate) || null

        // Validate related entity exists before creating document
        if (relatedEntityType === 'vehicle' && relatedEntityId) {
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: relatedEntityId }
          })
          if (!vehicle) {
            return res.status(400).json({ error: 'Vehicle not found' })
          }
        }
        if (relatedEntityType === 'driver' && relatedEntityId) {
          const driver = await prisma.driver.findUnique({
            where: { id: relatedEntityId }
          })
          if (!driver) {
            return res.status(400).json({ error: 'Driver not found' })
          }
        }

        const document = await prisma.document.create({
          data: {
            documentName,
            documentType,
            relatedEntityType,
            relatedEntityId: relatedEntityId || undefined,
            issueDate: issueDate ? new Date(issueDate) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            filePath: blob.url,
            fileSize: file.size ?? null,
            fileType: file.mimetype ?? null,
            uploadedBy: user.id,
            status: 'pending', // Driver uploads go to pending for admin approval
          },
        })

        // Audit log
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'DOCUMENT_UPLOAD',
              tableName: 'documents',
              recordId: document.id,
              newValues: { documentName, documentType, filePath: blob.url },
              ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
            },
          })
        } catch { /* non-critical */ }

        res.status(201).json({ ...document, url: blob.url })
        resolve()
      } catch (error: any) {
        console.error('Upload error:', error)
        res.status(500).json({ error: 'Internal server error', details: error.message })
        resolve()
      }
    })
  })
}
