import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI!)

const samplePetProfiles = [
  {
    breed: "Golden Retriever",
    category: "Perro",
    size: "Grande",
    characteristics: {
      energy: "Alta",
      temperament: ["Amigable", "Inteligente", "Devoto", "Activo"],
      lifespan: "10-12 años",
      weight: "25-34 kg",
      exerciseNeeds: "Alto"
    },
    commonIssues: ["Displasia de cadera", "Problemas cardíacos", "Obesidad"],
    recommendations: [
      {
        _id: "rec_001",
        type: "training",
        title: "Entrenamiento básico de obediencia",
        description: "Los Golden Retrievers son muy inteligentes y responden bien al refuerzo positivo. Sesiones cortas de 10-15 minutos, 2-3 veces al día.",
        tags: ["obediencia", "cachorro", "básico", "refuerzo-positivo"],
        difficulty: "Fácil",
        duration: "2-4 semanas",
        ageRange: "8 semanas - 6 meses",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_002", 
        type: "nutrition",
        title: "Dieta para cachorro Golden Retriever",
        description: "Alimentación equilibrada rica en proteínas para el crecimiento saludable. 3-4 comidas al día hasta los 6 meses.",
        tags: ["cachorro", "crecimiento", "proteína", "frecuencia-alta"],
        difficulty: "Fácil",
        ageRange: "2-12 meses",
        portions: "2-3 tazas divididas en 3-4 comidas",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_003",
        type: "wellness",
        title: "Rutina de ejercicio para Golden adulto",
        description: "Necesitan 60-90 minutos de ejercicio diario. Combina caminatas, natación y juegos de buscar.",
        tags: ["ejercicio", "adulto", "natación", "juegos"],
        difficulty: "Moderado",
        duration: "60-90 minutos diarios",
        ageRange: "1-8 años",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    breed: "Border Collie", 
    category: "Perro",
    size: "Mediano",
    characteristics: {
      energy: "Muy Alta",
      temperament: ["Inteligente", "Enérgico", "Trabajador", "Leal"],
      lifespan: "12-15 años",
      weight: "14-20 kg",
      exerciseNeeds: "Muy Alto"
    },
    commonIssues: ["Aburrimiento", "Comportamiento destructivo", "Displasia de cadera"],
    recommendations: [
      {
        _id: "rec_004",
        type: "training",
        title: "Estimulación mental para Border Collie",
        description: "Necesitan desafíos mentales constantes. Usa puzzles, agility y entrenamientos de trucos complejos.",
        tags: ["estimulación-mental", "puzzles", "agility", "trucos"],
        difficulty: "Avanzado",
        duration: "30-45 minutos diarios",
        ageRange: "6 meses - adulto",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_005",
        type: "wellness",
        title: "Plan de ejercicio intensivo",
        description: "Requieren 2+ horas de actividad física y mental diaria. Incluye correr, frisbee y pastoreo.",
        tags: ["ejercicio-intensivo", "frisbee", "pastoreo", "resistencia"],
        difficulty: "Alto",
        duration: "120+ minutos diarios",
        ageRange: "1-10 años",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    breed: "Persa",
    category: "Gato",
    size: "Mediano",
    characteristics: {
      energy: "Baja-Moderada",
      temperament: ["Tranquilo", "Cariñoso", "Dócil", "Independiente"],
      lifespan: "12-17 años", 
      weight: "3-5 kg",
      exerciseNeeds: "Bajo"
    },
    commonIssues: ["Problemas respiratorios", "Enredos en el pelaje", "Problemas oculares"],
    recommendations: [
      {
        _id: "rec_006",
        type: "wellness",
        title: "Cuidado del pelaje persa",
        description: "Cepillado diario obligatorio para evitar nudos. Baño mensual y limpieza ocular regular.",
        tags: ["cepillado", "pelaje-largo", "higiene", "cuidado-diario"],
        difficulty: "Moderado",
        duration: "15-20 minutos diarios",
        ageRange: "Todas las edades",
        image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_007",
        type: "nutrition",
        title: "Dieta para gato persa senior",
        description: "Alimento senior con fibra para control de peso y fácil digestión. Porciones controladas.",
        tags: ["senior", "control-peso", "fibra", "digestión"],
        difficulty: "Fácil",
        ageRange: "7+ años",
        portions: "1/2 taza dividida en 2 comidas",
        image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    breed: "Bulldog Francés",
    category: "Perro", 
    size: "Pequeño",
    characteristics: {
      energy: "Moderada",
      temperament: ["Amigable", "Adaptable", "Juguetón", "Alerta"],
      lifespan: "10-12 años",
      weight: "8-14 kg", 
      exerciseNeeds: "Moderado"
    },
    commonIssues: ["Problemas respiratorios", "Alergias alimentarias", "Problemas de espalda"],
    recommendations: [
      {
        _id: "rec_008",
        type: "wellness",
        title: "Ejercicio adaptado para Bulldog Francés",
        description: "Ejercicio suave debido a problemas respiratorios. Caminatas cortas en clima fresco.",
        tags: ["ejercicio-suave", "clima-fresco", "respiración", "caminatas-cortas"],
        difficulty: "Fácil",
        duration: "20-30 minutos divididos",
        ageRange: "1+ años",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_009",
        type: "nutrition",
        title: "Dieta hipoalergénica",
        description: "Alimento con proteína limitada para perros con alergias. Evitar pollo y granos comunes.",
        tags: ["hipoalergénico", "proteína-limitada", "sin-granos", "alergias"],
        difficulty: "Moderado",
        ageRange: "6 meses+",
        portions: "1 taza dividida en 2 comidas",
        image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    breed: "Maine Coon",
    category: "Gato",
    size: "Grande", 
    characteristics: {
      energy: "Moderada-Alta",
      temperament: ["Sociable", "Inteligente", "Gentil", "Adaptable"],
      lifespan: "13-14 años",
      weight: "4-8 kg",
      exerciseNeeds: "Moderado-Alto"
    },
    commonIssues: ["Cardiomiopatía", "Displasia de cadera", "Problemas dentales"],
    recommendations: [
      {
        _id: "rec_010",
        type: "training",
        title: "Socialización temprana para Maine Coon",
        description: "Aprovecha su naturaleza sociable. Exposición gradual a personas, sonidos y situaciones.",
        tags: ["socialización", "cachorro", "exposición", "gradual"],
        difficulty: "Fácil",
        duration: "Primeros 4 meses",
        ageRange: "8-16 semanas",
        image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500&h=300&fit=crop"
      },
      {
        _id: "rec_011",
        type: "wellness", 
        title: "Juegos interactivos para gatos grandes",
        description: "Necesitan juguetes grandes y resistentes. Torres para trepar y juegos de caza simulada.",
        tags: ["juegos-interactivos", "gato-grande", "trepar", "caza-simulada"],
        difficulty: "Moderado",
        duration: "30-45 minutos diarios",
        ageRange: "6 meses+",
        image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500&h=300&fit=crop"
      }
    ]
  }
]

async function seedDatabase() {
  try {
    console.log('🐾 Conectando a MongoDB...')
    await client.connect()
    
    const db = client.db('pawsitive')
    const collection = db.collection('pets')
    
    // Limpiar colección existente
    console.log('🧹 Limpiando datos existentes...')
    await collection.deleteMany({})
    
    // Insertar nuevos datos de mascotas
    console.log('🐕 Insertando perfiles de mascotas y recomendaciones...')
    const result = await collection.insertMany(samplePetProfiles)
    
    console.log(`✅ Seeding completado!`)
    console.log(`🐾 Insertados ${result.insertedCount} perfiles de razas`)
    
    // Mostrar estadísticas
    const totalRecommendations = samplePetProfiles.reduce((total, pet) => total + pet.recommendations.length, 0)
    console.log(`💡 Total de recomendaciones: ${totalRecommendations}`)
    
    // Estadísticas por tipo
    const trainingRecs = samplePetProfiles.reduce((total, pet) => 
      total + pet.recommendations.filter(r => r.type === 'training').length, 0)
    const nutritionRecs = samplePetProfiles.reduce((total, pet) => 
      total + pet.recommendations.filter(r => r.type === 'nutrition').length, 0)  
    const wellnessRecs = samplePetProfiles.reduce((total, pet) => 
      total + pet.recommendations.filter(r => r.type === 'wellness').length, 0)
    
    console.log(`🎓 Entrenamiento: ${trainingRecs} recomendaciones`)
    console.log(`🥩 Nutrición: ${nutritionRecs} recomendaciones`)
    console.log(`🧘 Bienestar: ${wellnessRecs} recomendaciones`)
    
    // Crear índices para mejorar el rendimiento de búsqueda
    console.log('📊 Creando índices...')
    await collection.createIndex({ "breed": 1 })
    await collection.createIndex({ "category": 1 })
    await collection.createIndex({ "size": 1 })
    await collection.createIndex({ "recommendations.type": 1 })
    await collection.createIndex({ "recommendations.tags": 1 })
    await collection.createIndex({ "recommendations.ageRange": 1 })
    await collection.createIndex({ "characteristics.energy": 1 })
    await collection.createIndex({ "commonIssues": 1 })
    
    console.log('✅ Índices creados correctamente')
    console.log('🎉 Base de datos Pawsitive lista para usar!')
    
  } catch (error) {
    console.error('❌ Error en el seeding:', error)
  } finally {
    await client.close()
    console.log('🔐 Conexión cerrada')
  }
}

// Ejecutar seeding
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase 