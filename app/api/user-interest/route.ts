import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth'
import { withPawsitiveDB } from '@/lib/mongodb'

// GET - Obtener estado de interés del usuario
export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const user = await withPawsitiveDB(async (db) => {
      const usersCollection = db.collection('users')
      const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) })
      
      if (!user) {
        throw new Error('Usuario no encontrado')
      }
      
      return user
    })

    return NextResponse.json({
      interestedInPaying: user.interestedInPaying || 0
    })

  } catch (error: any) {
    console.error('Error obteniendo interés de usuario:', error)
    
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

// POST - Marcar interés en pagar
export async function POST(request: NextRequest) {
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

      // Actualizar el campo interestedInPaying a 1
      const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(currentUser.userId) },
        { 
          $set: { 
            interestedInPaying: 1,
            paymentInterestDate: new Date()
          }
        }
      )

      return updateResult
    })

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log(`✅ Usuario ${currentUser.userId} marcó interés en pagar`)

    return NextResponse.json({
      success: true,
      message: '¡Gracias por tu interés! Te contactaremos pronto.',
      interestedInPaying: 1
    })

  } catch (error) {
    console.error('Error marcando interés de pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 