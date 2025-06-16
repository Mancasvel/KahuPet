import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log('🔍 Procesando consulta con MCP:', query)

    // Paso 1: Obtener información de los platos disponibles usando MCP
    const allDishes = await getAllDishesFromMCP()
    
    if (!allDishes || allDishes.length === 0) {
      return NextResponse.json({ 
        error: 'No se pudieron obtener los platos de la base de datos',
        suggestion: 'Verifica que la base de datos esté poblada'
      }, { status: 500 })
    }

    console.log(`📋 Encontrados ${allDishes.length} platos en la base de datos`)

    // Paso 2: Llamar al LLM con el contexto completo
    const llmResponse = await callOpenRouter(query, allDishes)
    
    if (!llmResponse) {
      return NextResponse.json({ error: 'Error processing query with LLM' }, { status: 500 })
    }

    console.log('🤖 Respuesta del LLM:', llmResponse)

    // Paso 3: Filtrar y ordenar los resultados
    let recommendedDishes: any[] = []

    // Priorizar recomendaciones específicas del LLM
    if (llmResponse.recomendaciones && llmResponse.recomendaciones.length > 0) {
      console.log('🎯 Usando recomendaciones específicas del LLM:', llmResponse.recomendaciones)
      
      const specificRecommendations = allDishes.filter((dish: any) => 
        llmResponse.recomendaciones.includes(dish._id)
      )
      
      recommendedDishes.push(...specificRecommendations)
    }

    // Buscar platos adicionales usando criterios
    const additionalDishes = findMatchingDishes(allDishes, llmResponse, recommendedDishes.map(d => d._id))
    
    // Combinar y limitar resultados
    recommendedDishes.push(...additionalDishes.slice(0, 8))

    // Ordenar por relevancia (precio para empezar)
    const finalResults = recommendedDishes
      .sort((a, b) => a.price - b.price)
      .slice(0, 12)

    return NextResponse.json({
      dishes: finalResults,
      intent: llmResponse,
      total: finalResults.length,
      mcp: true,
      summary: `Encontré ${finalResults.length} platos que coinciden con tu búsqueda: "${query}"`
    })

  } catch (error) {
    console.error('Error in MCP parse API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Función para obtener todos los platos usando el sistema actual
async function getAllDishesFromMCP() {
  try {
    // Por ahora, vamos a crear una función que simule el acceso directo
    // En una implementación completa, esto debería usar las funciones MCP
    
    // Para este MVP, podemos usar el endpoint interno
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dishes`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch dishes')
    }
    
    const data = await response.json()
    return data.dishes || []
  } catch (error) {
    console.error('Error fetching dishes via MCP:', error)
    return []
  }
}

// Función para encontrar platos que coincidan con los criterios
function findMatchingDishes(allDishes: any[], criteria: any, excludeIds: string[] = []) {
  const matchingDishes = allDishes
    .map((dish: any) => {
      // Excluir platos ya recomendados
      if (excludeIds.includes(dish._id)) {
        return null
      }

      let matches = false
      let relevanceScore = 0

      // Verificar ingredientes
      if (criteria.ingredientes && criteria.ingredientes.length > 0) {
        const hasIngredient = criteria.ingredientes.some((ing: string) =>
          dish.ingredients?.some((dishIng: string) =>
            dishIng.toLowerCase().includes(ing.toLowerCase())
          )
        )
        if (hasIngredient) {
          relevanceScore += 3
          matches = true
        }
      }

      // Verificar restricciones/preferencias
      if (criteria.restricciones && criteria.restricciones.length > 0) {
        const restrictionMatches = criteria.restricciones.filter((rest: string) =>
          dish.tags?.some((tag: string) =>
            tag.toLowerCase().includes(rest.toLowerCase())
          )
        )
        if (restrictionMatches.length > 0) {
          relevanceScore += restrictionMatches.length * 2
          matches = true
        }
      }

      // Verificar categorías
      if (criteria.categorias && criteria.categorias.length > 0) {
        const categoryMatches = criteria.categorias.filter((cat: string) =>
          dish.tags?.some((tag: string) =>
            tag.toLowerCase().includes(cat.toLowerCase())
          )
        )
        if (categoryMatches.length > 0) {
          relevanceScore += categoryMatches.length
          matches = true
        }
      }

      // Si no hay criterios específicos, incluir todos los platos
      if (!criteria.ingredientes?.length && !criteria.restricciones?.length && !criteria.categorias?.length) {
        matches = true
      }

      return matches ? { ...dish, relevanceScore } : null
    })
    .filter((dish: any) => dish !== null)
    .sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

  return matchingDishes
} 