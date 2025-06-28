import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
}) : null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // training, nutrition, wellness
    const breed = searchParams.get('breed')
    const difficulty = searchParams.get('difficulty')
    const ageRange = searchParams.get('ageRange')

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    await client.connect()
    const db = client.db('pawsitive')
    const collection = db.collection('pets')

    // Construir pipeline de agregación para obtener recomendaciones
    const pipeline: any[] = []

    // Desenrollar las recomendaciones
    pipeline.push({ $unwind: '$recommendations' })

    // Construir filtros
    const matchFilters: any = {}
    
    if (type) {
      matchFilters['recommendations.type'] = type
    }
    
    if (breed) {
      matchFilters['breed'] = new RegExp(breed, 'i')
    }
    
    if (difficulty) {
      matchFilters['recommendations.difficulty'] = new RegExp(difficulty, 'i')
    }
    
    if (ageRange) {
      matchFilters['recommendations.ageRange'] = new RegExp(ageRange, 'i')
    }

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters })
    }

    // Proyectar los campos necesarios
    pipeline.push({
      $project: {
        _id: '$recommendations._id',
        type: '$recommendations.type',
        title: '$recommendations.title',
        description: '$recommendations.description',
        breed: '$breed',
        category: '$category',
        size: '$size',
        tags: '$recommendations.tags',
        difficulty: '$recommendations.difficulty',
        duration: '$recommendations.duration',
        ageRange: '$recommendations.ageRange',
        image: '$recommendations.image',
        portions: '$recommendations.portions',
        characteristics: '$characteristics'
      }
    })

    // Limitar resultados
    pipeline.push({ $limit: 50 })

    const recommendations = await collection.aggregate(pipeline).toArray()
    
    await client.close()

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
      filters: { type, breed, difficulty, ageRange }
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Error fetching recommendations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { breed, recommendationData } = await request.json()

    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    // Validar datos requeridos
    if (!breed || !recommendationData.type || !recommendationData.title) {
      return NextResponse.json({ 
        error: 'Breed, type, and title are required' 
      }, { status: 400 })
    }

    await client.connect()
    const db = client.db('pawsitive')
    const collection = db.collection('pets')

    // Generar ID único para la recomendación
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const result = await collection.updateOne(
      { breed: new RegExp(breed, 'i') },
      { 
        $push: { 
          recommendations: {
            _id: recommendationId,
            ...recommendationData,
            createdAt: new Date()
          }
        }
      }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: 'Pet breed not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Recommendation added successfully',
      recommendationId 
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding recommendation:', error)
    return NextResponse.json({ error: 'Error adding recommendation' }, { status: 500 })
  }
} 