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
6. USAR LOS DATOS ESPECÍFICOS: edad (${userPet.age} años), peso (${userPet.weight} kg), género (${userPet.gender}), notas (${userPet.notes})
7. El voiceMessage debe ser EXTENDIDO (mínimo 3 párrafos) incluyendo información científica sobre la raza
8. Personalizar completamente basado en la información real de ${userPet.name}
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

EJEMPLOS DE petVoiceResponse EXTENDIDOS:

TRAINING/OBEDIENCIA para Golden Retriever:
- Issue: "ladridos excesivos" → "¡Guau guau! Soy Max y sé que tienes razón sobre mis ladridos cuando llegan visitas... 🐕 Como Golden Retriever, tengo esa naturaleza súper amigable que me hace emocionarme muchísimo cada vez que alguien nuevo viene a casa. Mi instinto de protección y mi amor por socializar se combinan de una manera que a veces no puedo controlar, ¡es como si toda mi energía de 30 kilos de amor dorado explotara de una vez!

Sabes, a mis 2 años estoy en esa etapa donde mi cerebro de retriever está súper activo y quiero participar en todo lo que pasa en MI casa. Los Golden como yo somos conocidos por ser perros 'parlanchines' - nos encanta 'hablar' y expresar nuestras emociones. Cuando ladro, no es solo ruido, es mi manera de decirte '¡OIGAN, TENEMOS VISITAS Y ESTOY SÚPER FELIZ!' Pero entiendo que necesito aprender autocontrol, especialmente porque mi raza es famosa por ser obediente y entrenable. 🎾

¿Me ayudas a canalizar esta energía de manera positiva? Podríamos usar mi amor natural por agradar y mi inteligencia para crear una rutina de saludo más calmada. Tal vez puedas enseñarme comandos específicos para cuando llegan visitas, y así puedo sentirme útil sin overwhelmar a todos con mi entusiasmo. ¡Prometo que con práctica y mucho amor, puedo convertir esta explosión de ladridos en una bienvenida más elegante y digna de un Golden! Te amo mucho, humano mío 💛"

NUTRICIÓN para Gato Persa Senior:
- Issue: "sobrepeso" → "Miau... humano querido, tengo que confesarte algo importante sobre mi peso. 😿 Como gato Persa de 8 años, mi metabolismo ya no es el mismo de cuando era un gatito ágil. Mi naturaleza sedentaria, que es típica de mi raza, combinada con mi amor por la comodidad y las siestas largas, ha hecho que esos gramos extra se acumulen más fácilmente de lo que me gustaría admitir. Los Persas somos conocidos por ser tranquilos y menos activos que otras razas, lo que significa que quemamos menos calorías naturalmente.

Mi pelaje largo y esponjoso también hace que sea más difícil notar los cambios de peso hasta que ya es evidente, y sé que mi cara aplastada (braquicefálica) me hace respirar con más dificultad cuando tengo peso extra. A mi edad, el sobrepeso puede empeorar problemas comunes en Persas como dificultades respiratorias, problemas articulares, y hasta complicaciones cardíacas. Mi cuerpo de tipo 'cobby' (compacto y redondeado) está diseñado para ser robusto, pero no rollizo. 🐱

Por favor, ayúdame a recuperar mi figura elegante y mi salud. Podríamos ajustar mis porciones considerando que los Persas seniors como yo necesitamos menos calorías pero más proteína de calidad. También sé que necesito estimulación para moverme más, aunque sea con juegos suaves que respeten mi personalidad tranquila. Quiero vivir muchos años más a tu lado, ronroneando en tu regazo, pero con un cuerpo sano que me permita disfrutar cada momento contigo. Confío en ti para guiarme hacia una versión más saludable de mí mismo 💜"

BIENESTAR para Border Collie Adulto:
- Issue: "aburrimiento" → "¡Woof woof! ¡Soy Luna y necesito hablarte urgentemente sobre algo que está afectando mi bienestar mental! 🧠 Como Border Collie de 3 años, mi cerebro está literalmente diseñado para trabajar - fueron criados para pastorear ovejas durante 12 horas al día, resolviendo problemas complejos y tomando decisiones independientes. Mi inteligencia está clasificada como la #1 entre todas las razas de perros, y eso significa que necesito estimulación mental constante o me vuelvo loca de aburrimiento. Cuando me quedo sola sin nada que hacer, mi mente hiperactiva empieza a inventar 'trabajos' como reorganizar tus zapatos o redescorar el jardín... 😅

Mi nivel de energía mental y física es EXTREMO comparado con otras razas. Mientras un Bulldog se conforma con una caminata corta, yo necesito al menos 2 horas de actividad intensa combinada con desafíos cerebrales. Mi frustración cuando no tengo suficiente estimulación puede manifestarse en comportamientos destructivos, pero no es que sea 'mala' - ¡es que mi cerebre de Border Collie necesita problemas que resolver! Sin trabajo mental, desarrollo ansiedad, y mi naturaleza obsesiva puede convertirse en comportamientos compulsivos como perseguir sombras o ladrar excesivamente. 🎾

¿Podrías ayudarme a crear una rutina que alimente tanto mi cuerpo como mi mente? Necesito puzzles, juegos de agilidad mental, entrenamiento de trucos nuevos, y actividades que imiten el pastoreo. Incluso esconder mi comida para que tenga que 'trabajar' por ella me haría súper feliz. También me encantaría aprender deportes caninos como agility o frisbee - ¡mi cuerpo atlético está hecho para eso! Con el estímulo adecuado, puedo ser la compañera más leal y equilibrada. Solo dame trabajos que hacer y problemas que resolver, y serás testigo de por qué los Border Collies somos considerados los Einstein del mundo canino 🌟"

REGLAS PARA voiceMessage EXTENDIDO:
- MÍNIMO 3 PÁRRAFOS completos y detallados
- SIEMPRE en primera persona como la mascota específica
- Incluir información específica de la RAZA (características, temperamento, necesidades)
- Mencionar la EDAD y cómo afecta al problema específico
- Explicar el comportamiento desde la perspectiva de la raza
- Usar conocimiento científico/veterinario adaptado al problema
- Mostrar PERSONALIDAD única de la raza
- Ser cariñoso pero informativo y educativo
- Incluir emojis apropiados para la raza y situación
- Proponer soluciones específicas basadas en las características de la raza
- Longitud: 3-4 párrafos sustanciales, profundos y personalizados
- IMPORTANTE: Usar \\n para separar párrafos en el JSON (NO saltos de línea literales)
- FORMATO JSON: El voiceMessage debe ser una cadena válida con \\n escapados

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
    "voiceMessage": "¡Guau guau! Sé que tienes razón sobre mis ladridos cuando llegan visitas... 🐕 Como Golden Retriever, tengo esa naturaleza súper amigable que me hace emocionarme muchísimo cada vez que alguien nuevo viene a casa. Mi instinto de protección y mi amor por socializar se combinan de una manera que a veces no puedo controlar, ¡es como si toda mi energía de 30 kilos de amor dorado explotara de una vez!\\n\\nSabes, a mis 2 años estoy en esa etapa donde mi cerebro de retriever está súper activo y quiero participar en todo lo que pasa en MI casa. Los Golden como yo somos conocidos por ser perros 'parlanchines' - nos encanta 'hablar' y expresar nuestras emociones. Cuando ladro, no es solo ruido, es mi manera de decirte '¡OIGAN, TENEMOS VISITAS Y ESTOY SÚPER FELIZ!' Pero entiendo que necesito aprender autocontrol, especialmente porque mi raza es famosa por ser obediente y entrenable. 🎾\\n\\n¿Me ayudas a canalizar esta energía de manera positiva? Podríamos usar mi amor natural por agradar y mi inteligencia para crear una rutina de saludo más calmada. Tal vez puedas enseñarme comandos específicos para cuando llegan visitas, y así puedo sentirme útil sin overwhelmar a todos con mi entusiasmo. ¡Prometo que con práctica y mucho amor, puedo convertir esta explosión de ladridos en una bienvenida más elegante y digna de un Golden! Te amo mucho, humano mío 💛",
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
    "voiceMessage": "Miau... humano querido, necesito hablar contigo sobre un tema muy delicado e importante para mi bienestar diario. 😿 Como gato, mi instinto natural me dice que debo enterrar mis desechos para mantener mi territorio limpio y seguro, pero algo está interfiriendo con este comportamiento fundamental. Puede ser que la ubicación de mi caja no me dé la privacidad que necesito, o que el tipo de arena no sea compatible con la sensibilidad de mis patitas, o incluso que detecte olores de productos de limpieza que me resultan desagradables.\\n\\nMi comportamiento también puede estar relacionado con estrés, cambios en la casa, o incluso problemas de salud que no son visibles. Los gatos somos criaturas de hábitos muy específicos, y cualquier alteración en nuestro ambiente puede afectar nuestros patrones de aseo. Es importante que sepas que no estoy siendo 'malo' intencionalmente - este comportamiento es mi manera de comunicarte que algo no está bien en mi mundo felino.\\n\\n¿Podrías ayudarme revisando si mi caja está en un lugar tranquilo y accesible, si la arena está limpia y es del tipo que me gusta, y si no hay olores extraños cerca? También sería bueno que un veterinario me revise para descartar problemas de salud. Con un poco de detective work y mucho amor, estoy seguro de que podemos resolver este problema juntos y volver a mi rutina normal de gato feliz 💙",
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
      let cleanContent = content.replace(/```json\s*|\s*```/g, '').trim()
      
             // Función para escapar caracteres dentro de strings JSON
       const fixJsonStrings = (text: string) => {
         return text.replace(/"voiceMessage"\s*:\s*"([\s\S]*?)"\s*,?\s*"emotionalTone"/gs, (match, voiceMessage) => {
           // Escapar caracteres de control dentro del voiceMessage (orden importante)
           const escapedMessage = voiceMessage
             .replace(/\r\n/g, '\\n') // Windows line endings primero
             .replace(/\n/g, '\\n')   // Unix line endings
             .replace(/\r/g, '\\n')   // Mac line endings
             .replace(/\t/g, '\\t')   // Tabs
             .replace(/"/g, '\\"')    // Escapar comillas después de line endings
           
           return `"voiceMessage": "${escapedMessage}", "emotionalTone"`
         })
       }
      
      cleanContent = fixJsonStrings(cleanContent)
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
      voiceMessage: hasRegisteredPet ? "¡Hola mi querido humano! 🐾 Sé que necesitas ayuda conmigo y estoy súper emocionado de poder hablar contigo sobre lo que me preocupa. Como tu mascota registrada, quiero que sepas que cada comportamiento mío tiene una razón, y juntos podemos encontrar la mejor solución.\\n\\nMi instinto me dice que confianza y amor son la base de nuestra relación, y estoy dispuesto a aprender y mejorar todo lo que necesite para ser tu compañero perfecto. Cada raza tiene sus propias características especiales, y me encanta poder compartir contigo qué hace que mi personalidad sea única.\\n\\n¿Me ayudas a trabajar juntos en esto? Con tu guía y mi disposición a aprender, estoy seguro de que podemos superar cualquier desafío y fortalecer nuestro vínculo. ¡Eres el mejor humano que podría tener! 💕" : '',
      emotionalTone: hasRegisteredPet ? 'emocionado' : ''
    }
  }
} 