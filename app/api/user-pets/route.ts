import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { withPawsitiveDB } from '@/lib/mongodb'

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

    const userPets = await withPawsitiveDB(async (db) => {
      const collection = db.collection('user_pets')
      return await collection.find({ userId }).toArray()
    })

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

    const result = await withPawsitiveDB(async (db) => {
      const collection = db.collection('user_pets')

      // Verificar límite de mascotas por usuario
      const existingPetsCount = await collection.countDocuments({ userId })
      if (existingPetsCount >= MAX_PETS_PER_USER) {
        throw new Error(`No puedes tener más de ${MAX_PETS_PER_USER} mascotas registradas`)
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

      const insertResult = await collection.insertOne(newPet)
      
      return { insertResult, newPet }
    })

    // Crear objeto de mascota con el _id generado
    const createdPet = {
      ...result.newPet,
      _id: result.insertResult.insertedId
    }

    return NextResponse.json({ 
      message: 'Mascota registrada exitosamente',
      petId: result.insertResult.insertedId,
      pet: createdPet
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error registering pet:', error)
    
    if (error.message.includes('más de')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
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

    const result = await withPawsitiveDB(async (db) => {
      const collection = db.collection('user_pets')

      // Verificar que la mascota pertenece al usuario autenticado
      const existingPet = await collection.findOne({ _id: new ObjectId(petId) })
      if (!existingPet) {
        throw new Error('Mascota no encontrada')
      }

      if (existingPet.userId !== currentUser.userId) {
        throw new Error('No tienes permiso para editar esta mascota')
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

      const updateResult = await collection.updateOne(
        { _id: new ObjectId(petId) },
        { $set: updateData }
      )

      return { updateResult, updateData }
    })

    if (result.updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Mascota actualizada exitosamente',
      pet: { _id: petId, userId: currentUser.userId, ...result.updateData }
    })

  } catch (error: any) {
    console.error('Error updating pet:', error)
    
    if (error.message === 'Mascota no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    
    if (error.message.includes('permiso')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    
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

    const result = await withPawsitiveDB(async (db) => {
      const collection = db.collection('user_pets')

      // Verificar que la mascota pertenece al usuario autenticado
      const pet = await collection.findOne({ _id: new ObjectId(petId) })
      if (!pet) {
        throw new Error('Mascota no encontrada')
      }

      if (pet.userId !== currentUser.userId) {
        throw new Error('No tienes permiso para eliminar esta mascota')
      }

      const deleteResult = await collection.deleteOne({ _id: new ObjectId(petId) })
      return deleteResult
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Mascota eliminada exitosamente' })

  } catch (error: any) {
    console.error('Error deleting pet:', error)
    
    if (error.message === 'Mascota no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    
    if (error.message.includes('permiso')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Error deleting pet' }, { status: 500 })
  }
} 