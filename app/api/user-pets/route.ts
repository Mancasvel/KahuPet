import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
}) : null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    await client.connect()
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Si se especifica userId, devolver solo las mascotas de ese usuario
    const filters: any = {}
    if (userId) {
      filters.userId = userId
    }

    const userPets = await collection.find(filters).toArray()
    
    await client.close()

    return NextResponse.json(userPets)

  } catch (error) {
    console.error('Error fetching user pets:', error)
    return NextResponse.json({ error: 'Error fetching user pets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const petData = await request.json()

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Validar datos requeridos
    if (!petData.name || !petData.type || !petData.breed) {
      return NextResponse.json({ 
        error: 'Name, type, and breed are required' 
      }, { status: 400 })
    }

    await client.connect()
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Crear el perfil de la mascota del usuario
    const userPet = {
      userId: petData.userId || 'anonymous', // Por ahora usamos anonymous si no hay usuario
      name: petData.name,
      type: petData.type, // 'perro' o 'gato'
      breed: petData.breed,
      age: petData.age || null,
      weight: petData.weight || null,
      gender: petData.gender || null,
      isNeutered: petData.isNeutered || false,
      activityLevel: petData.activityLevel || 'moderado', // bajo, moderado, alto
      healthIssues: petData.healthIssues || [],
      specialDiet: petData.specialDiet || false,
      dietRestrictions: petData.dietRestrictions || [],
      behaviorIssues: petData.behaviorIssues || [],
      notes: petData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(userPet)

    await client.close()

    return NextResponse.json({ 
      message: 'Pet registered successfully',
      petId: result.insertedId,
      pet: userPet
    }, { status: 201 })

  } catch (error) {
    console.error('Error registering pet:', error)
    return NextResponse.json({ error: 'Error registering pet' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')
    const petData = await request.json()

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 })
    }

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Validar datos requeridos
    if (!petData.name || !petData.type || !petData.breed) {
      return NextResponse.json({ 
        error: 'Name, type, and breed are required' 
      }, { status: 400 })
    }

    await client.connect()
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Actualizar la mascota
    const updateData = {
      name: petData.name,
      type: petData.type,
      breed: petData.breed,
      age: petData.age || null,
      weight: petData.weight || null,
      gender: petData.gender || null,
      isNeutered: petData.isNeutered || false,
      activityLevel: petData.activityLevel || 'moderado',
      healthIssues: petData.healthIssues || [],
      specialDiet: petData.specialDiet || false,
      dietRestrictions: petData.dietRestrictions || [],
      behaviorIssues: petData.behaviorIssues || [],
      notes: petData.notes || '',
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(petId) },
      { $set: updateData }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Pet updated successfully',
      pet: { _id: petId, ...updateData }
    })

  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json({ error: 'Error updating pet' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 })
    }

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    await client.connect()
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    const result = await collection.deleteOne({ _id: new ObjectId(petId) })

    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Pet deleted successfully' })

  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Error deleting pet' }, { status: 500 })
  }
} 