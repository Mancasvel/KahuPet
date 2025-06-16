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
    
    // Debug detallado para MongoDB
    if (process.env.MONGODB_URI) {
      console.log('  MongoDB URI length:', process.env.MONGODB_URI.length);
      console.log('  Contains "demo":', process.env.MONGODB_URI.includes('demo'));
      console.log('  Contains "username:password":', process.env.MONGODB_URI.includes('username:password'));
    }
    
    // Debug detallado para OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      console.log('  OpenRouter Key length:', process.env.OPENROUTER_API_KEY.length);
      console.log('  Contains "demo":', process.env.OPENROUTER_API_KEY.includes('demo'));
      console.log('  Contains "placeholder":', process.env.OPENROUTER_API_KEY.includes('placeholder'));
      console.log('  Contains "xxxxxxxx":', process.env.OPENROUTER_API_KEY.includes('xxxxxxxx'));
    }
    
    console.log('  Valid MongoDB:', hasValidMongoDB);
    console.log('  Valid OpenRouter:', hasValidOpenRouter);
    console.log('  Using demo mode:', useDemo);

    if (useDemo) {
      // Usar datos de demostración locales
      const demoResponse = getDemoResponse(query)
      return NextResponse.json({ 
        dishes: demoResponse.dishes,
        intent: demoResponse.intent,
        total: demoResponse.dishes.length,
        demo: true
      })
    }

    // Conectar a MongoDB primero para obtener los platos disponibles
    if (!client) {
      return NextResponse.json({ error: 'MongoDB client not initialized' }, { status: 500 })
    }
    
    await client.connect()
    const db = client.db('Komi')
    const restaurantsCollection = db.collection('Restaurants')

    // Obtener todos los platos disponibles para pasarlos al LLM
    const allRestaurants = await restaurantsCollection.find({}).toArray()
    const allDishes: any[] = []
    
    for (const restaurant of allRestaurants) {
      for (const dish of restaurant.dishes || []) {
        allDishes.push({
          ...dish,
          restaurant: {
            name: restaurant.name,
            address: restaurant.address
          }
        })
      }
    }

    console.log(`📋 Encontrados ${allDishes.length} platos en ${allRestaurants.length} restaurantes`)

    // Llamar a OpenRouter con el contexto completo de platos
    const llmResponse = await callOpenRouter(query, allDishes)
    
    if (!llmResponse) {
      return NextResponse.json({ error: 'Error processing query' }, { status: 500 })
    }

    console.log('🤖 Respuesta del LLM:', llmResponse)

    // Construir filtros de búsqueda basados en la respuesta del LLM
    const searchFilters: any = {}
    
    // Filtrar por ingredientes si están especificados
    if (llmResponse.ingredientes && llmResponse.ingredientes.length > 0) {
      searchFilters['dishes.ingredients'] = {
        $in: llmResponse.ingredientes.map((ing: string) => new RegExp(ing, 'i'))
      }
    }

    // Filtrar por tags/restricciones
    if (llmResponse.restricciones && llmResponse.restricciones.length > 0) {
      searchFilters['dishes.tags'] = {
        $in: llmResponse.restricciones.map((tag: string) => new RegExp(tag, 'i'))
      }
    }

    // Filtrar por categorías
    if (llmResponse.categorias && llmResponse.categorias.length > 0) {
      if (searchFilters['dishes.tags']) {
        searchFilters['dishes.tags']['$in'] = [
          ...searchFilters['dishes.tags']['$in'],
          ...llmResponse.categorias.map((cat: string) => new RegExp(cat, 'i'))
        ]
      } else {
        searchFilters['dishes.tags'] = {
          $in: llmResponse.categorias.map((cat: string) => new RegExp(cat, 'i'))
        }
      }
    }

    // Buscar restaurantes que tengan platos que coincidan
    const restaurants = await restaurantsCollection
      .find(searchFilters)
      .limit(20)
      .toArray()

    // Priorizar recomendaciones específicas del LLM
    let matchingDishes: any[] = []
    
    // Si el LLM hizo recomendaciones específicas, usarlas primero
    if (llmResponse.recomendaciones && llmResponse.recomendaciones.length > 0) {
      console.log('🎯 Usando recomendaciones específicas del LLM:', llmResponse.recomendaciones)
      
      const recommendedDishes = allDishes.filter(dish => 
        llmResponse.recomendaciones.includes(dish._id)
      )
      
      matchingDishes.push(...recommendedDishes)
    }
    
    // Luego, buscar platos adicionales usando los criterios extraídos
    const additionalDishes: any[] = []
    
    for (const dish of allDishes) {
      // Evitar duplicados con las recomendaciones específicas
      if (llmResponse.recomendaciones?.includes(dish._id)) {
        continue
      }
      
      let matches = true
      let relevanceScore = 0
      
      // Verificar ingredientes
      if (llmResponse.ingredientes && llmResponse.ingredientes.length > 0) {
        const hasIngredient = llmResponse.ingredientes.some((ing: string) =>
          dish.ingredients?.some((dishIng: string) =>
            dishIng.toLowerCase().includes(ing.toLowerCase())
          )
        )
        if (hasIngredient) {
          relevanceScore += 3
        } else {
          matches = false
        }
      }

      // Verificar restricciones/preferencias
      if (llmResponse.restricciones && llmResponse.restricciones.length > 0) {
        const restrictionMatches = llmResponse.restricciones.filter((rest: string) =>
          dish.tags?.some((tag: string) =>
            tag.toLowerCase().includes(rest.toLowerCase())
          )
        )
        if (restrictionMatches.length > 0) {
          relevanceScore += restrictionMatches.length * 2
        } else if (llmResponse.restricciones.some(r => ['vegano', 'vegetariano', 'sin gluten'].includes(r.toLowerCase()))) {
          // Restricciones estrictas deben cumplirse
          matches = false
        }
      }

      // Verificar categorías de cocina
      if (llmResponse.categorias && llmResponse.categorias.length > 0) {
        const categoryMatches = llmResponse.categorias.filter((cat: string) =>
          dish.tags?.some((tag: string) =>
            tag.toLowerCase().includes(cat.toLowerCase())
          )
        )
        if (categoryMatches.length > 0) {
          relevanceScore += categoryMatches.length
        }
      }

      if (matches && (relevanceScore > 0 || 
          (!llmResponse.ingredientes?.length && !llmResponse.restricciones?.length && !llmResponse.categorias?.length))) {
        additionalDishes.push({
          ...dish,
          relevanceScore
        })
      }
    }
    
    // Ordenar platos adicionales por relevancia
    additionalDishes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    
    // Combinar recomendaciones específicas con búsqueda general
    matchingDishes.push(...additionalDishes.slice(0, 8)) // Limitar platos adicionales

    // Limitar resultados y ordenar por relevancia (precio)
    const limitedDishes = matchingDishes
      .sort((a, b) => a.price - b.price)
      .slice(0, 12)

    return NextResponse.json({ 
      dishes: limitedDishes,
      intent: llmResponse,
      total: limitedDishes.length
    })

  } catch (error) {
    console.error('Error in parse API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Función para generar respuestas de demostración locales
function getDemoResponse(query: string) {
  const lowerQuery = query.toLowerCase()
  
  // Datos de demostración locales
  const demoDishes = [
    {
      _id: "demo1",
      name: "Pasta Primavera Vegana",
      description: "Deliciosa pasta con verduras de temporada, sin productos animales",
      ingredients: ["pasta", "calabacín", "tomate", "albahaca", "aceite de oliva"],
      tags: ["vegano", "vegetariano", "italiano", "rápido"],
      price: 12.50,
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=300&fit=crop",
      restaurant: {
        name: "La Toscana",
        address: "Calle Gran Vía 15, Madrid"
      }
    },
    {
      _id: "demo2",
      name: "Risotto de Pollo",
      description: "Cremoso risotto con pollo y champiñones, cocción tradicional",
      ingredients: ["arroz", "pollo", "champiñones", "cebolla", "queso parmesano"],
      tags: ["tradicional", "italiano", "con carne"],
      price: 16.00,
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=300&fit=crop",
      restaurant: {
        name: "La Toscana",
        address: "Calle Gran Vía 15, Madrid"
      }
    },
    {
      _id: "demo3",
      name: "Paella Valenciana",
      description: "Auténtica paella con pollo, conejo y verduras, arroz bomba",
      ingredients: ["arroz", "pollo", "conejo", "judías verdes", "tomate", "pimentón"],
      tags: ["española", "tradicional", "con carne"],
      price: 18.00,
      image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&h=300&fit=crop",
      restaurant: {
        name: "El Rincón Español",
        address: "Plaza Mayor 8, Madrid"
      }
    },
    {
      _id: "demo4",
      name: "Gazpacho Andaluz",
      description: "Refrescante sopa fría de tomate, ideal para el verano",
      ingredients: ["tomate", "pepino", "pimiento", "cebolla", "ajo", "aceite de oliva"],
      tags: ["vegano", "vegetariano", "española", "rápido", "frío"],
      price: 8.00,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
      restaurant: {
        name: "El Rincón Español",
        address: "Plaza Mayor 8, Madrid"
      }
    },
    {
      _id: "demo5",
      name: "Sushi Vegano",
      description: "Variedad de sushi con aguacate, pepino y verduras",
      ingredients: ["arroz", "aguacate", "pepino", "zanahoria", "alga nori"],
      tags: ["vegano", "vegetariano", "asiática", "japonesa", "rápido"],
      price: 15.00,
      image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop",
      restaurant: {
        name: "Sakura Sushi",
        address: "Calle Serrano 42, Madrid"
      }
    },
    {
      _id: "demo6",
      name: "Bowl Buddha Energético",
      description: "Bowl completo con quinoa, verduras y proteína vegetal",
      ingredients: ["quinoa", "garbanzos", "aguacate", "espinacas", "tomate cherry"],
      tags: ["vegano", "vegetariano", "saludable", "sin gluten", "rápido"],
      price: 11.50,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop",
      restaurant: {
        name: "Green Garden",
        address: "Calle Fuencarral 25, Madrid"
      }
    }
  ]

  // Filtrar platos basándose en palabras clave simples
  let filteredDishes = demoDishes

  if (lowerQuery.includes('vegano')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('vegano') || dish.tags.includes('vegetariano')
    )
  }

  if (lowerQuery.includes('arroz')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.ingredients.includes('arroz')
    )
  }

  if (lowerQuery.includes('rápido')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('rápido')
    )
  }

  if (lowerQuery.includes('picante')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('picante')
    )
  }

  if (lowerQuery.includes('sin picante')) {
    filteredDishes = filteredDishes.filter(dish => 
      !dish.tags.includes('picante')
    )
  }

  if (lowerQuery.includes('español') || lowerQuery.includes('española')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('española')
    )
  }

  if (lowerQuery.includes('tradicional')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('tradicional')
    )
  }

  if (lowerQuery.includes('sin gluten')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.tags.includes('sin gluten')
    )
  }

  if (lowerQuery.includes('pollo')) {
    filteredDishes = filteredDishes.filter(dish => 
      dish.ingredients.includes('pollo')
    )
  }

  // Si no hay filtros específicos o no hay resultados, mostrar algunos platos aleatorios
  if (filteredDishes.length === 0 || filteredDishes.length === demoDishes.length) {
    filteredDishes = demoDishes.slice(0, 4) // Mostrar los primeros 4
  }

  return {
    dishes: filteredDishes.slice(0, 6), // Limitar a 6 resultados
    intent: {
      ingredientes: extractKeywords(lowerQuery, ['arroz', 'pollo', 'tomate', 'quinoa']),
      restricciones: extractKeywords(lowerQuery, ['vegano', 'sin gluten', 'rápido', 'sin picante']),
      categorias: extractKeywords(lowerQuery, ['española', 'italiana', 'asiática', 'tradicional'])
    }
  }
}

function extractKeywords(query: string, keywords: string[]): string[] {
  return keywords.filter(keyword => query.includes(keyword))
} 