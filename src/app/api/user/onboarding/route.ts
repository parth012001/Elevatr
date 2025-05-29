import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function POST() {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Update user's onboarding status
    await prisma.user.update({
      where: { id: decoded.id },
      data: { hasCompletedOnboarding: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 