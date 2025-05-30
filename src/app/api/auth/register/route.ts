import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { RegisterCredentials } from '@/types/auth'

export async function POST(req: Request) {
  try {
    const body: RegisterCredentials = await req.json()
    const { email, password, name } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    // Generate token
    const token = await generateToken({
      id: user.id,
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 