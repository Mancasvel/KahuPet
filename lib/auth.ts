import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || "pawsitive-secret-key-2024"

interface JWTPayload {
  userId: string
  email: string
  name: string
  iat: number
  exp: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Error verificando token:', error)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Intentar obtener token de cookie
  const token = request.cookies.get('auth-token')?.value
  
  if (token) {
    return token
  }

  // Intentar obtener token de header Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  return verifyToken(token)
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getCurrentUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
} 