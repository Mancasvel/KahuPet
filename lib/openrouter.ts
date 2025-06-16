interface LLMResponse {
  ingredientes: string[]
  restricciones: string[]
  categorias: string[]
  recomendaciones: string[]
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
2. Si tienes información de platos disponibles, recomendar los IDs de los platos más relevantes
3. Extraer criterios de búsqueda para encontrar más opciones

Debes devolver ÚNICAMENTE un JSON válido con esta estructura:
{
  "ingredientes": [],
  "restricciones": [],
  "categorias": [],
  "recomendaciones": []
}

Donde:
- ingredientes: ingredientes específicos mencionados (ej: "arroz", "pollo", "tomate")
- restricciones: restricciones dietarias o preferencias (ej: "vegano", "sin gluten", "sin picante", "rápido", "económico", "barato", "premium")
- categorias: tipos de comida o cocina (ej: "española", "italiana", "japonesa", "india", "asiática", "tradicional", "casera")
- recomendaciones: IDs de platos específicos que recomendarías basado en la consulta (solo si tienes información de platos disponibles)

${dishesContext}

Ejemplo: "Quiero algo vegano con arroz, que sea rápido y económico"
Respuesta: {"ingredientes": ["arroz"], "restricciones": ["vegano", "rápido", "económico"], "categorias": [], "recomendaciones": ["dish_001", "dish_010"]}

IMPORTANTE: Solo devuelve el JSON, sin explicaciones adicionales.`

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
        recomendaciones: Array.isArray(parsed.recomendaciones) ? parsed.recomendaciones : []
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
  
  const result: LLMResponse = {
    ingredientes: commonIngredients.filter(ing => lowerQuery.includes(ing)),
    restricciones: commonRestrictions.filter(rest => lowerQuery.includes(rest)),
    categorias: commonCategories.filter(cat => lowerQuery.includes(cat)),
    recomendaciones: []
  }
  
  return result
} 