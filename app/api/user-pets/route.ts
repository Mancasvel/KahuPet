import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getCurrentUser, requireAuth } from '@/lib/auth'

const uri = process.env.MONGODB_URI || "mongodb+srv://manuel:1234@cluster0.jt4ra.mongodb.net/"
const MAX_PETS_PER_USER = 5

export async function GET(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userId = currentUser.userId

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    const userPets = await collection.find({ userId }).toArray()
    
    await client.close()

    return NextResponse.json(userPets)

  } catch (error) {
    console.error('Error fetching user pets:', error)
    return NextResponse.json({ error: 'Error fetching user pets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request)
    const { nombre, tipo, raza, edad, peso, genero, notas } = await request.json()

    if (!nombre || !tipo || !raza) {
      return NextResponse.json(
        { error: 'Nombre, tipo y raza son requeridos' },
        { status: 400 }
      )
    }

    const userId = currentUser.userId

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Verificar límite de mascotas por usuario
    const existingPetsCount = await collection.countDocuments({ userId })
    if (existingPetsCount >= MAX_PETS_PER_USER) {
      await client.close()
      return NextResponse.json(
        { error: `No puedes tener más de ${MAX_PETS_PER_USER} mascotas registradas` },
        { status: 400 }
      )
    }

    const newPet = {
      userId,
      nombre,
      tipo,
      raza,
      edad: edad || null,
      peso: peso || null,
      genero: genero || null,
      notas: notas || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newPet)
    
    await client.close()

    // Crear objeto de mascota con el _id generado
    const createdPet = {
      ...newPet,
      _id: result.insertedId
    }

    return NextResponse.json({ 
      message: 'Mascota registrada exitosamente',
      petId: result.insertedId,
      pet: createdPet
    }, { status: 201 })

  } catch (error) {
    console.error('Error registering pet:', error)
    return NextResponse.json({ error: 'Error registering pet' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')
    const { nombre, tipo, raza, edad, peso, genero, notas } = await request.json()

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID es requerido' }, { status: 400 })
    }

    if (!nombre || !tipo || !raza) {
      return NextResponse.json(
        { error: 'Nombre, tipo y raza son requeridos' },
        { status: 400 }
      )
    }

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Verificar que la mascota pertenece al usuario autenticado
    const existingPet = await collection.findOne({ _id: new ObjectId(petId) })
    if (!existingPet) {
      await client.close()
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    if (existingPet.userId !== currentUser.userId) {
      await client.close()
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta mascota' },
        { status: 403 }
      )
    }

    const updateData = {
      nombre,
      tipo,
      raza,
      edad: edad || null,
      peso: peso || null,
      genero: genero || null,
      notas: notas || '',
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(petId) },
      { $set: updateData }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Mascota actualizada exitosamente',
      pet: { _id: petId, userId: currentUser.userId, ...updateData }
    })

  } catch (error) {
    console.error('Error updating pet:', error)
    return NextResponse.json({ error: 'Error updating pet' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID es requerido' }, { status: 400 })
    }

    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db('Pawsitive')
    const collection = db.collection('user_pets')

    // Verificar que la mascota pertenece al usuario autenticado
    const pet = await collection.findOne({ _id: new ObjectId(petId) })
    if (!pet) {
      await client.close()
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      )
    }

    if (pet.userId !== currentUser.userId) {
      await client.close()
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta mascota' },
        { status: 403 }
      )
    }

    const result = await collection.deleteOne({ _id: new ObjectId(petId) })

    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Mascota eliminada exitosamente' })

  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Error deleting pet' }, { status: 500 })
  }
} 