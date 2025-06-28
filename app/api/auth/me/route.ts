import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth'

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Kahupet')
    const usersCollection = db.collection('users')
    const userPetsCollection = db.collection('user_pets')

    // Obtener información del usuario
    const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) })
    if (!user) {
      await client.close()
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Contar mascotas del usuario
    const petCount = await userPetsCollection.countDocuments({ userId: currentUser.userId })

    await client.close()

    return NextResponse.json({
      user: {
        id: currentUser.userId,
        name: user.name,
        email: user.email,
        petCount,
        interestedInPaying: user.interestedInPaying || 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 