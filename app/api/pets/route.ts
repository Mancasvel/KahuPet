import { NextRequest, NextResponse } from 'next/server'
import { withPawsitiveDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const breed = searchParams.get('breed')
    const category = searchParams.get('category')
    const size = searchParams.get('size')

    const pets = await withPawsitiveDB(async (db) => {
      const collection = db.collection('pets')

      // Construir filtros de búsqueda
      const filters: any = {}
      
      if (breed) {
        filters.breed = new RegExp(breed, 'i')
      }
      
      if (category) {
        filters.category = new RegExp(category, 'i')
      }
      
      if (size) {
        filters.size = new RegExp(size, 'i')
      }

      return await collection.find(filters).toArray()
    })

    return NextResponse.json(pets)

  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Error fetching pet profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const petData = await request.json()

    // Validar datos requeridos para perfil de raza
    if (!petData.breed || !petData.category) {
      return NextResponse.json({ error: 'Breed and category are required' }, { status: 400 })
    }

    const result = await withPawsitiveDB(async (db) => {
      const collection = db.collection('pets')

      return await collection.insertOne({
        ...petData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })

    return NextResponse.json({ 
      message: 'Pet profile created successfully',
      petId: result.insertedId 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating pet profile:', error)
    return NextResponse.json({ error: 'Error creating pet profile' }, { status: 500 })
  }
} 