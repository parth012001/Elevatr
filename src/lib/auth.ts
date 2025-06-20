import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { User } from '@/generated/prisma'

// JWT secret key - in production, use a secure environment variable
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// JWT token handling
export async function generateToken(payload: { id: string }): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in the environment')
  }
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ id: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { id: string }
  } catch {
    return null
  }
}

// Cookie handling
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function getAuthCookie() {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Middleware helper
export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'image'> 