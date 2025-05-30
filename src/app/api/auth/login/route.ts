import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { LoginCredentials } from '@/types/auth'

export async function POST(req: Request) {
  try {
    console.log('Login request received')
    const body: LoginCredentials = await req.json()
    const { email, password } = body
    console.log('Login attempt for email:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Login successful, generating token')
    // Generate token
    const token = await generateToken({
      id: user.id,
    })

    // Set auth cookie
    await setAuthCookie(token)

    console.log('Sending success response with redirect')
    // Return success response with redirect URL
    return NextResponse.json({
      success: true,
      redirectTo: '/dashboard'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 