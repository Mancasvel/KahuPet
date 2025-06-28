import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { callOpenRouter } from '@/lib/openrouter'
import { 
  getConversationHistory, 
  saveConversationExchange,
  ConversationMessage 
} from '@/lib/conversations'

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
    const requestBody = await request.json()
    const { query, userPet, userId, sessionId, conversationHistory } = requestBody

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Modo de retrocompatibilidad: si no hay userId/sessionId pero sí conversationHistory, generar sessionId temporal
    let finalUserId = userId
    let finalSessionId = sessionId

    if (!userId && !sessionId) {
      if (conversationHistory) {
        // Modo compatibilidad: generar sessionId temporal
        finalSessionId = 'temp_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        console.log('🔄 Modo compatibilidad: generando sessionId temporal:', finalSessionId)
      } else {
        return NextResponse.json({ error: 'userId or sessionId is required' }, { status: 400 })
      }
    }

    const conversationId = { userId: finalUserId, sessionId: finalSessionId }
    
    console.log('🔍 Consulta recibida:', query)
    console.log('🐾 Mascota del usuario:', userPet ? `${userPet.nombre} (${userPet.tipo} - ${userPet.raza})` : 'No registrada')
    console.log('👤 ID de conversación:', finalUserId ? `userId: ${finalUserId}` : `sessionId: ${finalSessionId}`)

    // Recuperar historial de conversación desde MongoDB o usar el enviado (retrocompatibilidad)
    let mongoConversationHistory: ConversationMessage[] = []
    let legacyConversationHistory: any[] = []
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Modo compatibilidad: usar historial pasado directamente
      console.log('🔄 Usando historial pasado (modo compatibilidad):', conversationHistory.length, 'mensajes')
      legacyConversationHistory = conversationHistory
    } else {
      // Modo normal: recuperar de MongoDB
      try {
        console.log('📚 Recuperando historial de conversación desde MongoDB...')
        mongoConversationHistory = await getConversationHistory(conversationId)
        console.log('💬 Historial recuperado:', mongoConversationHistory.length, 'mensajes')
        
        // Convertir mensajes de ConversationMessage a formato simple para compatibilidad
        legacyConversationHistory = mongoConversationHistory.map(msg => ({
          type: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      } catch (historyError) {
        console.error('⚠️ Error recuperando historial (continuando sin historial):', historyError)
        legacyConversationHistory = []
      }
    }

    // Si no están configuradas las APIs reales, usar datos de demostración
    if (!process.env.OPENROUTER_API_KEY || !process.env.MONGODB_URI) {
      console.log('⚠️ Usando datos de demostración (APIs no configuradas)')
      const demoResponse = getDemoResponse(query, legacyConversationHistory)
      
      // Guardar conversación demo si MongoDB está disponible
      if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('demo')) {
        try {
          const demoAssistantResponse = JSON.stringify({
            recommendations: demoResponse.recommendations.length,
            petVoiceResponse: demoResponse.petVoiceResponse,
            summary: demoResponse.summary,
            demo: true
          })
          
          await saveConversationExchange(
            conversationId,
            query,
            demoAssistantResponse,
            { userPet, demo: true, timestamp: new Date() }
          )
          console.log('✅ Conversación demo guardada')
        } catch (saveError) {
          console.error('⚠️ Error guardando conversación demo:', saveError)
        }
      }
      
      return NextResponse.json({ ...demoResponse, conversationSaved: true })
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
      const demoResponse = getDemoResponse(query, legacyConversationHistory)
      
      // Guardar conversación demo si MongoDB está disponible
      if (hasValidMongoDB) {
        try {
          const demoAssistantResponse = JSON.stringify({
            recommendations: demoResponse.recommendations.length,
            petVoiceResponse: demoResponse.petVoiceResponse,
            summary: demoResponse.summary,
            demo: true
          })
          
          await saveConversationExchange(
            conversationId,
            query,
            demoAssistantResponse,
            { userPet, demo: true, timestamp: new Date() }
          )
          console.log('✅ Conversación demo guardada')
        } catch (saveError) {
          console.error('⚠️ Error guardando conversación demo:', saveError)
        }
      }
      
      return NextResponse.json({ 
        recommendations: demoResponse.recommendations,
        petVoiceResponse: demoResponse.petVoiceResponse,
        summary: demoResponse.summary,
        total: demoResponse.recommendations.length,
        demo: true,
        conversationSaved: hasValidMongoDB
      })
    }

    // Conectar a MongoDB primero para obtener las recomendaciones disponibles
    if (!client) {
      return NextResponse.json({ error: 'MongoDB client not initialized' }, { status: 500 })
    }
    
    await client.connect()
    const db = client.db('Pawsitive')
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

    // Llamar a OpenRouter con el contexto completo de recomendaciones, la mascota del usuario y el historial
    const llmResponse = await callOpenRouter(query, allRecommendations, userPet, legacyConversationHistory)
    
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

    // NUEVO SISTEMA DE FILTRADO ESTRICTO Y ESPECÍFICO
    let matchingRecommendations: any[] = []
    
    console.log('🎯 Iniciando filtrado estricto con criterios:', {
      petCharacteristics: llmResponse.petCharacteristics,
      issues: llmResponse.issues,
      recommendationTypes: llmResponse.recommendationTypes,
      userPet: userPet ? `${userPet.nombre} (${userPet.tipo} - ${userPet.raza})` : 'Sin mascota'
    })

    // Extraer categoría de animal (perro/gato) de múltiples fuentes
    let targetAnimalType = ''
    
    if (userPet) {
      targetAnimalType = userPet.tipo.toLowerCase() // 'perro' o 'gato'
    } else if (llmResponse.petCharacteristics) {
      const animalTypes = llmResponse.petCharacteristics.filter((char: string) => 
        char.toLowerCase().includes('perro') || char.toLowerCase().includes('gato')
      )
      if (animalTypes.length > 0) {
        targetAnimalType = animalTypes[0].toLowerCase().includes('perro') ? 'perro' : 'gato'
      }
    }

    // Extraer raza específica
    let targetBreed = ''
    if (userPet) {
      targetBreed = userPet.raza.toLowerCase()
    } else if (llmResponse.petCharacteristics) {
      const breeds = llmResponse.petCharacteristics.filter((char: string) => 
        !char.toLowerCase().includes('perro') && 
        !char.toLowerCase().includes('gato') &&
        !char.match(/^\d+\s*(años?|kg|meses?)/) // No números de edad/peso
      )
      if (breeds.length > 0) {
        targetBreed = breeds[0].toLowerCase()
      }
    }

    console.log('🔍 Filtros objetivo:', { targetAnimalType, targetBreed })

    // FASE 1: Recomendaciones específicas del LLM (máxima prioridad)
    if (llmResponse.specificRecommendations && llmResponse.specificRecommendations.length > 0) {
      console.log('✨ Usando recomendaciones específicas del LLM')
      
      const specificRecs = allRecommendations.filter(rec => 
        llmResponse.specificRecommendations.includes(rec._id)
      )
      
      matchingRecommendations.push(...specificRecs)
    }
    
    // FASE 2: Filtrado ESTRICTO por coincidencias múltiples obligatorias
    const strictlyFilteredRecs: any[] = []
    
    for (const rec of allRecommendations) {
      // Evitar duplicados con recomendaciones específicas
      if (llmResponse.specificRecommendations?.includes(rec._id)) {
        continue
      }
      
      let relevanceScore = 0
      let requiredMatches = 0
      let achievedMatches = 0
      
      // REQUISITO 1: Tipo de animal (OBLIGATORIO si se especifica)
      if (targetAnimalType) {
        requiredMatches++
        const animalMatches = rec.category?.toLowerCase() === targetAnimalType ||
                             rec.breed?.toLowerCase().includes(targetAnimalType)
        if (animalMatches) {
          achievedMatches++
          relevanceScore += 10 // Peso alto para tipo de animal
          console.log(`✅ Animal match: ${rec.title} (${rec.category}) matches ${targetAnimalType}`)
        } else {
          console.log(`❌ Animal mismatch: ${rec.title} (${rec.category}) ≠ ${targetAnimalType}`)
          continue // EXCLUIR si no coincide el tipo de animal
        }
      }

      // REQUISITO 2: Tipo de recomendación (OBLIGATORIO si se especifica)
      if (llmResponse.recommendationTypes && llmResponse.recommendationTypes.length > 0) {
        requiredMatches++
        if (llmResponse.recommendationTypes.includes(rec.type)) {
          achievedMatches++
          relevanceScore += 8 // Peso alto para tipo de recomendación
          console.log(`✅ Type match: ${rec.title} (${rec.type})`)
        } else {
          console.log(`❌ Type mismatch: ${rec.title} (${rec.type}) not in [${llmResponse.recommendationTypes.join(', ')}]`)
          continue // EXCLUIR si no coincide el tipo de recomendación
        }
      }

      // REQUISITO 3: Problemas específicos (ALTAMENTE PREFERIDO)
      if (llmResponse.issues && llmResponse.issues.length > 0) {
        let issueMatches = 0
        for (const issue of llmResponse.issues) {
          const hasIssueMatch = rec.tags?.some((tag: string) =>
            tag.toLowerCase().includes(issue.toLowerCase()) ||
            issue.toLowerCase().includes(tag.toLowerCase())
          ) || rec.title?.toLowerCase().includes(issue.toLowerCase()) ||
              rec.description?.toLowerCase().includes(issue.toLowerCase())
              
          if (hasIssueMatch) {
            issueMatches++
            relevanceScore += 6 // Peso medio-alto para problemas específicos
            console.log(`✅ Issue match: ${rec.title} matches issue "${issue}"`)
        }
      }

        if (issueMatches > 0) {
          achievedMatches++
          relevanceScore += issueMatches * 3 // Bonus por múltiples matches de issues
        }
      }

      // REQUISITO 4: Raza específica (BONUS si coincide)
      if (targetBreed) {
        const breedMatches = rec.breed?.toLowerCase().includes(targetBreed) ||
                           targetBreed.includes(rec.breed?.toLowerCase() || '')
        if (breedMatches) {
          relevanceScore += 5 // Bonus por raza específica
          achievedMatches++
          console.log(`✅ Breed bonus: ${rec.title} matches ${targetBreed}`)
        }
      }

      // CRITERIO DE INCLUSIÓN: Debe tener al menos los matches requeridos obligatorios
      const minimumRequired = Math.max(1, requiredMatches)
      if (achievedMatches >= minimumRequired && relevanceScore > 0) {
        strictlyFilteredRecs.push({
          ...rec,
          relevanceScore,
          achievedMatches,
          requiredMatches
        })
        console.log(`📊 Incluido: ${rec.title} - Score: ${relevanceScore}, Matches: ${achievedMatches}/${requiredMatches}`)
      } else {
        console.log(`🚫 Excluido: ${rec.title} - Score: ${relevanceScore}, Matches: ${achievedMatches}/${requiredMatches}`)
      }
    }
    
    // Ordenar por relevancia (score alto = más relevante)
    strictlyFilteredRecs.sort((a, b) => {
      // Priorizar primero por número de matches conseguidos
      if (b.achievedMatches !== a.achievedMatches) {
        return b.achievedMatches - a.achievedMatches
      }
      // Luego por score total
      return b.relevanceScore - a.relevanceScore
    })
    
    // Agregar los mejores resultados filtrados
    matchingRecommendations.push(...strictlyFilteredRecs.slice(0, 8))

    console.log(`📈 Recomendaciones después del filtrado estricto: ${matchingRecommendations.length}`)

    // FASE 3: Si no hay suficientes, relajar criterios pero mantener tipo de animal
    if (matchingRecommendations.length < 3 && targetAnimalType) {
      console.log('🔄 Ampliando búsqueda manteniendo tipo de animal...')
      
      const relaxedRecs = allRecommendations.filter(rec => 
        !matchingRecommendations.some(existing => existing._id === rec._id) &&
        (rec.category?.toLowerCase() === targetAnimalType || rec.breed?.toLowerCase().includes(targetAnimalType))
      ).slice(0, 5)
      
      matchingRecommendations.push(...relaxedRecs)
      console.log(`📈 Después de relajar criterios: ${matchingRecommendations.length}`)
    }

    // FASE 4: Solo como último recurso, mostrar recomendaciones generales
    if (matchingRecommendations.length === 0) {
      console.log('⚠️ Sin coincidencias específicas, usando recomendaciones generales')
      matchingRecommendations = allRecommendations.slice(0, 4)
    }

    const summary = generateSummary(query, llmResponse, matchingRecommendations.length, legacyConversationHistory)

    await client.close()

    // Preparar respuesta del asistente para guardar
    const assistantResponse = JSON.stringify({
      recommendations: matchingRecommendations.length,
      petVoiceResponse: llmResponse.petVoiceResponse,
      summary,
      issues: llmResponse.issues,
      recommendationTypes: llmResponse.recommendationTypes
    })

    // Guardar el intercambio completo en MongoDB (solo si no está en modo compatibilidad)
    let conversationSaved = false
    const isCompatibilityMode = finalSessionId?.startsWith('temp_session_')
    
    if (!isCompatibilityMode) {
      try {
        console.log('💾 Guardando intercambio en MongoDB...')
        await saveConversationExchange(
          conversationId,
          query,
          assistantResponse,
          {
            userPet,
            timestamp: new Date(),
            recommendationsFound: matchingRecommendations.length,
            llmResponse: llmResponse
          }
        )
        console.log('✅ Intercambio guardado exitosamente')
        conversationSaved = true
      } catch (saveError) {
        console.error('⚠️ Error guardando conversación (continuando):', saveError)
        // No fallar la respuesta si el guardado falla
      }
    } else {
      console.log('🔄 Modo compatibilidad: omitiendo guardado de conversación')
    }

    return NextResponse.json({ 
      recommendations: matchingRecommendations,
      petVoiceResponse: llmResponse.petVoiceResponse,
      petCharacteristics: llmResponse.petCharacteristics,
      issues: llmResponse.issues,
      recommendationTypes: llmResponse.recommendationTypes,
      summary,
      total: matchingRecommendations.length,
      conversationSaved: conversationSaved
    })

  } catch (error) {
    console.error('Error processing pet query:', error)
    return NextResponse.json({ error: 'Error processing query' }, { status: 500 })
  }
}

function generateSummary(query: string, llmResponse: any, totalRecommendations: number, conversationHistory?: any[]): string {
  // Detectar si es una conversación continua
  let continuationContext = ''
  if (conversationHistory && conversationHistory.length > 0) {
    continuationContext = 'Continuando nuestra conversación: '
  }
  
  // Si hay mascota registrada, priorizar respuesta personalizada
  if (llmResponse.petVoiceResponse?.hasRegisteredPet) {
    const petName = llmResponse.petVoiceResponse.petName || 'tu mascota'
    const issues = llmResponse.issues || []
    const types = llmResponse.recommendationTypes || []
    
    if (issues.length > 0 && types.length > 0) {
      const typeEmoji = types[0] === 'training' ? '🎓' : types[0] === 'nutrition' ? '🥩' : '🧘'
      return `${continuationContext}${typeEmoji} ${petName} necesita ayuda con ${issues.join(' y ')}: ${totalRecommendations} recomendaciones específicas encontradas.`
    } else if (issues.length > 0) {
      return `${continuationContext}💬 ${petName} necesita ayuda con: ${issues.join(', ')}. ${totalRecommendations} recomendaciones personalizadas.`
    } else if (types.length > 0) {
      const typeNames = types.map((t: string) => t === 'training' ? 'entrenamiento' : t === 'nutrition' ? 'nutrición' : 'bienestar')
      return `${continuationContext}🎯 ${petName} está listo para ${typeNames.join(' y ')}: ${totalRecommendations} recomendaciones disponibles.`
    } else {
      return `${continuationContext}💬 ${petName} está listo para nuevas aventuras. ${totalRecommendations} recomendaciones disponibles.`
    }
  }
  
  // Si no hay mascota registrada, ser específico sobre filtros aplicados
  const characteristics = llmResponse.petCharacteristics || []
  const types = llmResponse.recommendationTypes || []
  const issues = llmResponse.issues || []
  
  // Extraer tipo de animal y raza
  const animalTypes = characteristics.filter((char: string) => 
    char.toLowerCase().includes('perro') || char.toLowerCase().includes('gato')
  )
  const breeds = characteristics.filter((char: string) => 
    !char.toLowerCase().includes('perro') && 
    !char.toLowerCase().includes('gato') &&
    !char.match(/^\d+\s*(años?|kg|meses?)/)
  )
  
  let summaryParts = []
  
  // Agregar tipo de animal
  if (animalTypes.length > 0) {
    const animalEmoji = animalTypes[0].toLowerCase().includes('perro') ? '🐕' : '🐱'
    summaryParts.push(`${animalEmoji} ${animalTypes[0]}`)
}

  // Agregar raza si es específica
  if (breeds.length > 0) {
    summaryParts.push(`raza ${breeds[0]}`)
  }
  
  // Agregar tipo de recomendación con emoji
  if (types.length > 0) {
    const typeEmojis = types.map((t: string) => {
      if (t === 'training') return '🎓 entrenamiento'
      if (t === 'nutrition') return '🥩 nutrición'
      if (t === 'wellness') return '🧘 bienestar'
      return t
    })
    summaryParts.push(typeEmojis.join(' y '))
  }
  
  // Agregar problemas específicos
  if (issues.length > 0) {
    summaryParts.push(`para ${issues.join(' y ')}`)
  }
  
  // Construir resumen final
  if (summaryParts.length > 0) {
    return `🔍 Recomendaciones de ${summaryParts.join(' - ')}: ${totalRecommendations} resultados específicos encontrados.`
  } else {
    return `🎯 Recomendaciones generales de bienestar: ${totalRecommendations} opciones disponibles.`
  }
}

function getDemoResponse(query: string, conversationHistory?: any[]) {
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
    // Analizar historial de conversación para contexto
    let conversationContext = ''
    if (conversationHistory && conversationHistory.length > 0) {
      const previousUserMessages = conversationHistory.filter(msg => msg.type === 'user').map(msg => msg.content.toLowerCase())
      const previousTopics = previousUserMessages.join(' ')
      
      if (previousTopics.includes('ladra') || previousTopics.includes('ladrido')) {
        conversationContext = ' Como seguimiento a lo que hablamos sobre mis ladridos,'
      } else if (previousTopics.includes('comida') || previousTopics.includes('alimenta')) {
        conversationContext = ' Continuando con lo que discutimos sobre mi alimentación,'
      } else if (previousTopics.includes('ejercicio') || previousTopics.includes('juega')) {
        conversationContext = ' En relación a nuestra conversación sobre ejercicio,'
      } else if (conversationHistory.length > 0) {
        conversationContext = ' Como continuación de nuestra conversación,'
      }
    }
    
    petVoiceResponse = {
      hasRegisteredPet: true,
      petName: 'tu mascota',
      petBreed: lowerQuery.includes('perro') ? 'perro' : 'gato',
      voiceMessage: `¡Hola humano!${conversationContext} 🐾 Veo que buscas formas de ayudarme a ser mejor. ¡Me encanta aprender cosas nuevas contigo!`,
      emotionalTone: 'emocionado'
    }

    // Personalizar mensaje según el problema
    if (lowerQuery.includes('ladra')) {
      petVoiceResponse.voiceMessage = `¡Guau!${conversationContext} Sé que a veces ladro mucho... es que me emociono. ¿Me ayudas a aprender cuándo estar tranquilo? 🐕`
      petVoiceResponse.emotionalTone = 'juguetón'
    } else if (lowerQuery.includes('aburrimiento') || lowerQuery.includes('aburro')) {
      petVoiceResponse.voiceMessage = `¡Oye!${conversationContext} Me aburro cuando no estás. ¿Podríamos hacer juegos nuevos juntos? ¡Prometo no destruir nada! 😅`
      petVoiceResponse.emotionalTone = 'juguetón'
    } else if (lowerQuery.includes('comida') || lowerQuery.includes('peso')) {
      petVoiceResponse.voiceMessage = `Humano...${conversationContext} creo que me das demasiadas chuches deliciosas. Ayúdame a estar fuerte y saludable, ¿sí? 🥺`
      petVoiceResponse.emotionalTone = 'preocupado'
    }
  }

  // Generar summary con contexto de conversación
  let continuationPrefix = ''
  if (conversationHistory && conversationHistory.length > 0) {
    continuationPrefix = 'Continuando nuestra conversación: '
  }

  const summary = hasRegisteredPet 
    ? `${continuationPrefix}🧪 Modo Demo - ${petVoiceResponse.petName} necesita tu ayuda. ${filteredRecommendations.length} recomendaciones encontradas.`
    : `${continuationPrefix}🧪 Modo Demo - Recomendaciones de bienestar para mascotas. ${filteredRecommendations.length} sugerencias disponibles.`

  return {
    recommendations: filteredRecommendations,
    petVoiceResponse,
    summary
  }
} 