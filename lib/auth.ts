import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: any; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { driver: true },
  })

  if (!user || !user.isActive) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Remove password hash from response
  const { passwordHash, ...userWithoutPassword } = user

  return {
    user: userWithoutPassword,
    token,
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { driver: true },
  })

  if (!user || !user.isActive) {
    return null
  }

  const { passwordHash, ...userWithoutPassword } = user
  return userWithoutPassword
}

export function hasRole(user: any, roles: string[]): boolean {
  return roles.includes(user.role)
}

export function isAdmin(user: any): boolean {
  return user.role === 'admin'
}

export function isAccountant(user: any): boolean {
  return user.role === 'accountant'
}

export function isDriver(user: any): boolean {
  return user.role === 'driver'
}
