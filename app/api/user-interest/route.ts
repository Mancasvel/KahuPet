import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth'

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"

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

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Kahupet')
    const usersCollection = db.collection('users')

    const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) })
    
    await client.close()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      interestedInPaying: user.interestedInPaying || 0
    })

  } catch (error) {
    console.error('Error obteniendo interés de usuario:', error)
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

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Kahupet')
    const usersCollection = db.collection('users')

    // Actualizar el campo interestedInPaying a 1
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(currentUser.userId) },
      { 
        $set: { 
          interestedInPaying: 1,
          paymentInterestDate: new Date()
        }
      }
    )

    await client.close()

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