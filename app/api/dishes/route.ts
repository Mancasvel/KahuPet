import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
}) : null

export async function GET() {
  try {
    if (!client) {
      return NextResponse.json({ error: 'MongoDB client not initialized' }, { status: 500 })
    }

    await client.connect()
    const db = client.db('Komi')
    const restaurantsCollection = db.collection('Restaurants')

    // Obtener todos los restaurantes
    const allRestaurants = await restaurantsCollection.find({}).toArray()
    const allDishes: any[] = []

    // Extraer todos los platos
    for (const restaurant of allRestaurants) {
      for (const dish of restaurant.dishes || []) {
        allDishes.push({
          ...dish,
          restaurant: {
            name: restaurant.name,
            address: restaurant.address,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating
          }
        })
      }
    }

    console.log(`📋 Sirviendo ${allDishes.length} platos de ${allRestaurants.length} restaurantes`)

    return NextResponse.json({
      dishes: allDishes,
      restaurants: allRestaurants.length,
      total: allDishes.length
    })

  } catch (error) {
    console.error('Error fetching dishes:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
} 