import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MongoDB URI no configurado' }, { status: 500 })
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  })

  try {
    await client.connect()
    const db = client.db('Komi')
    const restaurantsCollection = db.collection('Restaurants')

    const restaurants = await restaurantsCollection.find({}).toArray()
    
    console.log(`📋 Sirviendo ${restaurants.length} restaurantes`)

    return NextResponse.json(restaurants, { status: 200 })
  } catch (error) {
    console.error('❌ Error obteniendo restaurantes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  } finally {
    await client.close()
  }
} 