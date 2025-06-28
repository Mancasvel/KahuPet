import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth'
import { withPawsitiveDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const result = await withPawsitiveDB(async (db) => {
      const usersCollection = db.collection('users')
      const userPetsCollection = db.collection('user_pets')

      // Obtener información del usuario
      const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) })
      if (!user) {
        throw new Error('Usuario no encontrado')
      }

      // Contar mascotas del usuario
      const petCount = await userPetsCollection.countDocuments({ userId: currentUser.userId })

      return { user, petCount }
    })

    return NextResponse.json({
      user: {
        id: currentUser.userId,
        name: result.user.name,
        email: result.user.email,
        petCount: result.petCount,
        interestedInPaying: result.user.interestedInPaying || 0
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error obteniendo usuario actual:', error)
    
    if (error.message === 'Usuario no encontrado') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 