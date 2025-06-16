import { NextRequest, NextResponse } from 'next/server'
import { callOpenRouter } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    console.log('🔍 Procesando consulta con MCP:', query)

    // Paso 1: Obtener información de restaurantes y platos usando MCP
    const { allDishes, allRestaurants } = await getAllDataFromMCP()
    
    if (!allDishes || allDishes.length === 0) {
      return NextResponse.json({ 
        error: 'No se pudieron obtener los datos de la base de datos',
        suggestion: 'Verifica que la base de datos esté poblada'
      }, { status: 500 })
    }

    console.log(`📋 Encontrados ${allDishes.length} platos en ${allRestaurants.length} restaurantes`)

    // Paso 2: Llamar al LLM con el contexto completo de platos
    const llmResponse = await callOpenRouter(query, allDishes)
    
    if (!llmResponse) {
      return NextResponse.json({ error: 'Error processing query with LLM' }, { status: 500 })
    }

    console.log('🤖 Respuesta del LLM:', llmResponse)

    // Paso 3: Filtrar y ordenar los resultados
    let recommendedDishes: any[] = []
    let dynamicMenu: any[] = []
    let groupSuggestion: any = null

    // Verificar sugerencias de menús (ahora siempre debe haber algo)
    if (llmResponse.groupSuggestions && llmResponse.groupSuggestions.people > 0) {
      console.log('👥 Detectado grupo de personas:', llmResponse.groupSuggestions)
      groupSuggestion = llmResponse.groupSuggestions
      
      // Crear menú dinámico basado en los platos sugeridos por el LLM
      if (llmResponse.groupSuggestions.dishIds && llmResponse.groupSuggestions.dishIds.length > 0) {
        const suggestedDishes = allDishes.filter((dish: any) => 
          llmResponse.groupSuggestions!.dishIds.includes(dish._id) ||
          llmResponse.groupSuggestions!.dishIds.includes(dish.name)
        )
        
        // Si encontramos platos sugeridos, filtrar para que sean del mismo restaurante
        if (suggestedDishes.length > 0) {
          const groupedByRestaurant = suggestedDishes.reduce((acc: any, dish: any) => {
            const restaurantId = dish.restaurant._id
            if (!acc[restaurantId]) acc[restaurantId] = []
            acc[restaurantId].push(dish)
            return acc
          }, {})
          
          // Encontrar el restaurante con más platos que coincidan
          const bestRestaurant = Object.keys(groupedByRestaurant).reduce((best, current) => 
            groupedByRestaurant[current].length > groupedByRestaurant[best].length ? current : best
          )
          
          dynamicMenu.push(...groupedByRestaurant[bestRestaurant].slice(0, groupSuggestion.people))
        } else {
          // Si no encontramos platos específicos, usar las recomendaciones generales del mismo restaurante
          const fallbackDishes = allDishes.filter((dish: any) => 
            llmResponse.recomendaciones.includes(dish._id) || 
            llmResponse.recomendaciones.includes(dish.name)
          )
          
          if (fallbackDishes.length > 0) {
            const firstRestaurantId = fallbackDishes[0].restaurant._id
            let sameRestaurantDishes = allDishes.filter((dish: any) => 
              dish.restaurant._id === firstRestaurantId
            ).slice(0, groupSuggestion.people)
            
            // Si no tenemos suficientes platos del mismo restaurante, buscar más platos baratos del mismo restaurante
            if (sameRestaurantDishes.length < groupSuggestion.people) {
              const additionalDishes = allDishes
                .filter((dish: any) => 
                  dish.restaurant._id === firstRestaurantId && 
                  !sameRestaurantDishes.some((selected: any) => selected._id === dish._id)
                )
                .sort((a: any, b: any) => a.price - b.price)
                .slice(0, groupSuggestion.people - sameRestaurantDishes.length)
              
              sameRestaurantDishes = [...sameRestaurantDishes, ...additionalDishes]
            }
            
            dynamicMenu.push(...sameRestaurantDishes)
          }
        }
      } else {
        // Si no hay dishIds específicos, usar las recomendaciones del LLM del mismo restaurante
        const fallbackDishes = allDishes.filter((dish: any) => 
          llmResponse.recomendaciones.includes(dish._id) || 
          llmResponse.recomendaciones.includes(dish.name)
        )
        
        if (fallbackDishes.length > 0) {
          const firstRestaurantId = fallbackDishes[0].restaurant._id
          let sameRestaurantDishes = allDishes.filter((dish: any) => 
            dish.restaurant._id === firstRestaurantId
          ).slice(0, groupSuggestion.people)
          
          // Si no tenemos suficientes platos del mismo restaurante, buscar más platos del mismo restaurante
          if (sameRestaurantDishes.length < groupSuggestion.people) {
            const additionalDishes = allDishes
              .filter((dish: any) => 
                dish.restaurant._id === firstRestaurantId && 
                !sameRestaurantDishes.some((selected: any) => selected._id === dish._id)
              )
              .sort((a: any, b: any) => a.price - b.price)
              .slice(0, groupSuggestion.people - sameRestaurantDishes.length)
            
            sameRestaurantDishes = [...sameRestaurantDishes, ...additionalDishes]
          }
          
          dynamicMenu.push(...sameRestaurantDishes)
        }
      }
    } else {
      // Si el LLM no generó grupo, crear uno por defecto
      console.log('🔄 No se detectó grupo, creando sugerencia por defecto')
      groupSuggestion = {
        people: 2,
        dishIds: [],
        explanation: 'Selección especial de la casa para ti',
        funnyResponse: '¡Aventura gastronómica! Te preparamos algo delicioso 🌟🍴'
      }
      
      // Crear un menú por defecto con platos variados del primer restaurante
      if (allDishes.length > 0) {
        const defaultRestaurant = allDishes[0].restaurant._id
        const defaultDishes = allDishes
          .filter((dish: any) => dish.restaurant._id === defaultRestaurant)
          .slice(0, groupSuggestion.people)
        
        dynamicMenu.push(...defaultDishes)
        
        // Actualizar los dishIds con los platos seleccionados
        groupSuggestion.dishIds = defaultDishes.map((dish: any) => dish._id)
      }
    }

    // Priorizar recomendaciones específicas del LLM
    if (llmResponse.recomendaciones && llmResponse.recomendaciones.length > 0) {
      console.log('🎯 Usando recomendaciones específicas del LLM:', llmResponse.recomendaciones)
      
      const specificRecommendations = allDishes.filter((dish: any) => 
        llmResponse.recomendaciones.includes(dish._id) || 
        llmResponse.recomendaciones.includes(dish.name)
      )
      
      recommendedDishes.push(...specificRecommendations)
    }

    // Buscar platos adicionales usando criterios
    const additionalDishes = findMatchingDishes(allDishes, llmResponse, recommendedDishes.map(d => d._id))
    
    // Combinar y limitar resultados
    recommendedDishes.push(...additionalDishes.slice(0, 8))

    // Ordenar por relevancia (precio para empezar)
    const finalDishes = recommendedDishes
      .sort((a, b) => a.price - b.price)
      .slice(0, 12)

    // Agrupar restaurantes únicos
    const restaurantIds = new Set([
      ...finalDishes.map(d => d.restaurant._id),
      ...dynamicMenu.map((d: any) => d.restaurant._id)
    ])
    
    const uniqueRestaurants = allRestaurants.filter((restaurant: any) => 
      restaurantIds.has(restaurant._id)
    )

    return NextResponse.json({
      dishes: finalDishes,
      restaurants: uniqueRestaurants,
      dynamicMenu,
      groupSuggestion,
      intent: llmResponse,
      total: finalDishes.length + dynamicMenu.length,
      mcp: true,
      summary: groupSuggestion?.funnyResponse 
        ? groupSuggestion.funnyResponse
        : `Encontré ${finalDishes.length} platos que coinciden con tu búsqueda: "${query}"`
    })

  } catch (error) {
    console.error('Error in MCP parse API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Función para obtener todos los datos (restaurantes, platos y menús) usando el sistema actual
async function getAllDataFromMCP() {
  try {
    // Obtener restaurantes que incluyen platos y menús
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/restaurants`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch restaurants')
    }
    
    const allRestaurants = await response.json()
    
    // Extraer todos los platos de todos los restaurantes
    const allDishes = allRestaurants.flatMap((restaurant: any) => 
      restaurant.dishes.map((dish: any) => ({
        ...dish,
        restaurant: {
          name: restaurant.name,
          address: restaurant.address,
          _id: restaurant._id
        }
      }))
    )



    return {
      allRestaurants,
      allDishes
    }
  } catch (error) {
    console.error('Error fetching data via MCP:', error)
    return {
      allRestaurants: [],
      allDishes: []
    }
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