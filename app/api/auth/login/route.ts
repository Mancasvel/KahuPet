import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { withPawsitiveDB } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || "kahupet-secret-key-2024"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const result = await withPawsitiveDB(async (db) => {
      const usersCollection = db.collection('users')

      // Buscar usuario por email
      const user = await usersCollection.findOne({ email: email.toLowerCase() })
      if (!user) {
        throw new Error('Credenciales inválidas')
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas')
      }

      // Contar mascotas del usuario
      const userPetsCollection = db.collection('user_pets')
      const petCount = await userPetsCollection.countDocuments({ userId: user._id.toString() })

      // Actualizar petCount en usuario
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            petCount,
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      )

      return { user, petCount }
    })

    // Crear JWT token
    const token = jwt.sign(
      { 
        userId: result.user._id.toString(),
        email: result.user.email,
        name: result.user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: result.user._id.toString(),
        name: result.user.name,
        email: result.user.email,
        petCount: result.petCount
      }
    }, { status: 200 })

    // Establecer cookie HTTP-only para el token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    return response

  } catch (error: any) {
    console.error('Error en login:', error)
    
    if (error.message === 'Credenciales inválidas') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 