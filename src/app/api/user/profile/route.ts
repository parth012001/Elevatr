import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthCookie, verifyToken, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { name: true, email: true, image: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const payload = await verifyToken(token)
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    const body = await request.json()
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.image) updateData.image = body.image
    if (body.password) {
      updateData.password = await hashPassword(body.password)
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 })
    }
    const user = await prisma.user.update({
      where: { id: payload.id },
      data: updateData,
      select: { name: true, email: true, image: true }
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
} 