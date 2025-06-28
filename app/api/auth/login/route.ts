import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"
const JWT_SECRET = process.env.JWT_SECRET || "pawsitive-secret-key-2024"

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

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Pawsitive')
    const usersCollection = db.collection('users')

    // Buscar usuario por email
    const user = await usersCollection.findOne({ email: email.toLowerCase() })
    if (!user) {
      await client.close()
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await client.close()
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
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

    await client.close()

    // Crear JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        petCount
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

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 