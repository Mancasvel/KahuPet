import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
}) : null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const breed = searchParams.get('breed')
    const category = searchParams.get('category')
    const size = searchParams.get('size')

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    await client.connect()
    const db = client.db('pawsitive')
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

    const pets = await collection.find(filters).toArray()
    
    await client.close()

    return NextResponse.json(pets)

  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json({ error: 'Error fetching pet profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const petData = await request.json()

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Validar datos requeridos
    if (!petData.breed || !petData.category) {
      return NextResponse.json({ error: 'Breed and category are required' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('pawsitive')
    const collection = db.collection('pets')

    const result = await collection.insertOne({
      ...petData,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await client.close()

    return NextResponse.json({ 
      message: 'Pet profile created successfully',
      petId: result.insertedId 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating pet profile:', error)
    return NextResponse.json({ error: 'Error creating pet profile' }, { status: 500 })
  }
} 