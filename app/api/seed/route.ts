import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seeders'
import { withPawsitiveDB } from '@/lib/mongodb'

// Perfiles básicos de mascotas para la aplicación
const petProfiles = [
  {
    _id: "pet_001",
    breed: "Golden Retriever",
    category: "perro",
    size: "Grande",
    characteristics: {
      energy: "Alta",
      temperament: ["Amigable", "Inteligente", "Confiable"],
      lifespan: "10-12 años",
      weight: "25-32 kg",
      exerciseNeeds: "Alta - 2 horas diarias"
    },
    commonIssues: ["Displasia de cadera", "Cataratas", "Epilepsia"],
    recommendations: [
      {
        _id: "rec_001",
        type: "training",
        title: "Entrenamiento básico de obediencia",
        description: "Comandos esenciales para Golden Retrievers",
        difficulty: "Fácil",
        duration: "2-3 semanas",
        ageRange: "2-6 meses"
      },
      {
        _id: "rec_002", 
        type: "nutrition",
        title: "Dieta para perros grandes",
        description: "Alimentación balanceada para razas grandes",
        difficulty: "Fácil",
        duration: "Diario",
        ageRange: "Adulto"
      }
    ]
  },
  {
    _id: "pet_002",
    breed: "Siamés",
    category: "gato",
    size: "Mediano",
    characteristics: {
      energy: "Moderada",
      temperament: ["Vocal", "Inteligente", "Social"],
      lifespan: "12-15 años",
      weight: "3-5 kg",
      exerciseNeeds: "Moderada - juego diario"
    },
    commonIssues: ["Problemas respiratorios", "Gingivitis", "Ansiedad"],
    recommendations: [
      {
        _id: "rec_003",
        type: "wellness",
        title: "Cuidado dental para gatos",
        description: "Rutina de higiene dental preventiva",
        difficulty: "Moderado",
        duration: "Semanal",
        ageRange: "Adulto"
      },
      {
        _id: "rec_004",
        type: "training",
        title: "Enriquecimiento ambiental",
        description: "Actividades para estimular la mente felina",
        difficulty: "Fácil",
        duration: "Diario",
        ageRange: "Todas las edades"
      }
    ]
  },
  {
    _id: "pet_003",
    breed: "Bulldog Francés",
    category: "perro",
    size: "Pequeño",
    characteristics: {
      energy: "Baja",
      temperament: ["Calmado", "Sociable", "Adaptable"],
      lifespan: "10-12 años",
      weight: "8-14 kg",
      exerciseNeeds: "Baja - paseos cortos"
    },
    commonIssues: ["Problemas respiratorios", "Alergias", "Problemas de columna"],
    recommendations: [
      {
        _id: "rec_005",
        type: "wellness",
        title: "Cuidados para razas braquicéfalas",
        description: "Manejo especial para perros de cara chata",
        difficulty: "Moderado",
        duration: "Diario",
        ageRange: "Todas las edades"
      }
    ]
  },
  {
    _id: "pet_004",
    breed: "Maine Coon",
    category: "gato",
    size: "Grande",
    characteristics: {
      energy: "Moderada",
      temperament: ["Gentil", "Inteligente", "Sociable"],
      lifespan: "12-15 años",
      weight: "4-8 kg",
      exerciseNeeds: "Moderada - juego regular"
    },
    commonIssues: ["Cardiomiopatía", "Displasia de cadera", "Problemas renales"],
    recommendations: [
      {
        _id: "rec_006",
        type: "nutrition",
        title: "Nutrición para gatos grandes",
        description: "Dieta específica para razas grandes de gatos",
        difficulty: "Fácil",
        duration: "Diario",
        ageRange: "Adulto"
      }
    ]
  },
  {
    _id: "pet_005",
    breed: "Border Collie",
    category: "perro",
    size: "Mediano",
    characteristics: {
      energy: "Muy Alta",
      temperament: ["Inteligente", "Energético", "Obediente"],
      lifespan: "12-15 años",
      weight: "14-20 kg",
      exerciseNeeds: "Muy Alta - 3+ horas diarias"
    },
    commonIssues: ["Epilepsia", "Displasia de cadera", "Atrofia retinal"],
    recommendations: [
      {
        _id: "rec_007",
        type: "training",
        title: "Entrenamiento avanzado de agilidad",
        description: "Ejercicios mentales y físicos para Border Collies",
        difficulty: "Avanzado",
        duration: "Diario",
        ageRange: "6 meses+"
      },
      {
        _id: "rec_008",
        type: "wellness",
        title: "Manejo de energía alta",
        description: "Técnicas para canalizar la energía de razas trabajadoras",
        difficulty: "Moderado",
        duration: "Diario",
        ageRange: "Todas las edades"
      }
    ]
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Iniciando seeders...')
    
    const result = await seedDatabase()
    
    const petResult = await withPawsitiveDB(async (db) => {
      // Limpiar colección de perfiles de mascotas existentes
      const petsCollection = db.collection('pets')
      await petsCollection.deleteMany({})
      
      // Insertar perfiles básicos de mascotas
      const petResult = await petsCollection.insertMany(petProfiles)
      
      return {
        petsInserted: petResult.insertedCount,
        message: `Seeded ${petResult.insertedCount} pet profiles successfully`
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Base de datos poblada exitosamente con ${result.insertedCount} restaurantes y ${petResult.petsInserted} perfiles de mascotas`,
      restaurantsInserted: result.insertedCount,
      petsInserted: petResult.petsInserted
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