import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const result = await authenticateUser(email, password)

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
