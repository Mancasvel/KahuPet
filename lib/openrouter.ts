interface LLMResponse {
  petCharacteristics: string[]
  issues: string[]
  recommendationTypes: string[]
  specificRecommendations: string[]
  petVoiceResponse?: {
    hasRegisteredPet: boolean
    petName?: string
    petBreed?: string
    voiceMessage: string
    emotionalTone: string
  }
}

export async function callOpenRouter(userQuery: string, availableRecommendations?: any[], userPet?: any): Promise<LLMResponse | null> {
  try {
    // Construir contexto de recomendaciones disponibles si se proporciona
    let recommendationsContext = ""
    if (availableRecommendations && availableRecommendations.length > 0) {
      recommendationsContext = `

RECOMENDACIONES DISPONIBLES EN PAWSITIVE:
${availableRecommendations.map(rec => `
- ${rec.title} (${rec.breed || 'Genérico'} - ${rec.type})
  Dificultad: ${rec.difficulty}
  Duración: ${rec.duration}
  Edad recomendada: ${rec.ageRange}
  Tags: ${rec.tags?.join(', ') || 'No especificados'}
  Descripción: ${rec.description || 'Sin descripción'}
  ID: ${rec._id}
`).join('')}
`
    }

    // Construir contexto de la mascota del usuario si está disponible
    let userPetContext = ""
    if (userPet) {
      userPetContext = `

MASCOTA REGISTRADA DEL USUARIO:
- Nombre: ${userPet.name}
- Tipo: ${userPet.type}
- Raza: ${userPet.breed}
- Edad: ${userPet.age || 'No especificada'} años
- Peso: ${userPet.weight || 'No especificado'} kg
- Género: ${userPet.gender || 'No especificado'}
- Notas: ${userPet.notes || 'Ninguna'}

IMPORTANTE: Como el usuario YA TIENE una mascota registrada, en la respuesta debes:
1. Establecer hasRegisteredPet: true 
2. Usar el nombre "${userPet.name}" como petName
3. Usar "${userPet.breed}" como petBreed
4. SIEMPRE generar un voiceMessage personalizado como si fueras ${userPet.name} (${userPet.breed}) hablando directamente a su humano
5. Hacer referencia específica a la información de la mascota cuando sea relevante (edad, raza, características)
`
    }

    const systemPrompt = `Eres el asistente IA de Pawsitive, una aplicación especializada en bienestar de mascotas que ayuda con entrenamiento, nutrición y vida saludable.

Tu trabajo es:
1. Analizar consultas sobre mascotas para entender qué necesitan
2. Detectar si el usuario ya tiene una mascota registrada para responder como la mascota
3. Recomendar actividades/cuidados específicos si tienes información disponible
4. Extraer criterios de búsqueda para encontrar más recomendaciones relevantes

ÁREAS DE ESPECIALIZACIÓN:
🐾 ENTRENAMIENTO: Obediencia, socialización, corrección de comportamientos, trucos
🥩 NUTRICIÓN: Alimentación por raza/edad, control de peso, alergias, suplementos  
🧘 BIENESTAR: Ejercicio, estimulación mental, cuidado del pelaje, salud preventiva

Debes devolver ÚNICAMENTE un JSON válido con esta estructura:
{
  "petCharacteristics": [],
  "issues": [],
  "recommendationTypes": [],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": false,
    "petName": "",
    "petBreed": "",
    "voiceMessage": "",
    "emotionalTone": ""
  }
}

Donde:
- petCharacteristics: características de la mascota mencionadas (ej: "golden retriever", "cachorro", "2 años", "muy activo")
- issues: problemas o necesidades específicas (ej: "ladridos excesivos", "sobrepeso", "ansiedad", "aburrimiento")  
- recommendationTypes: tipos de recomendaciones necesarias (ej: "training", "nutrition", "wellness")
- specificRecommendations: IDs de recomendaciones específicas que recomendarías (solo si tienes información disponible)
- petVoiceResponse: SOLO si detectas que ya tienen mascota registrada:
  - hasRegisteredPet: true si mencionan "mi perro", "mi gato", etc. con contexto de tener mascota
  - petName: nombre de la mascota si se menciona
  - petBreed: raza si se especifica o se puede inferir
  - voiceMessage: respuesta como si fueras la mascota hablando con cariño a su humano
  - emotionalTone: tono emocional ("cariñoso", "juguetón", "preocupado", "emocionado")

${userPetContext}

${recommendationsContext}

DETECCIÓN DE MASCOTA REGISTRADA:
- Si mencionan "mi perro/gato/mascota" + nombre o características específicas → hasRegisteredPet: true
- Si hablan en general o buscan información → hasRegisteredPet: false
- Si hasRegisteredPet es true, SIEMPRE genera voiceMessage como la mascota

LÓGICA DE RECOMENDACIONES:
1. PRIORIDAD: issues específicos > características de la mascota > tipos generales
2. Si mencionan problemas específicos: buscar recomendaciones que los aborden
3. Si mencionan raza: priorizar recomendaciones específicas para esa raza
4. Si mencionan edad: filtrar por rango de edad apropiado
5. SIEMPRE seleccionar recomendaciones relevantes si están disponibles

EJEMPLOS DE petVoiceResponse:

TRAINING/OBEDIENCIA:
- Issue: "ladridos excesivos" → "¡Guau! Sé que a veces ladro mucho cuando llegan visitas... es que me emociono mucho. ¿Me ayudas a aprender cuándo estar calmadito? ¡Prometo ser un buen perro! 🐕"

NUTRICIÓN:
- Issue: "sobrepeso" → "Oye humano... creo que me estás dando demasiadas chuches deliciosas. Sé que me amas, pero necesito estar fuerte y saludable para jugar contigo más tiempo. ¿Me ayudas con mi dieta? 🥺"

BIENESTAR/ABURRIMIENTO:
- Issue: "aburrimiento" → "¡Oye! Me aburro mucho cuando te vas. Mi mente de border collie necesita trabajar, ¿sabes? ¿Podríamos hacer juegos nuevos cuando vuelvas? ¡Prometo no destruir tus zapatos! 😅"

CARIÑOSO/GENERAL:
- General: "¿Te parece si probamos juegos nuevos cuando llegues? Me encanta cuando juegas conmigo, es mi momento favorito del día. Te amo mucho, humano mío 💕"

REGLAS PARA voiceMessage:
- SIEMPRE en primera persona como la mascota
- Mencionar el issue específico si se identifica
- Ser cariñoso y emocional 
- Usar emojis apropiados
- Reflejar la personalidad típica de la raza si se conoce
- Longitud: 1-2 oraciones, directa pero cálida

REGLA CLAVE: Si hasRegisteredPet es true, SIEMPRE generar voiceMessage. Si es false, dejar voiceMessage vacío.

Ejemplos:

1. "Mi golden retriever de 2 años no deja de ladrar cuando llegan visitas" → 
{
  "petCharacteristics": ["golden retriever", "2 años"],
  "issues": ["ladridos excesivos", "visitas"],
  "recommendationTypes": ["training"],
  "specificRecommendations": ["rec_001"],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "golden retriever", 
    "voiceMessage": "¡Guau! Sé que a veces ladro mucho cuando llegan visitas... es que me emociono mucho. ¿Me ayudas a aprender cuándo estar calmadito?",
    "emotionalTone": "juguetón"
  }
}

2. "¿Qué ejercicio necesita un border collie?" →
{
  "petCharacteristics": ["border collie"],
  "issues": ["ejercicio"],
  "recommendationTypes": ["wellness", "training"],
  "specificRecommendations": ["rec_004", "rec_005"],
  "petVoiceResponse": {
    "hasRegisteredPet": false,
    "petName": "",
    "petBreed": "",
    "voiceMessage": "",
    "emotionalTone": ""
  }
}

3. "Mi gato Max no usa la caja de arena" →
{
  "petCharacteristics": ["gato"],
  "issues": ["caja de arena", "problemas de aseo"],
  "recommendationTypes": ["training", "wellness"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "Max",
    "petBreed": "gato",
    "voiceMessage": "Miau... humano, tengo un problemita con mi baño. A veces el arenero no me gusta tanto... ¿me ayudas a solucionarlo? 😿",
    "emotionalTone": "preocupado"
  }
}

IMPORTANTE: 
1. Solo devuelve el JSON, sin explicaciones adicionales.
2. Para petVoiceResponse: SIEMPRE base la respuesta en los issues/necesidades específicas mencionadas.
3. Si detectas mascota registrada, el voiceMessage debe ser personal y específico al problema.
4. Si no hay mascota registrada, mantén petVoiceResponse con valores vacíos excepto hasRegisteredPet: false.
5. La prioridad es: issues específicos > características de raza > tipos generales.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Pawsitive",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userQuery
          }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenRouter response')
      return null
    }

    const content = data.choices[0].message.content
    
    try {
      // Limpiar el contenido para extraer solo el JSON
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim()
      const parsed = JSON.parse(cleanContent)
      
      // Validar estructura
      const result: LLMResponse = {
        petCharacteristics: Array.isArray(parsed.petCharacteristics) ? parsed.petCharacteristics : [],
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        recommendationTypes: Array.isArray(parsed.recommendationTypes) ? parsed.recommendationTypes : [],
        specificRecommendations: Array.isArray(parsed.specificRecommendations) ? parsed.specificRecommendations : [],
        petVoiceResponse: parsed.petVoiceResponse ? {
          hasRegisteredPet: typeof parsed.petVoiceResponse.hasRegisteredPet === 'boolean' ? parsed.petVoiceResponse.hasRegisteredPet : false,
          petName: typeof parsed.petVoiceResponse.petName === 'string' ? parsed.petVoiceResponse.petName : '',
          petBreed: typeof parsed.petVoiceResponse.petBreed === 'string' ? parsed.petVoiceResponse.petBreed : '',
          voiceMessage: typeof parsed.petVoiceResponse.voiceMessage === 'string' ? parsed.petVoiceResponse.voiceMessage : '',
          emotionalTone: typeof parsed.petVoiceResponse.emotionalTone === 'string' ? parsed.petVoiceResponse.emotionalTone : ''
        } : {
          hasRegisteredPet: false,
          petName: '',
          petBreed: '',
          voiceMessage: '',
          emotionalTone: ''
        }
      }
      
      return result
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError)
      console.error('Raw content:', content)
      
      // Fallback: crear respuesta basada en palabras clave
      return extractKeywordsFromQuery(userQuery)
    }

  } catch (error) {
    console.error('Error calling OpenRouter:', error)
    return null
  }
}

// Función de fallback para extraer palabras clave sin LLM
function extractKeywordsFromQuery(query: string): LLMResponse {
  const lowerQuery = query.toLowerCase()
  
  const commonPetCharacteristics = ['perro', 'gato', 'cachorro', 'gatito', 'adulto', 'senior', 'golden retriever', 'border collie', 'bulldog francés', 'persa', 'maine coon']
  const commonIssues = ['ladridos', 'ansiedad', 'sobrepeso', 'aburrimiento', 'agresividad', 'destructivo', 'caja de arena', 'pelo', 'alergias']
  const commonTypes = ['training', 'nutrition', 'wellness']
  
  const foundCharacteristics = commonPetCharacteristics.filter(char => 
    lowerQuery.includes(char.toLowerCase())
  )
  
  const foundIssues = commonIssues.filter(issue => 
    lowerQuery.includes(issue.toLowerCase())
  )
  
  const foundTypes = commonTypes.filter(type => {
    if (type === 'training') return lowerQuery.includes('entrenar') || lowerQuery.includes('obediencia') || lowerQuery.includes('comportamiento')
    if (type === 'nutrition') return lowerQuery.includes('comida') || lowerQuery.includes('alimentar') || lowerQuery.includes('dieta')
    if (type === 'wellness') return lowerQuery.includes('ejercicio') || lowerQuery.includes('jugar') || lowerQuery.includes('salud')
    return false
  })
  
  // Detectar si tiene mascota registrada basado en pronombres posesivos
  const hasRegisteredPet = lowerQuery.includes('mi ') && (lowerQuery.includes('perro') || lowerQuery.includes('gato') || lowerQuery.includes('mascota'))
  
  return {
    petCharacteristics: foundCharacteristics,
    issues: foundIssues,
    recommendationTypes: foundTypes.length > 0 ? foundTypes : ['training'],
    specificRecommendations: [],
    petVoiceResponse: {
      hasRegisteredPet,
      petName: '',
      petBreed: foundCharacteristics.find(char => char.includes('retriever') || char.includes('collie') || char.includes('bulldog') || char.includes('persa') || char.includes('maine')) || '',
      voiceMessage: hasRegisteredPet ? "¡Hola humano! Detecté que necesitas ayuda conmigo. ¡Estoy listo para aprender y ser la mejor mascota para ti! 🐾" : '',
      emotionalTone: hasRegisteredPet ? 'emocionado' : ''
    }
  }
} 