import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock user database - in production, use a real database
const USERS = new Map<string, { id: string; username: string; passwordHash: string }>()

// Initialize with demo user (hashed password for "password")
const demoPasswordHash = bcrypt.hashSync('password', 10)
USERS.set('demo@example.com', {
  id: 'user-1',
  username: 'demo@example.com',
  passwordHash: demoPasswordHash
})

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 })
    }

    const user = USERS.get(username)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Verify password using bcrypt
    try {
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: 'Invalid credentials'
        }, { status: 401 })
      }
    } catch (error) {
      console.error('Password verification error:', error)
      return NextResponse.json({
        success: false,
        error: 'Authentication failed'
      }, { status: 500 })
    }

    // Generate JWT-like token (simplified for demo)
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      username: user.username,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64')

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
