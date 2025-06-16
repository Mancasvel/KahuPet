import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI!)

const sampleRestaurants = [
  {
    name: "La Toscana",
    address: "Calle Gran Vía 15, Madrid",
    dishes: [
      {
        name: "Pasta Primavera Vegana",
        description: "Deliciosa pasta con verduras de temporada, sin productos animales",
        ingredients: ["pasta", "calabacín", "tomate", "albahaca", "aceite de oliva"],
        tags: ["vegano", "vegetariano", "italiano", "rápido"],
        price: 12.50,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=300&fit=crop"
      },
      {
        name: "Risotto de Pollo",
        description: "Cremoso risotto con pollo y champiñones, cocción tradicional",
        ingredients: ["arroz", "pollo", "champiñones", "cebolla", "queso parmesano"],
        tags: ["tradicional", "italiano", "con carne"],
        price: 16.00,
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=300&fit=crop"
      },
      {
        name: "Pizza Margherita Sin Gluten",
        description: "Pizza clásica con masa sin gluten, tomate y mozzarella",
        ingredients: ["harina sin gluten", "tomate", "mozzarella", "albahaca"],
        tags: ["sin gluten", "vegetariano", "italiano"],
        price: 14.00,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    name: "El Rincón Español",
    address: "Plaza Mayor 8, Madrid",
    dishes: [
      {
        name: "Paella Valenciana",
        description: "Auténtica paella con pollo, conejo y verduras, arroz bomba",
        ingredients: ["arroz", "pollo", "conejo", "judías verdes", "tomate", "pimentón"],
        tags: ["española", "tradicional", "con carne"],
        price: 18.00,
        image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&h=300&fit=crop"
      },
      {
        name: "Gazpacho Andaluz",
        description: "Refrescante sopa fría de tomate, ideal para el verano",
        ingredients: ["tomate", "pepino", "pimiento", "cebolla", "ajo", "aceite de oliva"],
        tags: ["vegano", "vegetariano", "española", "rápido", "frío"],
        price: 8.00,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop"
      },
      {
        name: "Tortilla Española Picante",
        description: "Tortilla tradicional con patatas y un toque de pimiento picante",
        ingredients: ["huevos", "patatas", "cebolla", "pimiento picante"],
        tags: ["española", "tradicional", "picante", "vegetariano"],
        price: 10.00,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    name: "Sakura Sushi",
    address: "Calle Serrano 42, Madrid",
    dishes: [
      {
        name: "Sushi Vegano",
        description: "Variedad de sushi con aguacate, pepino y verduras",
        ingredients: ["arroz", "aguacate", "pepino", "zanahoria", "alga nori"],
        tags: ["vegano", "vegetariano", "asiática", "japonesa", "rápido"],
        price: 15.00,
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop"
      },
      {
        name: "Ramen Picante",
        description: "Caldo intenso con fideos, cerdo chashu y verduras",
        ingredients: ["fideos", "caldo de cerdo", "cerdo", "huevo", "cebolleta", "picante"],
        tags: ["asiática", "japonesa", "picante", "con carne"],
        price: 13.50,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=300&fit=crop"
      },
      {
        name: "Teriyaki de Pollo",
        description: "Pollo glaseado con salsa teriyaki y arroz japonés",
        ingredients: ["pollo", "arroz", "salsa teriyaki", "brócoli", "sésamo"],
        tags: ["asiática", "japonesa", "con carne", "dulce"],
        price: 14.00,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop"
      }
    ]
  },
  {
    name: "Green Garden",
    address: "Calle Fuencarral 25, Madrid",
    dishes: [
      {
        name: "Bowl Buddha Energético",
        description: "Bowl completo con quinoa, verduras y proteína vegetal",
        ingredients: ["quinoa", "garbanzos", "aguacate", "espinacas", "tomate cherry"],
        tags: ["vegano", "vegetariano", "saludable", "sin gluten", "rápido"],
        price: 11.50,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop"
      },
      {
        name: "Ensalada César Vegana",
        description: "Versión vegana de la clásica ensalada césar",
        ingredients: ["lechuga romana", "croutons", "tomate", "levadura nutricional"],
        tags: ["vegano", "vegetariano", "saludable", "rápido", "económico"],
        price: 9.00,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop"
      },
      {
        name: "Hamburguesa de Lentejas",
        description: "Hamburguesa casera de lentejas con pan integral",
        ingredients: ["lentejas", "pan integral", "lechuga", "tomate", "cebolla"],
        tags: ["vegano", "vegetariano", "casera", "económico"],
        price: 10.50,
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop"
      }
    ]
  }
]

async function seedDatabase() {
  try {
    console.log('Conectando a MongoDB...')
    await client.connect()
    
    const db = client.db('komi')
    const collection = db.collection('restaurants')
    
    // Limpiar colección existente
    console.log('Limpiando datos existentes...')
    await collection.deleteMany({})
    
    // Insertar nuevos datos
    console.log('Insertando restaurantes y platos...')
    const result = await collection.insertMany(sampleRestaurants)
    
    console.log(`✅ Seeding completado!`)
    console.log(`📍 Insertados ${result.insertedCount} restaurantes`)
    
    // Mostrar estadísticas
    const totalDishes = sampleRestaurants.reduce((total, restaurant) => total + restaurant.dishes.length, 0)
    console.log(`🍽️  Total de platos: ${totalDishes}`)
    
    // Crear índices para mejorar el rendimiento de búsqueda
    console.log('Creando índices...')
    await collection.createIndex({ "dishes.ingredients": 1 })
    await collection.createIndex({ "dishes.tags": 1 })
    await collection.createIndex({ "dishes.price": 1 })
    
    console.log('✅ Índices creados correctamente')
    
  } catch (error) {
    console.error('❌ Error en el seeding:', error)
  } finally {
    await client.close()
    console.log('Conexión cerrada')
  }
}

// Ejecutar seeding
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase 