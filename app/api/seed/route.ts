import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seeders'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Iniciando seeders...')
    
    const result = await seedDatabase()
    
    return NextResponse.json({
      success: true,
      message: `Base de datos poblada exitosamente con ${result.insertedCount} restaurantes`,
      insertedCount: result.insertedCount
    })
  } catch (error) {
    console.error('❌ Error executing seeders:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al poblar la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para poblar la base de datos. Usa POST para ejecutar los seeders.',
    usage: 'POST /api/seed'
  })
} 