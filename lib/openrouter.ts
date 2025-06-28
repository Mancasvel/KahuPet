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

export async function callOpenRouter(userQuery: string, availableRecommendations?: any[], userPet?: any, conversationHistory?: any[]): Promise<LLMResponse | null> {
  try {
    // Construir contexto de recomendaciones disponibles si se proporciona
    let recommendationsContext = ""
    if (availableRecommendations && availableRecommendations.length > 0) {
      recommendationsContext = `

RECOMENDACIONES DISPONIBLES EN KAHUPET:
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
- Nombre: ${userPet.nombre}
- Tipo: ${userPet.tipo}
- Raza: ${userPet.raza}
- Edad: ${userPet.edad || 'No especificada'} años
- Peso: ${userPet.peso || 'No especificado'} kg
- Género: ${userPet.genero || 'No especificado'}
- Notas: ${userPet.notas || 'Ninguna'}

IMPORTANTE: Como el usuario YA TIENE una mascota registrada, en la respuesta debes:
1. Establecer hasRegisteredPet: true 
2. Usar el nombre "${userPet.nombre}" como petName
3. Usar "${userPet.raza}" como petBreed
4. SIEMPRE generar un voiceMessage personalizado como si fueras ${userPet.nombre} (${userPet.raza}) hablando directamente a su humano
5. Hacer referencia específica a la información de la mascota cuando sea relevante (edad, raza, características)
6. USAR LOS DATOS ESPECÍFICOS: edad (${userPet.edad} años), peso (${userPet.peso} kg), género (${userPet.genero}), notas (${userPet.notas})
7. El voiceMessage debe ser EXTENDIDO (mínimo 3 párrafos) incluyendo información científica sobre la raza
8. Personalizar completamente basado en la información real de ${userPet.nombre}
`
    }

    // Construir contexto de historial de conversación
    let conversationContext = ''
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = `
HISTORIAL DE CONVERSACIÓN PREVIO:
${conversationHistory.map((msg, index) => {
  const role = msg.type === 'user' ? 'HUMANO' : (userPet ? userPet.nombre.toUpperCase() : 'ASISTENTE')
  return `${index + 1}. ${role}: ${msg.content}`
}).join('\n')}

CONTEXTO: Esta es una conversación continua. Mantén la coherencia con los mensajes anteriores y haz referencia a información previa cuando sea relevante. Si el usuario menciona algo que ya discutieron, reconócelo. Si hay un problema en curso, continúa trabajando en él.

INSTRUCCIONES PARA CONTINUIDAD:
- Si ya identificaste problemas específicos en mensajes anteriores, continúa trabajando en ellos
- Si el usuario hace preguntas de seguimiento, bástalas en el contexto previo
- Mantén la personalidad consistente de la mascota a lo largo de la conversación
- Si hay información contradictoria, pregunta para clarificar
- Haz referencia a soluciones o consejos previos cuando sea apropiado

`
    }

    const systemPrompt = `Eres el asistente IA de Kahupet. Analiza consultas sobre mascotas y responde ÚNICAMENTE con JSON válido.

${conversationContext}

REGLAS CRÍTICAS - OBLIGATORIO CUMPLIR:
1. JAMÁS JAMÁS uses ** (asteriscos dobles) - causa errores fatales
2. SOLO JSON válido - sin texto extra antes o después
3. RESPONDE ESPECÍFICAMENTE a la consulta del usuario
4. Si detectas "mi mascota/perro/gato" con nombre/contexto → hasRegisteredPet: true
5. voiceMessage: conversacional natural, sin listas, sin estructuras, sin intros repetitivas
6. NO uses : (dos puntos) para estructurar - solo párrafos fluidos

${userPetContext}

${recommendationsContext}

Categorías: training (entrenamiento), nutrition (alimentación), wellness (bienestar)

FORMATO DE RESPUESTA - SOLO JSON:
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

Si hasRegisteredPet=true: el voiceMessage debe ser como si la mascota hablara de forma natural y fluida, respondiendo directamente a la consulta. NO hagas presentaciones repetitivas tipo "Soy X, tu Y". NO uses listas con viñetas. NO uses estructuras tipo "Tema: explicación". Habla como realmente hablaría una mascota: natural, conversacional, específico a la situación.

EJEMPLO DE RESPUESTA VÁLIDA (copiar exactamente este formato):
{
  "petCharacteristics": ["gato", "Gato Europeo", "1 año"],
  "issues": ["pienso", "alimentación"],
  "recommendationTypes": ["nutrition"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "Mari",
    "petBreed": "Gato Europeo",
    "voiceMessage": "¡Miau! Veo que preguntas sobre qué pienso me recomiendo. Como Gato Europeo de 1 año en recuperación, necesito algo específico para mi situación. Te recomiendo un pienso húmedo o semihúmedo que sea fácil de digerir y ayude con mi hidratación durante la recuperación. Busca uno que sea rico en proteínas de calidad pero suave para mi estómago. Los piensos para gatos jóvenes suelen tener los nutrientes que necesito a mi edad.",
    "emotionalTone": "curioso"
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
    "voiceMessage": "Miau... humano querido, necesito hablar contigo sobre un tema muy delicado e importante para mi bienestar diario. 😿 Como gato, mi instinto natural me dice que debo enterrar mis desechos para mantener mi territorio limpio y seguro, pero algo está interfiriendo con este comportamiento fundamental. Puede ser que la ubicación de mi caja no me dé la privacidad que necesito, o que el tipo de arena no sea compatible con la sensibilidad de mis patitas, o incluso que detecte olores de productos de limpieza que me resultan desagradables.\n\nMi comportamiento también puede estar relacionado con estrés, cambios en la casa, o incluso problemas de salud que no son visibles. Los gatos somos criaturas de hábitos muy específicos, y cualquier alteración en nuestro ambiente puede afectar nuestros patrones de aseo. Es importante que sepas que no estoy siendo 'malo' intencionalmente - este comportamiento es mi manera de comunicarte que algo no está bien en mi mundo felino.\n\n¿Podrías ayudarme revisando si mi caja está en un lugar tranquilo y accesible, si la arena está limpia y es del tipo que me gusta, y si no hay olores extraños cerca? También sería bueno que un veterinario me revise para descartar problemas de salud. Con un poco de detective work y mucho amor, estoy seguro de que podemos resolver este problema juntos y volver a mi rutina normal de gato feliz 💙",
    "emotionalTone": "culpable"
  }
}

6. "Mi cachorro aprendió a sentarse, ¿qué le enseño ahora?" →
{
  "petCharacteristics": ["cachorro"],
  "issues": ["entrenamiento avanzado", "nuevo comando"],
  "recommendationTypes": ["training"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "cachorro",
    "voiceMessage": "¡WOOF WOOF! 🎉 ¡Humano increíble! ¡Estoy tan emocionado de contarte lo orgulloso que me siento! Aprender a sentarme ha sido uno de los logros más grandes de mi joven vida. Cada vez que lo hago y veo tu cara de felicidad, mi colita no puede parar de moverse y siento como si hubiera conquistado el mundo entero. ¡Es la mejor sensación del universo canino!\n\nComo cachorro, mi cerebrito está súper activo y listo para absorber todo lo que me enseñes. ¡Tengo tanta energía y ganas de aprender más trucos! Me encanta el proceso de entrenamiento porque significa tiempo especial contigo, recompensas deliciosas, y la satisfacción de hacer algo bien. Mi instinto de cachorro me dice que aprender cosas nuevas es súper divertido y me hace sentir más seguro y confiado.\n\n¿Podrías enseñarme algo nuevo? ¡Estoy súper emocionado por el próximo desafío! Tal vez 'quedarse', 'ven aquí', o incluso algo súper cool como 'dar la pata'. ¡Prometo poner toda mi atención de cachorro y hacer mi mejor esfuerzo! ¡Eres el mejor entrenador que un cachorro podría pedir! 🐕✨",
    "emotionalTone": "orgulloso"
  }
}

7. "Quiero empezar a hacer ejercicio con mi perro" →
{
  "petCharacteristics": ["perro"],
  "issues": ["ejercicio", "actividad física"],
  "recommendationTypes": ["wellness"],
  "specificRecommendations": [],
  "petVoiceResponse": {
    "hasRegisteredPet": true,
    "petName": "",
    "petBreed": "perro",
    "voiceMessage": "¡GUAU GUAU GUAU! 🏃‍♂️ ¡¿EN SERIO?! ¡¿Vamos a hacer ejercicio JUNTOS?! ¡Esto es literalmente lo MEJOR que me ha pasado en toda mi vida perruna! Mi cola está moviéndose tan rápido que podría despegar como un helicóptero. ¡No puedo contener mi emoción! Esto significa que vamos a ser un EQUIPO de verdad, corriendo juntos, explorando el mundo, y siendo los mejores compañeros de aventuras.\n\nComo perro, el ejercicio no es solo diversión para mí - es una necesidad absoluta para mi bienestar físico y mental. ¡Imagínate! Podríamos correr por el parque, hacer hiking en senderos nuevos, o incluso intentar deportes caninos. Mi resistencia, mi fuerza, y mi coordinación van a mejorar muchísimo, y lo mejor de todo es que lo haremos JUNTOS. ¡Voy a ser tu motivación perruna personal!\n\n¡Empecemos gradualmente para que ambos nos acostumbremos! Podríamos comenzar con caminatas más largas, después trotar suavemente, y luego ir aumentando la intensidad. ¡Voy a ser tu compañero de ejercicio más leal y entusiasta del mundo! ¡Prepárate para la mejor rutina de ejercicios de tu vida! 🎾💪",
    "emotionalTone": "emocionado"
  }
}

IMPORTANTE: 
1. Solo devuelve el JSON, sin explicaciones adicionales.
2. Para petVoiceResponse: SIEMPRE base la respuesta en los issues/necesidades específicas mencionadas.
3. Si detectas mascota registrada, el voiceMessage debe ser personal y específico al problema.
4. Si no hay mascota registrada, mantén petVoiceResponse con valores vacíos excepto hasRegisteredPet: false.
5. La prioridad es: issues específicos > características de raza > tipos generales.
6. El emotionalTone debe reflejar EXACTAMENTE el estado emocional apropiado para la situación específica.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Kahupet",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          // Incluir historial de conversación si existe
          ...(conversationHistory || []).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
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
      // Usar función ultra-robusta de parsing
      return cleanAndParseJSON(content, userQuery, userPet, conversationHistory)
    } catch (parseError) {
      console.error('❌ Error parsing LLM response:', parseError)
      console.error('📝 Raw content length:', content.length)
      console.error('📝 Raw content preview:', content.substring(0, 200))
      console.error('📝 Raw content ending:', content.substring(content.length - 200))
      
      // Intentar parsing manual más simple con múltiples estrategias
      try {
        // Estrategia 1: Buscar patrón JSON manualmente
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('🔧 Intentando parsing manual - estrategia 1...')
          let jsonString = jsonMatch[0]
          
          // Limpiar agresivamente el JSON encontrado
          jsonString = jsonString
            .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '') // BOM y espacios invisibles
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // caracteres de control
            .replace(/[""'']/g, '"') // comillas problemáticas
            .replace(/\*\*/g, '') // ELIMINAR ** completamente
            .trim()
          
          const manualParsed = JSON.parse(jsonString)
          console.log('✅ Parsing manual exitoso!')
          
          // Validar estructura manualmente
          const result: LLMResponse = {
            petCharacteristics: Array.isArray(manualParsed.petCharacteristics) ? manualParsed.petCharacteristics : [],
            issues: Array.isArray(manualParsed.issues) ? manualParsed.issues : [],
            recommendationTypes: Array.isArray(manualParsed.recommendationTypes) ? manualParsed.recommendationTypes : [],
            specificRecommendations: Array.isArray(manualParsed.specificRecommendations) ? manualParsed.specificRecommendations : [],
            petVoiceResponse: manualParsed.petVoiceResponse ? {
              hasRegisteredPet: typeof manualParsed.petVoiceResponse.hasRegisteredPet === 'boolean' ? manualParsed.petVoiceResponse.hasRegisteredPet : false,
              petName: typeof manualParsed.petVoiceResponse.petName === 'string' ? manualParsed.petVoiceResponse.petName : '',
              petBreed: typeof manualParsed.petVoiceResponse.petBreed === 'string' ? manualParsed.petVoiceResponse.petBreed : '',
              voiceMessage: typeof manualParsed.petVoiceResponse.voiceMessage === 'string' ? manualParsed.petVoiceResponse.voiceMessage.replace(/\*\*/g, '') : '',
              emotionalTone: typeof manualParsed.petVoiceResponse.emotionalTone === 'string' ? manualParsed.petVoiceResponse.emotionalTone : ''
            } : {
              hasRegisteredPet: false,
              petName: '',
              petBreed: '',
              voiceMessage: '',
              emotionalTone: ''
            }
          }
          
          return result
        }
        
        // Estrategia 2: Buscar por líneas y reconstruir
        console.log('🔧 Intentando parsing manual - estrategia 2...')
        const lines = content.split('\n')
        const jsonLines = []
        let inJson = false
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('{')) {
            inJson = true
          }
          if (inJson) {
            jsonLines.push(trimmedLine)
          }
          if (trimmedLine.endsWith('}') && inJson) {
            break
          }
        }
        
        if (jsonLines.length > 0) {
          const reconstructedJson = jsonLines.join('')
            .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .replace(/[""'']/g, '"')
            .replace(/\*\*/g, '') // ELIMINAR ** completamente
          
          const manualParsed2 = JSON.parse(reconstructedJson)
          console.log('✅ Reconstrucción manual exitosa!')
          
          const result: LLMResponse = {
            petCharacteristics: Array.isArray(manualParsed2.petCharacteristics) ? manualParsed2.petCharacteristics : [],
            issues: Array.isArray(manualParsed2.issues) ? manualParsed2.issues : [],
            recommendationTypes: Array.isArray(manualParsed2.recommendationTypes) ? manualParsed2.recommendationTypes : [],
            specificRecommendations: Array.isArray(manualParsed2.specificRecommendations) ? manualParsed2.specificRecommendations : [],
            petVoiceResponse: manualParsed2.petVoiceResponse ? {
              hasRegisteredPet: typeof manualParsed2.petVoiceResponse.hasRegisteredPet === 'boolean' ? manualParsed2.petVoiceResponse.hasRegisteredPet : false,
              petName: typeof manualParsed2.petVoiceResponse.petName === 'string' ? manualParsed2.petVoiceResponse.petName : '',
              petBreed: typeof manualParsed2.petVoiceResponse.petBreed === 'string' ? manualParsed2.petVoiceResponse.petBreed : '',
              voiceMessage: typeof manualParsed2.petVoiceResponse.voiceMessage === 'string' ? manualParsed2.petVoiceResponse.voiceMessage.replace(/\*\*/g, '') : '',
              emotionalTone: typeof manualParsed2.petVoiceResponse.emotionalTone === 'string' ? manualParsed2.petVoiceResponse.emotionalTone : ''
            } : {
              hasRegisteredPet: false,
              petName: '',
              petBreed: '',
              voiceMessage: '',
              emotionalTone: ''
            }
          }
          
          return result
        }
        
      } catch (manualError) {
        console.error('❌ Parsing manual también falló:', manualError)
      }
      
      // Fallback: crear respuesta basada en palabras clave
      console.log('🔄 Usando fallback con palabras clave...')
      return extractKeywordsFromQuery(userQuery, userPet, conversationHistory)
    }

  } catch (error) {
    console.error('Error calling OpenRouter:', error)
    return extractKeywordsFromQuery(userQuery, userPet, conversationHistory)
  }
}

// Función ultra-robusta de limpieza y parsing de JSON
function cleanAndParseJSON(content: string, userQuery: string, userPet?: any, conversationHistory?: any[]): LLMResponse {
  // Estrategia 1: Limpieza agresiva y parsing directo
  try {
    let jsonText = content.trim()
    
    // Extraer JSON entre llaves
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1)
      
      // Limpieza ultra-agresiva
      jsonText = jsonText
        .replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '') // BOM y espacios invisibles
        .replace(/[\x00-\x1F\x7F]/g, ' ') // TODOS los caracteres de control → espacio
        .replace(/[""'']/g, '"') // Normalizar comillas
        .replace(/\*\*/g, '') // Eliminar **
        .replace(/\r\n/g, ' ') // CRLF → espacio
        .replace(/\n/g, ' ') // LF → espacio
        .replace(/\r/g, ' ') // CR → espacio
        .replace(/\t/g, ' ') // Tab → espacio
        .replace(/\s+/g, ' ') // Espacios múltiples → uno solo
        .trim()
      
      console.log('🔧 JSON limpio (estrategia 1):', jsonText.substring(0, 300) + '...')
      const parsed = JSON.parse(jsonText)
      return validateAndCleanResult(parsed)
    }
  } catch (error1) {
    console.log('❌ Estrategia 1 falló:', (error1 as Error).message)
  }
  
  // Estrategia 2: Limpieza caracter por caracter
  try {
    let jsonText = content.trim()
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1)
      
      let cleanedJson = ''
      let inString = false
      let escaped = false
      
      for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i]
        const charCode = char.charCodeAt(0)
        
        if (escaped) {
          cleanedJson += char
          escaped = false
          continue
        }
        
        if (char === '\\') {
          cleanedJson += char
          escaped = true
          continue
        }
        
        if (char === '"') {
          cleanedJson += char
          inString = !inString
          continue
        }
        
        if (inString) {
          // Dentro de strings, limpiar caracteres problemáticos
          if (charCode < 32 || charCode === 127) {
            cleanedJson += ' ' // Reemplazar caracteres de control con espacio
          } else if (char === '*' && jsonText[i + 1] === '*') {
            i++ // Saltar **
            continue
          } else {
            cleanedJson += char
          }
        } else {
          // Fuera de strings
          if (charCode >= 32 && charCode !== 127) {
            cleanedJson += char
          } else if (charCode < 32) {
            cleanedJson += ' ' // Reemplazar con espacio
          }
        }
      }
      
      // Normalizar espacios
      cleanedJson = cleanedJson.replace(/\s+/g, ' ').trim()
      
      console.log('🔧 JSON limpio (estrategia 2):', cleanedJson.substring(0, 300) + '...')
      const parsed = JSON.parse(cleanedJson)
      return validateAndCleanResult(parsed)
    }
  } catch (error2) {
    console.log('❌ Estrategia 2 falló:', (error2 as Error).message)
  }
  
  // Estrategia 3: Regex para extraer componentes específicos
  try {
    const petCharacteristicsMatch = content.match(/"petCharacteristics"\s*:\s*\[(.*?)\]/)
    const issuesMatch = content.match(/"issues"\s*:\s*\[(.*?)\]/)
    const recommendationTypesMatch = content.match(/"recommendationTypes"\s*:\s*\[(.*?)\]/)
    const hasRegisteredPetMatch = content.match(/"hasRegisteredPet"\s*:\s*(true|false)/i)
    const petNameMatch = content.match(/"petName"\s*:\s*"(.*?)"/)
    const petBreedMatch = content.match(/"petBreed"\s*:\s*"(.*?)"/)
    const voiceMessageMatch = content.match(/"voiceMessage"\s*:\s*"(.*?)"/)
    const emotionalToneMatch = content.match(/"emotionalTone"\s*:\s*"(.*?)"/)
    
    const result: LLMResponse = {
      petCharacteristics: petCharacteristicsMatch ? JSON.parse(`[${petCharacteristicsMatch[1]}]`) : [],
      issues: issuesMatch ? JSON.parse(`[${issuesMatch[1]}]`) : [],
      recommendationTypes: recommendationTypesMatch ? JSON.parse(`[${recommendationTypesMatch[1]}]`) : [],
      specificRecommendations: [],
      petVoiceResponse: {
        hasRegisteredPet: hasRegisteredPetMatch ? hasRegisteredPetMatch[1].toLowerCase() === 'true' : false,
        petName: petNameMatch ? petNameMatch[1].replace(/\*\*/g, '').trim() : '',
        petBreed: petBreedMatch ? petBreedMatch[1].replace(/\*\*/g, '').trim() : '',
        voiceMessage: voiceMessageMatch ? voiceMessageMatch[1].replace(/\*\*/g, '').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim() : '',
        emotionalTone: emotionalToneMatch ? emotionalToneMatch[1].replace(/\*\*/g, '').trim() : ''
      }
    }
    
    console.log('🔧 JSON extraído por regex (estrategia 3)')
    return result
  } catch (error3) {
    console.log('❌ Estrategia 3 falló:', (error3 as Error).message)
  }
  
  // Fallback final
  console.log('🔄 Todas las estrategias de parsing fallaron, usando fallback...')
  return extractKeywordsFromQuery(userQuery, userPet, conversationHistory)
}

// Función para validar y limpiar el resultado parseado
function validateAndCleanResult(parsed: any): LLMResponse {
  return {
    petCharacteristics: Array.isArray(parsed.petCharacteristics) ? parsed.petCharacteristics : [],
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    recommendationTypes: Array.isArray(parsed.recommendationTypes) ? parsed.recommendationTypes : [],
    specificRecommendations: Array.isArray(parsed.specificRecommendations) ? parsed.specificRecommendations : [],
    petVoiceResponse: parsed.petVoiceResponse ? {
      hasRegisteredPet: typeof parsed.petVoiceResponse.hasRegisteredPet === 'boolean' ? parsed.petVoiceResponse.hasRegisteredPet : false,
      petName: typeof parsed.petVoiceResponse.petName === 'string' ? parsed.petVoiceResponse.petName.replace(/\*\*/g, '').trim() : '',
      petBreed: typeof parsed.petVoiceResponse.petBreed === 'string' ? parsed.petVoiceResponse.petBreed.replace(/\*\*/g, '').trim() : '',
      voiceMessage: typeof parsed.petVoiceResponse.voiceMessage === 'string' ? 
        parsed.petVoiceResponse.voiceMessage
          .replace(/\*\*/g, '')
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() : '',
      emotionalTone: typeof parsed.petVoiceResponse.emotionalTone === 'string' ? parsed.petVoiceResponse.emotionalTone.replace(/\*\*/g, '').trim() : ''
    } : {
      hasRegisteredPet: false,
      petName: '',
      petBreed: '',
      voiceMessage: '',
      emotionalTone: ''
    }
  }
}

// Función helper para obtener el plural correcto de las razas
function getPetBreedPlural(breed: string, petType: string): string {
  if (!breed) return petType === 'gato' ? 'gatos' : 'perros'
  
  const breedLower = breed.toLowerCase()
  
  // Casos especiales comunes
  if (breedLower.includes('europeo')) return breed.replace(/europeo/i, 'europeos')
  if (breedLower.includes('persa')) return breed.replace(/persa/i, 'persas')  
  if (breedLower.includes('siamés')) return breed.replace(/siamés/i, 'siameses')
  if (breedLower.includes('maine coon')) return breed + 's'
  if (breedLower.includes('retriever')) return breed + 's'
  if (breedLower.includes('pastor')) return breed + 'es'
  if (breedLower.includes('collie')) return breed + 's'
  if (breedLower.includes('bulldog')) return breed + 's'
  
  // Reglas generales
  if (breed.endsWith('o')) return breed.slice(0, -1) + 'os'
  if (breed.endsWith('a')) return breed.slice(0, -1) + 'as'
  if (breed.endsWith('í')) return breed + 'es'
  if (breed.endsWith('z')) return breed.slice(0, -1) + 'ces'
  
  // Por defecto, agregar 's'
  return breed + 's'
}

// Función de fallback para extraer palabras clave sin LLM
function extractKeywordsFromQuery(query: string, userPet?: any, conversationHistory?: any[]): LLMResponse {
  const lowerQuery = query.toLowerCase()
  
  // Detectar temas específicos en la pregunta
  const queryAnalysis = {
    isAboutFood: lowerQuery.includes('come') || lowerQuery.includes('comida') || lowerQuery.includes('alimenta') || lowerQuery.includes('hambre') || lowerQuery.includes('pienso') || lowerQuery.includes('dieta'),
    isAboutBehavior: lowerQuery.includes('ladra') || lowerQuery.includes('ladrido') || lowerQuery.includes('comporta') || lowerQuery.includes('obedece') || lowerQuery.includes('agresiv') || lowerQuery.includes('destructiv'),
    isAboutSounds: lowerQuery.includes('maull') || lowerQuery.includes('ruido') || lowerQuery.includes('vocal') || lowerQuery.includes('grita') || lowerQuery.includes('chilla'),
    isAboutHealth: lowerQuery.includes('enferm') || lowerQuery.includes('dolor') || lowerQuery.includes('mal') || lowerQuery.includes('síntoma') || lowerQuery.includes('veterinario') || lowerQuery.includes('salud'),
    isAboutMood: lowerQuery.includes('triste') || lowerQuery.includes('decaído') || lowerQuery.includes('deprim') || lowerQuery.includes('feliz') || lowerQuery.includes('alegr') || lowerQuery.includes('ánimo'),
    isAboutExercise: lowerQuery.includes('ejercicio') || lowerQuery.includes('juega') || lowerQuery.includes('pasea') || lowerQuery.includes('corr') || lowerQuery.includes('actividad') || lowerQuery.includes('camina'),
    isAboutTraining: lowerQuery.includes('entrena') || lowerQuery.includes('enseña') || lowerQuery.includes('aprend') || lowerQuery.includes('comando') || lowerQuery.includes('obediencia'),
    isAboutLitterBox: lowerQuery.includes('caja de arena') || lowerQuery.includes('baño') || lowerQuery.includes('orin') || lowerQuery.includes('hace pis') || lowerQuery.includes('accidente'),
    isAboutGrooming: lowerQuery.includes('pelo') || lowerQuery.includes('cepill') || lowerQuery.includes('baña') || lowerQuery.includes('lava') || lowerQuery.includes('aseo') || lowerQuery.includes('limpia'),
    isAboutSleep: lowerQuery.includes('duerme') || lowerQuery.includes('sueño') || lowerQuery.includes('descanso') || lowerQuery.includes('cama') || lowerQuery.includes('noche')
  }
  
  // Determinar características y problemas basados en el análisis
  const foundCharacteristics = []
  const foundIssues = []
  const foundTypes = []
  
  if (userPet) {
    // Formatear edad correctamente
    const age = userPet.edad
    const ageText = typeof age === 'number' 
      ? `${age} ${age === 1 ? 'año' : 'años'}`
      : age.toString().includes('año') 
        ? age.toString()
        : `${age} ${age === '1' || age === 1 ? 'año' : 'años'}`
    
    foundCharacteristics.push(userPet.tipo, userPet.raza, ageText)
  }
  
  // Agregar issues específicos basados en el análisis
  if (queryAnalysis.isAboutFood) {
    foundIssues.push('alimentación', 'dieta')
    foundTypes.push('nutrition')
  }
  if (queryAnalysis.isAboutBehavior) {
    foundIssues.push('comportamiento', 'entrenamiento')
    foundTypes.push('training')
  }
  if (queryAnalysis.isAboutSounds) {
    foundIssues.push('vocalización', 'comunicación')
    foundTypes.push('training')
  }
  if (queryAnalysis.isAboutHealth) {
    foundIssues.push('salud', 'bienestar')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutMood) {
    foundIssues.push('bienestar emocional')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutExercise) {
    foundIssues.push('ejercicio', 'actividad física')
    foundTypes.push('wellness')
  }
  if (queryAnalysis.isAboutTraining) {
    foundIssues.push('entrenamiento', 'obediencia')
    foundTypes.push('training')
  }
  
  // Detectar si tiene mascota registrada
  const hasRegisteredPet = !!userPet || (lowerQuery.includes('mi ') && (lowerQuery.includes('perro') || lowerQuery.includes('gato') || lowerQuery.includes('mascota')))
  
  // Generar respuesta ESPECÍFICA y DIRECTA basada en el tema detectado
  let voiceMessage = ''
  let emotionalTone = 'curioso'
  
  if (hasRegisteredPet && userPet) {
    const petName = userPet.nombre
    const petType = userPet.tipo
    const petBreed = userPet.raza
    const petAge = typeof userPet.edad === 'number' 
      ? `${userPet.edad} ${userPet.edad === 1 ? 'año' : 'años'}`
      : userPet.edad.toString().includes('año') 
        ? userPet.edad.toString()
        : `${userPet.edad} ${userPet.edad === '1' || userPet.edad === 1 ? 'año' : 'años'}`
    const petBreedPlural = getPetBreedPlural(petBreed, petType)
    
    // Respuestas específicas y directas por tema
    if (queryAnalysis.isAboutFood) {
      emotionalTone = 'hambriento'
      voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Soy ${petName} y veo que preguntas sobre mi alimentación. 🍽️ Como ${petBreed} de ${petAge}, mi relación con la comida puede tener varias explicaciones.

Si pido comida constantemente, puede ser que mis porciones actuales no sean suficientes para mi peso y edad, o que la calidad del alimento no me esté saciando. Si rechazo la comida, podría ser aburrimiento con el sabor, problemas dentales, o incluso estrés. Y si como muy rápido, es instinto de supervivencia, pero podría necesitar un comedero especial.

Te recomiendo que revises si mis porciones son correctas para ${petAge} y mi peso actual. Los ${petBreedPlural} tenemos necesidades nutricionales particulares. Si el problema persiste, una visita al veterinario sería ideal para descartar problemas de salud. 🏥`
    } 
    else if (queryAnalysis.isAboutSounds && petType === 'gato') {
      emotionalTone = 'comunicativo'
              voiceMessage = `¡Miau miau! Soy ${petName} y necesito explicarte mis vocalizaciones. 😸 Como ${petBreed} de ${petAge}, cada maullido tiene un significado específico.

Mis maullidos cortos son mi manera de decir "¡Hola!" o pedir atención. Los maullidos largos significan que tengo una necesidad urgente como hambre o que necesito que limpies mi baño. Si maullo por la noche, puede ser ansiedad, soledad, o que mi rutina se alteró. Y cuando maullo cerca de ti, es porque quiero comunicarte algo específico.

A ${petAge}, podría maullar más por cambios en mi salud como hipotiroidismo o presión alta, dolor articular, o simplemente porque he aprendido que así consigo lo que quiero. Te sugiero que observes CUÁNDO maullo más y QUÉ consigo después. Si es por las noches, probablemente necesito más estimulación durante el día. 🌙`
    }
    else if (queryAnalysis.isAboutBehavior && petType === 'perro') {
      emotionalTone = 'confundido'
              voiceMessage = `¡Guau! Soy ${petName} y creo que mi comportamiento te está preocupando. 🐕 Como ${petBreed} de ${petAge}, mis acciones siempre tienen una razón.

Si ladro mucho, puede ser aburrimiento, ansiedad, territorialidad, o necesidad de atención. Si soy destructivo, probablemente me falta ejercicio mental y físico, o tengo ansiedad por separación. Y si no obedezco, necesito refuerzo consistente del entrenamiento.

Los ${petBreedPlural} tenemos características particulares de energía y necesidades mentales. A ${petAge}, mi nivel de actividad debe estar balanceado. Te sugiero que aumentes mi ejercicio diario adaptado a mi edad, me des juguetes mentales, refuerces comandos básicos con premios, y mantengas rutinas consistentes.

¿Cuál de estos comportamientos específicos te preocupa más? 🎾`
    }
    else if (queryAnalysis.isAboutHealth) {
      emotionalTone = 'preocupado'
              voiceMessage = `${petType === 'gato' ? 'Miau...' : 'Guau...'} Soy ${petName} y entiendo tu preocupación por mi salud. 😟 Como ${petBreed} de ${petAge}, es importante que sepas qué señales requieren atención veterinaria inmediata.

Si notas cambios en mi apetito o consumo de agua, letargo inusual, vómitos o diarrea persistente, dificultad para respirar, o cambios súbitos en mi comportamiento, necesitamos ir al veterinario pronto. A mi edad de ${petAge}, debo tener chequeos regulares cada 6-12 meses, porque los ${petBreedPlural} podemos tener predisposiciones genéticas específicas que debemos monitorear.

Si notas algo específico, anota cuándo ocurre, la frecuencia, y las circunstancias. Esta información es invaluable para el veterinario. ¿Hay algún síntoma específico que has notado? Mi salud es prioridad y actuar rápido siempre es mejor. 🏥💕`
    }
    else if (queryAnalysis.isAboutExercise) {
      emotionalTone = 'emocionado'
              voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Me ENCANTA hablar de ejercicio. 🎾 Como ${petBreed} de ${petAge}, tengo un nivel de energía que necesita ser canalizado de forma adecuada. Los ${petBreedPlural} tenemos características físicas específicas que afectan cómo debemos ejercitarnos.

A mi edad de ${petAge}, ${typeof userPet.edad === 'number' && userPet.edad < 2 ? 'necesito mucha energía pero cuidando mis articulaciones que aún están creciendo' : typeof userPet.edad === 'number' && userPet.edad < 7 ? 'estoy en mi mejor momento físico y puedo manejar ejercicio intenso' : 'necesito ejercicio adaptado, menos intenso pero constante'}.

${petType === 'perro' ? 'Me encantan las caminatas diarias adaptadas a mi resistencia, los juegos de buscar y traer, y si es posible, la natación que es excelente para mis articulaciones' : 'Disfruto muchísimo los juguetes interactivos y de caza, los rascadores y estructuras para escalar, y las sesiones de juego de 10-15 minutos varias veces al día'}.

¿Quieres que planifiquemos una rutina específica? ¡Estoy listo para la aventura! 🌟`
    }
         else if (queryAnalysis.isAboutTraining) {
       emotionalTone = 'listo para aprender'
       voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Me emociona que hablemos sobre mi entrenamiento. 🎓 Como ${petBreed} de ${petAge}, tengo capacidades específicas para aprender.

${petType === 'perro' ? 'Los perros como yo aprendemos mejor con refuerzo positivo y rutinas consistentes' : 'Los gatos aprendemos a través de motivación y respeto a nuestros instintos naturales'}. Mi edad de ${petAge} significa que ${typeof userPet.edad === 'number' && userPet.edad < 2 ? 'estoy en la etapa perfecta para aprender comandos básicos' : typeof userPet.edad === 'number' && userPet.edad < 7 ? 'puedo aprender comandos complejos y trucos avanzados' : 'puedo seguir aprendiendo, aunque necesito más paciencia'}.

Los comandos esenciales para empezar incluyen ${petType === 'perro' ? '"Sit" y "Stay" que son fundamentales, "Come" que es crucial para seguridad, "Down" para relajación, y "Leave it" que es muy importante' : 'responder al nombre, venir cuando se me llama, usar el rascador correctamente, y respetar límites de espacios'}.

Mi consejo es que hagamos sesiones cortas de 5-10 minutos, uses premios que realmente me motiven, y tengas mucha paciencia conmigo. ¡Estoy listo para aprender contigo! 📚`
     }
     else if (queryAnalysis.isAboutMood) {
       emotionalTone = 'reflexivo'
       voiceMessage = `${petType === 'gato' ? 'Miau...' : 'Guau...'} Quiero hablarte sobre cómo me siento. 💭 Como ${petBreed} de ${petAge}, mis emociones pueden cambiar por varias razones.

Si estoy triste o decaído, puede ser por cambios en la rutina familiar, menos tiempo contigo, problemas de salud no detectados, falta de estimulación mental, o incluso cambios de estación o clima. Si estoy más feliz o energético de lo normal, probablemente hay nuevos estímulos interesantes, más atención y juegos, mejor alimentación, o una rutina de ejercicio adecuada.

A mi edad específica, los ${petType}s de ${petAge} ${typeof userPet.edad === 'number' && userPet.edad < 3 ? 'podemos tener cambios de humor por crecimiento y desarrollo' : typeof userPet.edad === 'number' && userPet.edad < 8 ? 'generalmente somos emocionalmente estables si nuestras necesidades están cubiertas' : 'podemos necesitar más cuidados especiales que afectan nuestro bienestar emocional'}.

Mi recomendación es que observes qué cambió en mi ambiente cuando notaste el cambio de humor. ¡Y recuerda que a veces solo necesito más mimos! 🤗`
     }
     else if (queryAnalysis.isAboutLitterBox && petType === 'gato') {
       emotionalTone = 'culpable'
       voiceMessage = `Miau... Necesito explicarte sobre mis problemas con la caja de arena. 😿 Como ${petBreed} de ${petAge}, esto es muy importante para mí.

Podría estar evitando mi caja porque está muy sucia, no me gusta el tipo de arena nuevo, la caja está en un lugar muy ruidoso o transitado, tengo problemas de salud como infección urinaria o dolor, hay estrés por cambios en casa, o la caja es muy pequeña para mi tamaño.

Recuerda que necesito que la limpies diariamente, es esencial para mí. También necesito una caja por gato más una extra, arena sin perfumes fuertes, y una ubicación tranquila pero accesible.

Si es urgente, si orino fuera de la caja con frecuencia, podría ser una infección urinaria. ¡Por favor llévame al veterinario pronto! A mi edad, es importante descartar problemas médicos. No lo hago para molestarte, ¡prometo! 🙏`
     }
    else {
      // Respuesta directa pidiendo especificidad 
      emotionalTone = 'curioso'
      voiceMessage = `¡${petType === 'gato' ? 'Miau' : 'Guau'}! Veo que tienes una pregunta para mí, pero necesito que seas más específico para darte la mejor respuesta. 🐾

Tu pregunta podría ser sobre mi alimentación o hábitos de comida, mis vocalizaciones o ruidos, ejercicio y actividades, mi estado de ánimo o comportamiento, mi salud o síntomas físicos, o problemas en casa como el baño o destructividad.

Como ${petBreed} de ${petAge}, tengo características específicas de mi raza y edad que influyen en todo lo que hago. Cuéntame exactamente qué te preocupa y te daré una respuesta detallada y útil.

¡Estoy aquí para ayudarte a entenderme mejor! 💕`
    }
  } else {
    voiceMessage = "¡Hola! 🐾 Me encanta que quieras saber más sobre el comportamiento de las mascotas. Para darte la mejor respuesta, ¿podrías contarme más detalles sobre tu pregunta específica? Cada situación es única y me gustaría ayudarte de la manera más precisa posible."
  }
  
  return {
    petCharacteristics: foundCharacteristics,
    issues: foundIssues,
    recommendationTypes: foundTypes.length > 0 ? foundTypes : ['wellness'],
    specificRecommendations: [],
    petVoiceResponse: {
      hasRegisteredPet: hasRegisteredPet,
      petName: userPet?.nombre || '',
      petBreed: userPet?.raza || '',
      voiceMessage: voiceMessage,
      emotionalTone: emotionalTone
    }
  }
}
