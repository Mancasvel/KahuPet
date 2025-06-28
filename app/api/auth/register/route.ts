import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validación básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Kahupet')
    const usersCollection = db.collection('users')

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      await client.close()
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Crear usuario
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      petCount: 0
    }

    const result = await usersCollection.insertOne(newUser)
    await client.close()

    // Crear JWT token para login automático
    const token = jwt.sign(
      { 
        userId: result.insertedId.toString(),
        email: email.toLowerCase(),
        name
      },
              process.env.JWT_SECRET || "kahupet-secret-key-2024",
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Usuario registrado exitosamente',
      userId: result.insertedId,
      user: {
        id: result.insertedId.toString(),
        name,
        email: email.toLowerCase(),
        petCount: 0
      }
    }, { status: 201 })

    // Establecer cookie HTTP-only para login automático
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    return response

  } catch (error) {
    console.error('Error registrando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 