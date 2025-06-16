interface LLMResponse {
  ingredientes: string[]
  restricciones: string[]
  categorias: string[]
  recomendaciones: string[]
  groupSuggestions?: {
    people: number
    dishIds: string[]
    explanation: string
    funnyResponse: string
  }
}

export async function callOpenRouter(userQuery: string, availableDishes?: any[]): Promise<LLMResponse | null> {
  try {
    // Construir contexto de platos disponibles si se proporciona
    let dishesContext = ""
    if (availableDishes && availableDishes.length > 0) {
      dishesContext = `

PLATOS DISPONIBLES EN NUESTROS RESTAURANTES:
${availableDishes.map(dish => `
- ${dish.name} (${dish.restaurant?.name || 'Restaurante desconocido'})
  Precio: €${dish.price}
  Ingredientes: ${dish.ingredients?.join(', ') || 'No especificados'}
  Tags: ${dish.tags?.join(', ') || 'No especificados'}
  Descripción: ${dish.description || 'Sin descripción'}
`).join('')}
`
    }

    const systemPrompt = `Eres Komi, un asistente de restaurantes que ayuda a encontrar platos perfectos para cada usuario.

Tu trabajo es:
1. Analizar la consulta del usuario para entender qué busca
2. Detectar si menciona número de personas para sugerir menús para grupos
3. Si tienes información de platos disponibles, recomendar los IDs de los platos más relevantes
4. Extraer criterios de búsqueda para encontrar más opciones

Debes devolver ÚNICAMENTE un JSON válido con esta estructura:
{
  "ingredientes": [],
  "restricciones": [],
  "categorias": [],
  "recomendaciones": [],
  "groupSuggestions": {
    "people": 0,
    "dishIds": [],
    "explanation": "",
    "funnyResponse": ""
  }
}

Donde:
- ingredientes: ingredientes específicos mencionados (ej: "arroz", "pollo", "tomate")
- restricciones: restricciones dietarias o preferencias (ej: "vegano", "sin gluten", "sin picante", "rápido", "económico", "barato", "premium")
- categorias: tipos de comida o cocina (ej: "española", "italiana", "japonesa", "india", "asiática", "tradicional", "casera")
- recomendaciones: IDs de platos específicos que recomendarías basado en la consulta (solo si tienes información de platos disponibles)
- groupSuggestions: SOLO si detectas mención de personas:
  - people: número de personas mencionado
  - dishIds: IDs de platos específicos que cumplan las restricciones/preferencias mencionadas (seleccionar tantos platos como personas o un máximo de 4)
  - explanation: explicación técnica basada en las restricciones reales (precio, tipo de cocina, preferencias)
  - funnyResponse: respuesta contextual que refleje las restricciones/preferencias principales de la búsqueda, no solo el tipo de cocina

${dishesContext}

DETECCIÓN DE GRUPOS Y SITUACIONES: 
- Si menciona número de personas: "somos X", "para X personas", "X amigos", "pareja", "familia"
- Si NO menciona personas específicas, INFERIR del contexto:
  - "ganado la champions", "celebración" → asumir grupo de 4 personas (celebración)
  - "ingeniero", "trabajo", "reunión" → asumir 2-3 personas (trabajo)
  - "romántico", "cita" → asumir 2 personas
  - "solo", "yo", "para mí" → asumir 1 persona
  - "familia" → asumir 4 personas
  - Si no hay contexto claro → asumir 2 personas por defecto

LÓGICA DE SELECCIÓN DE PLATOS (SIEMPRE GENERAR ALGO):
1. PRIORIDAD: restricciones (barato, vegano, rápido) > categorías (italiana, japonesa) > ingredientes
2. Si menciona restricciones específicas: buscar platos que las cumplan
3. Si menciona situación especial (celebración, trabajo, cita): adaptar la selección
4. Si NO hay restricciones claras: seleccionar platos populares/variados
5. SIEMPRE seleccionar número de platos = número de personas inferido
6. IMPORTANTE: Todos los dishIds deben ser de platos que pertenezcan al mismo restaurante
7. funnyResponse debe ser SIEMPRE contextual y divertida, incluso para consultas vagas

REGLAS PARA funnyResponse:
- Debe ser contextual y relevante a la búsqueda específica del usuario
- Priorizar restricciones/preferencias sobre tipo de cocina
- Mencionar el número de personas de forma natural
- Ser entusiasta y divertida

EJEMPLOS CONTEXTUALES DE funnyResponse (SIEMPRE RESPONDER):
- Restricción de PRECIO: "somos 3 y queremos barato" → "¡Perfecto! 3 deliciosos platos económicos que no romperán el banco 💰✨"
- TIPO DE COCINA: "somos 4 y queremos comida italiana" → "¡Mamma mia! La famiglia italiana de 4 está servida 🍝👨‍👩‍👧‍👦"
- RESTRICCIÓN DIETARIA: "vegano para 2 personas" → "¡Green power! Menú vegano delicioso para 2 🌱💚"
- CELEBRACIÓN: "hemos ganado la champions" → "¡CAMPEONES! Menú de celebración digno de los ganadores 🏆🎉"
- TRABAJO/PROFESIONAL: "soy ingeniero de software" → "¡Código y comida perfecta! Menú para programadores que saben de buen sabor 💻🍽️"
- ROMÁNTICO: "algo romántico" → "¡Amor a primera mordida! Menú romántico para conquistar corazones 💕🕯️"
- VAGO/GENERAL: "quiero algo rico" → "¡Sorpresa culinaria! Selección especial de la casa para ti 🎲✨"
- SIN CONTEXTO: consultas vagas → "¡Aventura gastronómica! Te preparamos algo delicioso 🌟🍴"

REGLA CLAVE: NUNCA dejar groupSuggestions vacío. Siempre inferir personas, siempre generar dishIds, siempre dar una respuesta divertida.

Ejemplos:
1. "Quiero algo vegano con arroz" → {"ingredientes": ["arroz"], "restricciones": ["vegano"], "categorias": [], "recomendaciones": ["dish_001"], "groupSuggestions": {"people": 0, "dishIds": [], "explanation": "", "funnyResponse": ""}}

2. "Somos 3 y queremos barato" → {"ingredientes": [], "restricciones": ["barato"], "categorias": [], "recomendaciones": ["dish_003"], "groupSuggestions": {"people": 3, "dishIds": ["dish_003", "dish_009", "dish_014"], "explanation": "Menú económico para 3 personas con platos de buen precio", "funnyResponse": "¡Perfecto! 3 deliciosos platos económicos que no romperán el banco 💰✨"}}

3. "Hemos ganado la champions" → {"ingredientes": [], "restricciones": [], "categorias": [], "recomendaciones": [], "groupSuggestions": {"people": 4, "dishIds": ["dish_001", "dish_002", "dish_003", "dish_016"], "explanation": "Menú de celebración para 4 campeones", "funnyResponse": "¡CAMPEONES! Menú de celebración digno de los ganadores 🏆🎉"}}

4. "Soy ingeniero de software" → {"ingredientes": [], "restricciones": [], "categorias": [], "recomendaciones": [], "groupSuggestions": {"people": 2, "dishIds": ["dish_007", "dish_008"], "explanation": "Menú energético para programadores", "funnyResponse": "¡Código y comida perfecta! Menú para programadores que saben de buen sabor 💻🍽️"}}

IMPORTANTE: 
1. Solo devuelve el JSON, sin explicaciones adicionales.
2. Para groupSuggestions.funnyResponse: SIEMPRE base la respuesta en las restricciones/preferencias mencionadas (barato, vegano, rápido, etc.), NO en el tipo de cocina de los platos seleccionados.
3. Si se menciona "barato": la respuesta debe hablar de precios económicos.
4. Si se menciona "vegano": la respuesta debe hablar de comida vegana.
5. Si se menciona tipo de cocina específico: usar respuesta del tipo de cocina.
6. La prioridad es: restricciones dietarias/económicas > tipo de cocina > ingredientes.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Komi",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
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
        ingredientes: Array.isArray(parsed.ingredientes) ? parsed.ingredientes : [],
        restricciones: Array.isArray(parsed.restricciones) ? parsed.restricciones : [],
        categorias: Array.isArray(parsed.categorias) ? parsed.categorias : [],
        recomendaciones: Array.isArray(parsed.recomendaciones) ? parsed.recomendaciones : [],
        groupSuggestions: parsed.groupSuggestions ? {
          people: typeof parsed.groupSuggestions.people === 'number' ? parsed.groupSuggestions.people : 0,
          dishIds: Array.isArray(parsed.groupSuggestions.dishIds) ? parsed.groupSuggestions.dishIds : [],
          explanation: typeof parsed.groupSuggestions.explanation === 'string' ? parsed.groupSuggestions.explanation : '',
          funnyResponse: typeof parsed.groupSuggestions.funnyResponse === 'string' ? parsed.groupSuggestions.funnyResponse : ''
        } : undefined
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
  
  const commonIngredients = ['arroz', 'pollo', 'carne', 'pescado', 'pasta', 'tomate', 'cebolla', 'ajo', 'queso']
  const commonRestrictions = ['vegano', 'vegetariano', 'sin gluten', 'sin lactosa', 'picante', 'sin picante', 'rápido', 'económico', 'barato']
  const commonCategories = ['española', 'italiana', 'asiática', 'mexicana', 'tradicional', 'casera', 'mediterránea']
  
  // Detectar número de personas
  let people = 0
  const peoplePatterns = [
    /somos (\d+)/,
    /(\d+) personas/,
    /para (\d+)/,
    /(\d+) amigos/,
    /(\d+) comensales/
  ]
  
  for (const pattern of peoplePatterns) {
    const match = lowerQuery.match(pattern)
    if (match) {
      people = parseInt(match[1])
      break
    }
  }
  
  // Detectar palabras que sugieren grupos
  if (lowerQuery.includes('pareja') || lowerQuery.includes('romántica')) {
    people = 2
  } else if (lowerQuery.includes('familia') && people === 0) {
    people = 4
  }
  
  const result: LLMResponse = {
    ingredientes: commonIngredients.filter(ing => lowerQuery.includes(ing)),
    restricciones: commonRestrictions.filter(rest => lowerQuery.includes(rest)),
    categorias: commonCategories.filter(cat => lowerQuery.includes(cat)),
    recomendaciones: [],
    groupSuggestions: people > 0 ? {
      people,
      dishIds: [],
      explanation: `Detectado grupo de ${people} personas`,
      funnyResponse: ''
    } : undefined
  }
  
  return result
} 