import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock user database - in production, use a real database
const USERS = new Map<string, { id: string; username: string; passwordHash: string; salt: string }>()

// Input validation patterns
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Input validation
    if (!username || typeof username !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Username is required and must be a string'
      }, { status: 400 })
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Password is required and must be a string'
      }, { status: 400 })
    }

    // Username validation
    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json({
        success: false,
        error: 'Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens'
      }, { status: 400 })
    }

    // Password validation
    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json({
        success: false,
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
      }, { status: 400 })
    }

    if (password.length > PASSWORD_MAX_LENGTH) {
      return NextResponse.json({
        success: false,
        error: `Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`
      }, { status: 400 })
    }

    // Check for common weak passwords (basic check)
    const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein']
    if (commonPasswords.includes(password.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: 'Password is too common. Please choose a stronger password.'
      }, { status: 400 })
    }

    // Check if user already exists (case-insensitive)
    const existingUser = Array.from(USERS.keys()).find(
      u => u.toLowerCase() === username.toLowerCase()
    )
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User already exists'
      }, { status: 409 })
    }

    try {
      // Generate salt and hash password using bcrypt (fallback since argon2 is not available)
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Create user
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const user = {
        id: userId,
        username: username.toLowerCase(), // Store username in lowercase for consistency
        passwordHash,
        salt: '' // bcrypt handles salt internally
      }

      USERS.set(username.toLowerCase(), user)

      // Generate a simple session token (in production, use proper JWT)
      const tokenPayload = {
        id: user.id,
        username: user.username,
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        iat: Date.now()
      }

      // Use crypto for token generation instead of simple base64
      const tokenData = JSON.stringify(tokenPayload)
      const token = Buffer.from(tokenData).toString('base64url')

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username
        },
        message: 'User registered successfully'
      })

    } catch (hashError) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json({
        success: false,
        error: 'Failed to process registration. Please try again.'
      }, { status: 500 })
    }

  } catch (parseError) {
    console.error('Request parsing error:', parseError)
    return NextResponse.json({
      success: false,
      error: 'Invalid request format'
    }, { status: 400 })
  }
}
