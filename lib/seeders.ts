import { MongoClient } from 'mongodb'

export const restaurantData = [
  {
    _id: "rest_001",
    name: "La Toscana",
    description: "Auténtica cocina italiana en el corazón de Madrid",
    address: "Calle Gran Vía 15, Madrid",
    phone: "+34 91 123 4567",
    cuisine: ["italiana", "mediterránea"],
    rating: 4.5,
    priceRange: "€€",
    dishes: [
      {
        _id: "dish_001",
        name: "Pasta Primavera Vegana",
        description: "Deliciosa pasta con verduras de temporada, sin productos animales",
        ingredients: ["pasta", "calabacín", "tomate", "albahaca", "aceite de oliva", "ajo", "pimiento rojo"],
        tags: ["vegano", "vegetariano", "italiano", "rápido", "saludable"],
        price: 12.50,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&h=300&fit=crop",
        cookingTime: 15,
        spicyLevel: 0
      },
      {
        _id: "dish_002",
        name: "Risotto de Champiñones",
        description: "Cremoso risotto con champiñones porcini y trufa",
        ingredients: ["arroz arborio", "champiñones", "trufa", "cebolla", "queso parmesano", "vino blanco"],
        tags: ["vegetariano", "italiano", "cremoso", "premium"],
        price: 16.00,
        category: "arroz",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=300&fit=crop",
        cookingTime: 25,
        spicyLevel: 0
      },
      {
        _id: "dish_003",
        name: "Pizza Margherita",
        description: "Clásica pizza italiana con tomate, mozzarella y albahaca fresca",
        ingredients: ["masa de pizza", "tomate", "mozzarella", "albahaca", "aceite de oliva"],
        tags: ["vegetariano", "italiano", "clásico", "popular"],
        price: 11.00,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 0
      }
    ]
  },
  {
    _id: "rest_002",
    name: "El Rincón Español",
    description: "Tapas y platos tradicionales españoles",
    address: "Plaza Mayor 8, Madrid",
    phone: "+34 91 987 6543",
    cuisine: ["española", "tapas"],
    rating: 4.7,
    priceRange: "€€€",
    dishes: [
      {
        _id: "dish_004",
        name: "Paella Valenciana",
        description: "Auténtica paella con pollo, conejo y verduras, arroz bomba",
        ingredients: ["arroz bomba", "pollo", "conejo", "judías verdes", "tomate", "pimentón", "azafrán"],
        tags: ["española", "tradicional", "con carne", "para compartir"],
        price: 18.00,
        category: "arroz",
        image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&h=300&fit=crop",
        cookingTime: 35,
        spicyLevel: 1
      },
      {
        _id: "dish_005",
        name: "Jamón Ibérico de Bellota",
        description: "Exquisito jamón ibérico cortado a cuchillo",
        ingredients: ["jamón ibérico", "pan tostado", "tomate"],
        tags: ["española", "premium", "embutido", "sin gluten"],
        price: 22.00,
        category: "entrante",
        image: "https://images.unsplash.com/photo-1549611012-bc962e443705?w=500&h=300&fit=crop",
        cookingTime: 5,
        spicyLevel: 0
      },
      {
        _id: "dish_006",
        name: "Gazpacho Andaluz",
        description: "Refrescante sopa fría de tomate y verduras",
        ingredients: ["tomate", "pepino", "pimiento", "cebolla", "ajo", "pan", "aceite de oliva"],
        tags: ["vegano", "vegetariano", "española", "refrescante", "verano"],
        price: 8.50,
        category: "sopa",
        image: "https://images.unsplash.com/photo-1571069492352-34edd3b8b8da?w=500&h=300&fit=crop",
        cookingTime: 10,
        spicyLevel: 0
      }
    ]
  },
  {
    _id: "rest_003",
    name: "Sakura Sushi",
    description: "Auténtica experiencia japonesa con ingredientes frescos",
    address: "Calle de Serrano 45, Madrid",
    phone: "+34 91 456 7890",
    cuisine: ["japonesa", "sushi"],
    rating: 4.8,
    priceRange: "€€€€",
    dishes: [
      {
        _id: "dish_007",
        name: "Sashimi Variado",
        description: "Selección de pescados frescos cortados en láminas",
        ingredients: ["salmón", "atún", "pez limón", "wasabi", "jengibre"],
        tags: ["japonés", "crudo", "sin arroz", "premium", "sin gluten"],
        price: 24.00,
        category: "sashimi",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop",
        cookingTime: 8,
        spicyLevel: 1
      },
      {
        _id: "dish_008",
        name: "Ramen Tonkotsu",
        description: "Caldo cremoso de hueso de cerdo con chashu y huevo",
        ingredients: ["caldo de cerdo", "fideos ramen", "chashu", "huevo", "nori", "cebollino"],
        tags: ["japonés", "caliente", "con carne", "sustancioso"],
        price: 16.50,
        category: "ramen",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=300&fit=crop",
        cookingTime: 20,
        spicyLevel: 2
      },
      {
        _id: "dish_009",
        name: "Maki Roll Vegetariano",
        description: "Rollitos de sushi con aguacate, pepino y zanahoria",
        ingredients: ["arroz sushi", "nori", "aguacate", "pepino", "zanahoria", "sésamo"],
        tags: ["vegetariano", "japonés", "fresco", "saludable"],
        price: 12.00,
        category: "maki",
        image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 0
      }
    ]
  },
  {
    _id: "rest_004",
    name: "Green Garden",
    description: "Restaurante vegano y saludable",
    address: "Calle de Malasaña 23, Madrid",
    phone: "+34 91 234 5678",
    cuisine: ["vegana", "saludable"],
    rating: 4.3,
    priceRange: "€€",
    dishes: [
      {
        _id: "dish_010",
        name: "Bowl de Quinoa y Aguacate",
        description: "Nutritivo bowl con quinoa, aguacate, verduras y semillas",
        ingredients: ["quinoa", "aguacate", "espinacas", "tomate cherry", "semillas de girasol", "hummus"],
        tags: ["vegano", "saludable", "sin gluten", "proteína vegetal", "superfood"],
        price: 13.50,
        category: "bowl",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop",
        cookingTime: 10,
        spicyLevel: 0
      },
      {
        _id: "dish_011",
        name: "Hamburguesa de Lentejas",
        description: "Hamburguesa casera de lentejas con verduras asadas",
        ingredients: ["lentejas", "pan integral", "lechuga", "tomate", "cebolla", "pimiento asado"],
        tags: ["vegano", "proteína vegetal", "casero", "sustancioso"],
        price: 11.00,
        category: "hamburguesa",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=300&fit=crop",
        cookingTime: 15,
        spicyLevel: 0
      }
    ]
  },
  {
    _id: "rest_005",
    name: "Tandoor Palace",
    description: "Auténtica cocina india con especias tradicionales",
    address: "Calle de Lavapiés 12, Madrid",
    phone: "+34 91 345 6789",
    cuisine: ["india", "especiada"],
    rating: 4.6,
    priceRange: "€€",
    dishes: [
      {
        _id: "dish_012",
        name: "Chicken Tikka Masala",
        description: "Pollo marinado en yogur y especias con salsa cremosa",
        ingredients: ["pollo", "yogur", "tomate", "nata", "garam masala", "jengibre", "ajo"],
        tags: ["indio", "con carne", "cremoso", "especiado", "popular"],
        price: 15.50,
        category: "curry",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=300&fit=crop",
        cookingTime: 25,
        spicyLevel: 3
      },
      {
        _id: "dish_013",
        name: "Dal Vegano",
        description: "Lentejas rojas con especias aromáticas",
        ingredients: ["lentejas rojas", "cúrcuma", "comino", "cilantro", "jengibre", "ajo"],
        tags: ["vegano", "indio", "proteína vegetal", "especiado", "saludable"],
        price: 9.50,
        category: "curry",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop",
        cookingTime: 20,
        spicyLevel: 2
      },
      {
        _id: "dish_014",
        name: "Naan de Ajo",
        description: "Pan indio tradicional con ajo y mantequilla",
        ingredients: ["harina", "yogur", "ajo", "mantequilla", "cilantro"],
        tags: ["vegetariano", "indio", "pan", "acompañamiento"],
        price: 4.50,
        category: "pan",
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=300&fit=crop",
        cookingTime: 8,
        spicyLevel: 1
      }
    ]
  }
]

export async function seedDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurado')
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  })

  try {
    await client.connect()
    console.log('🔗 Conectado a MongoDB')

    const db = client.db('Komi')
    const restaurantsCollection = db.collection('Restaurants')

    // Limpiar la colección existente
    await restaurantsCollection.deleteMany({})
    console.log('🧹 Colección limpiada')

    // Insertar los datos de seeders
    const result = await restaurantsCollection.insertMany(restaurantData as any)
    console.log(`✅ ${result.insertedCount} restaurantes insertados`)

    // Crear índices para optimizar búsquedas
    await restaurantsCollection.createIndex({ "dishes.tags": 1 })
    await restaurantsCollection.createIndex({ "dishes.ingredients": 1 })
    await restaurantsCollection.createIndex({ "cuisine": 1 })
    await restaurantsCollection.createIndex({ "dishes.category": 1 })
    console.log('📇 Índices creados')

    return result
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await client.close()
  }
} 