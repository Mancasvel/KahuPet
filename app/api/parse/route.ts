import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { callOpenRouter } from '@/lib/openrouter'

// Verificar que las variables de entorno estén configuradas
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI no está configurado en .env.local')
}

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY no está configurado en .env.local')
}

const client = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
}) : null

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Si no están configuradas las APIs reales, usar datos de demostración
    const hasValidMongoDB = process.env.MONGODB_URI && 
                           !process.env.MONGODB_URI.includes('demo') && 
                           !process.env.MONGODB_URI.includes('username:password');
    
    const hasValidOpenRouter = process.env.OPENROUTER_API_KEY && 
                              !process.env.OPENROUTER_API_KEY.includes('demo') &&
                              !process.env.OPENROUTER_API_KEY.includes('placeholder') &&
                              !process.env.OPENROUTER_API_KEY.includes('xxxxxxxx');

    const useDemo = !hasValidMongoDB || !hasValidOpenRouter;
    
    // Logs para debug
    console.log('🔍 Environment check:');
    console.log('  MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('  OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
    
    console.log('  Valid MongoDB:', hasValidMongoDB);
    console.log('  Valid OpenRouter:', hasValidOpenRouter);
    console.log('  Using demo mode:', useDemo);

    if (useDemo) {
      // Usar datos de demostración locales
      const demoResponse = getDemoResponse(query)
      return NextResponse.json({ 
        recommendations: demoResponse.recommendations,
        petVoiceResponse: demoResponse.petVoiceResponse,
        summary: demoResponse.summary,
        total: demoResponse.recommendations.length,
        demo: true
      })
    }

    // Conectar a MongoDB primero para obtener las recomendaciones disponibles
    if (!client) {
      return NextResponse.json({ error: 'MongoDB client not initialized' }, { status: 500 })
    }
    
    await client.connect()
    const db = client.db('pawsitive')
    const petsCollection = db.collection('pets')

    // Obtener todas las recomendaciones disponibles para pasarlas al LLM
    const allPetProfiles = await petsCollection.find({}).toArray()
    const allRecommendations: any[] = []
    
    for (const petProfile of allPetProfiles) {
      for (const rec of petProfile.recommendations || []) {
        allRecommendations.push({
          ...rec,
          breed: petProfile.breed,
          category: petProfile.category,
          size: petProfile.size,
          characteristics: petProfile.characteristics
        })
      }
    }

    console.log(`🐾 Encontradas ${allRecommendations.length} recomendaciones en ${allPetProfiles.length} perfiles de mascotas`)

    // Llamar a OpenRouter con el contexto completo de recomendaciones
    const llmResponse = await callOpenRouter(query, allRecommendations)
    
    if (!llmResponse) {
      return NextResponse.json({ error: 'Error processing query' }, { status: 500 })
    }

    console.log('🤖 Respuesta del LLM:', llmResponse)

    // Construir filtros de búsqueda basados en la respuesta del LLM
    const searchFilters: any = {}
    
    // Filtrar por características de mascota si están especificadas
    if (llmResponse.petCharacteristics && llmResponse.petCharacteristics.length > 0) {
      const breedFilters = llmResponse.petCharacteristics.filter(char => 
        char.includes('retriever') || char.includes('collie') || char.includes('bulldog') || char.includes('persa') || char.includes('maine coon')
      )
      
      if (breedFilters.length > 0) {
        searchFilters['breed'] = {
          $in: breedFilters.map((breed: string) => new RegExp(breed, 'i'))
        }
      }
      
      // Filtrar por categoría (perro, gato)
      const categoryFilters = llmResponse.petCharacteristics.filter(char => 
        char.includes('perro') || char.includes('gato')
      )
      
      if (categoryFilters.length > 0) {
        searchFilters['category'] = {
          $in: categoryFilters.map((cat: string) => new RegExp(cat, 'i'))
        }
      }
    }

    // Filtrar por tipo de recomendación
    if (llmResponse.recommendationTypes && llmResponse.recommendationTypes.length > 0) {
      searchFilters['recommendations.type'] = {
        $in: llmResponse.recommendationTypes
      }
    }

    // Filtrar por issues/problemas específicos
    if (llmResponse.issues && llmResponse.issues.length > 0) {
      searchFilters['recommendations.tags'] = {
        $in: llmResponse.issues.map((issue: string) => new RegExp(issue, 'i'))
      }
    }

    // Buscar perfiles de mascotas que tengan recomendaciones que coincidan
    const petProfiles = await petsCollection
      .find(searchFilters)
      .limit(20)
      .toArray()

    // Priorizar recomendaciones específicas del LLM
    let matchingRecommendations: any[] = []
    
    // Si el LLM hizo recomendaciones específicas, usarlas primero
    if (llmResponse.specificRecommendations && llmResponse.specificRecommendations.length > 0) {
      console.log('🎯 Usando recomendaciones específicas del LLM:', llmResponse.specificRecommendations)
      
      const specificRecs = allRecommendations.filter(rec => 
        llmResponse.specificRecommendations.includes(rec._id)
      )
      
      matchingRecommendations.push(...specificRecs)
    }
    
    // Luego, buscar recomendaciones adicionales usando los criterios extraídos
    const additionalRecommendations: any[] = []
    
    for (const rec of allRecommendations) {
      // Evitar duplicados con las recomendaciones específicas
      if (llmResponse.specificRecommendations?.includes(rec._id)) {
        continue
      }
      
      let matches = true
      let relevanceScore = 0
      
      // Verificar tipo de recomendación
      if (llmResponse.recommendationTypes && llmResponse.recommendationTypes.length > 0) {
        if (llmResponse.recommendationTypes.includes(rec.type)) {
          relevanceScore += 3
        } else {
          matches = false
        }
      }

      // Verificar issues/problemas específicos
      if (llmResponse.issues && llmResponse.issues.length > 0) {
        const issueMatches = llmResponse.issues.filter((issue: string) =>
          rec.tags?.some((tag: string) =>
            tag.toLowerCase().includes(issue.toLowerCase())
          )
        )
        if (issueMatches.length > 0) {
          relevanceScore += issueMatches.length * 2
        }
      }

      // Verificar características de la mascota
      if (llmResponse.petCharacteristics && llmResponse.petCharacteristics.length > 0) {
        const charMatches = llmResponse.petCharacteristics.filter((char: string) =>
          rec.breed?.toLowerCase().includes(char.toLowerCase()) ||
          rec.category?.toLowerCase().includes(char.toLowerCase())
        )
        if (charMatches.length > 0) {
          relevanceScore += charMatches.length
        }
      }

      if (matches && relevanceScore > 0) {
        additionalRecommendations.push({
          ...rec,
          relevanceScore
        })
      }
    }

    // Ordenar por relevancia y tomar los mejores
    additionalRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
    matchingRecommendations.push(...additionalRecommendations.slice(0, 10))

    // Si no hay coincidencias específicas, mostrar recomendaciones generales
    if (matchingRecommendations.length === 0) {
      console.log('ℹ️ No se encontraron coincidencias específicas, mostrando recomendaciones generales')
      matchingRecommendations = allRecommendations.slice(0, 6)
    }

    const summary = generateSummary(query, llmResponse, matchingRecommendations.length)

    await client.close()

    return NextResponse.json({
      recommendations: matchingRecommendations,
      petVoiceResponse: llmResponse.petVoiceResponse,
      petCharacteristics: llmResponse.petCharacteristics,
      issues: llmResponse.issues,
      recommendationTypes: llmResponse.recommendationTypes,
      summary,
      total: matchingRecommendations.length
    })

  } catch (error) {
    console.error('Error processing pet query:', error)
    return NextResponse.json({ error: 'Error processing query' }, { status: 500 })
  }
}

function generateSummary(query: string, llmResponse: any, totalRecommendations: number): string {
  if (llmResponse.petVoiceResponse?.hasRegisteredPet) {
    const petName = llmResponse.petVoiceResponse.petName || 'tu mascota'
    const issues = llmResponse.issues || []
    
    if (issues.length > 0) {
      return `💬 ${petName} necesita ayuda con: ${issues.join(', ')}. Encontré ${totalRecommendations} recomendaciones personalizadas.`
    } else {
      return `💬 ${petName} está listo para nuevas aventuras. ${totalRecommendations} recomendaciones disponibles.`
    }
  }
  
  const characteristics = llmResponse.petCharacteristics || []
  const types = llmResponse.recommendationTypes || []
  
  if (characteristics.length > 0 && types.length > 0) {
    return `🔍 Buscar recomendaciones de ${types.join(', ')} para ${characteristics.join(', ')}. ${totalRecommendations} resultados encontrados.`
  } else if (characteristics.length > 0) {
    return `🐾 Recomendaciones para ${characteristics.join(', ')}: ${totalRecommendations} opciones disponibles.`
  } else if (types.length > 0) {
    return `📋 Recomendaciones de ${types.join(', ')}: ${totalRecommendations} sugerencias encontradas.`
  }
  
  return `🎯 Recomendaciones de bienestar para tu mascota: ${totalRecommendations} opciones disponibles.`
}

function getDemoResponse(query: string) {
  const lowerQuery = query.toLowerCase()
  
  // Detectar si tiene mascota registrada
  const hasRegisteredPet = lowerQuery.includes('mi ') && (lowerQuery.includes('perro') || lowerQuery.includes('gato') || lowerQuery.includes('mascota'))
  
  // Recomendaciones de demostración
  const demoRecommendations = [
    {
      _id: "demo_001",
      type: "training",
      title: "Entrenamiento básico de obediencia",
      description: "Técnicas fundamentales para enseñar comandos básicos como sentado, quieto y venir.",
      breed: "General",
      category: "Perro",
      tags: ["obediencia", "básico", "comandos"],
      difficulty: "Fácil",
      duration: "15-20 minutos diarios",
      ageRange: "8 semanas+",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=300&fit=crop"
    },
    {
      _id: "demo_002",
      type: "nutrition",
      title: "Alimentación equilibrada para cachorros",
      description: "Guía completa de nutrición para el crecimiento saludable de cachorros.",
      breed: "General",
      category: "Perro",
      tags: ["cachorro", "crecimiento", "nutrición"],
      difficulty: "Fácil",
      duration: "Continuo",
      ageRange: "2-12 meses",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=300&fit=crop"
    },
    {
      _id: "demo_003",
      type: "wellness",
      title: "Rutina de ejercicio diario",
      description: "Plan de actividades físicas adaptado a las necesidades de tu mascota.",
      breed: "General",
      category: "Perro",
      tags: ["ejercicio", "rutina", "salud"],
      difficulty: "Moderado",
      duration: "30-60 minutos",
      ageRange: "6 meses+",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=300&fit=crop"
    }
  ]

  // Filtrar recomendaciones basadas en la consulta
  let filteredRecommendations = demoRecommendations
  
  if (lowerQuery.includes('entren') || lowerQuery.includes('obediencia') || lowerQuery.includes('ladra')) {
    filteredRecommendations = demoRecommendations.filter(r => r.type === 'training')
  } else if (lowerQuery.includes('comida') || lowerQuery.includes('alimenta') || lowerQuery.includes('dieta')) {
    filteredRecommendations = demoRecommendations.filter(r => r.type === 'nutrition')
  } else if (lowerQuery.includes('ejercicio') || lowerQuery.includes('jugar') || lowerQuery.includes('aburrimiento')) {
    filteredRecommendations = demoRecommendations.filter(r => r.type === 'wellness')
  }

  // Generar respuesta de voz si tiene mascota registrada
  let petVoiceResponse = {
    hasRegisteredPet: false,
    petName: '',
    petBreed: '',
    voiceMessage: '',
    emotionalTone: ''
  }

  if (hasRegisteredPet) {
    petVoiceResponse = {
      hasRegisteredPet: true,
      petName: 'tu mascota',
      petBreed: lowerQuery.includes('perro') ? 'perro' : 'gato',
      voiceMessage: "¡Hola humano! 🐾 Veo que buscas formas de ayudarme a ser mejor. ¡Me encanta aprender cosas nuevas contigo!",
      emotionalTone: 'emocionado'
    }

    // Personalizar mensaje según el problema
    if (lowerQuery.includes('ladra')) {
      petVoiceResponse.voiceMessage = "¡Guau! Sé que a veces ladro mucho... es que me emociono. ¿Me ayudas a aprender cuándo estar tranquilo? 🐕"
      petVoiceResponse.emotionalTone = 'juguetón'
    } else if (lowerQuery.includes('aburrimiento') || lowerQuery.includes('aburro')) {
      petVoiceResponse.voiceMessage = "¡Oye! Me aburro cuando no estás. ¿Podríamos hacer juegos nuevos juntos? ¡Prometo no destruir nada! 😅"
      petVoiceResponse.emotionalTone = 'juguetón'
    } else if (lowerQuery.includes('comida') || lowerQuery.includes('peso')) {
      petVoiceResponse.voiceMessage = "Humano... creo que me das demasiadas chuches deliciosas. Ayúdame a estar fuerte y saludable, ¿sí? 🥺"
      petVoiceResponse.emotionalTone = 'preocupado'
    }
  }

  const summary = hasRegisteredPet 
    ? `🧪 Modo Demo - ${petVoiceResponse.petName} necesita tu ayuda. ${filteredRecommendations.length} recomendaciones encontradas.`
    : `🧪 Modo Demo - Recomendaciones de bienestar para mascotas. ${filteredRecommendations.length} sugerencias disponibles.`

  return {
    recommendations: filteredRecommendations,
    petVoiceResponse,
    summary
  }
} 