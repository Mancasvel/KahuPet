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
    deliveryTime: "25-35 min",
    minOrder: 15.00,
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
        spicyLevel: 0,
        portionSize: "individual"
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
        spicyLevel: 0,
        portionSize: "individual"
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
        spicyLevel: 0,
        portionSize: "compartir"
      },
      {
        _id: "dish_015",
        name: "Lasaña de la Casa",
        description: "Tradicional lasaña con carne, bechamel y queso gratinado",
        ingredients: ["pasta", "carne picada", "bechamel", "tomate", "queso", "hierbas"],
        tags: ["con carne", "italiano", "tradicional", "sustancioso"],
        price: 14.50,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=300&fit=crop",
        cookingTime: 20,
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_016",
        name: "Tiramisu Casero",
        description: "Postre tradicional italiano con mascarpone y café",
        ingredients: ["mascarpone", "café", "cacao", "bizcochos", "huevos", "azúcar"],
        tags: ["postre", "italiano", "dulce", "casero"],
        price: 6.50,
        category: "postre",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&h=300&fit=crop",
        cookingTime: 5,
        spicyLevel: 0,
        portionSize: "individual"
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
    deliveryTime: "30-40 min",
    minOrder: 20.00,
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
        spicyLevel: 1,
        portionSize: "compartir"
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
        spicyLevel: 0,
        portionSize: "compartir"
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
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_017",
        name: "Pulpo a la Gallega",
        description: "Pulpo cocido con pimentón dulce y aceite de oliva",
        ingredients: ["pulpo", "patatas", "pimentón", "aceite de oliva", "sal gorda"],
        tags: ["española", "marisco", "tradicional", "sin gluten"],
        price: 16.50,
        category: "marisco",
        image: "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=500&h=300&fit=crop",
        cookingTime: 15,
        spicyLevel: 1,
        portionSize: "compartir"
      },
      {
        _id: "dish_018",
        name: "Tortilla Española",
        description: "Tradicional tortilla de patatas con cebolla",
        ingredients: ["huevos", "patatas", "cebolla", "aceite de oliva", "sal"],
        tags: ["vegetariano", "española", "tradicional", "casero"],
        price: 9.00,
        category: "entrante",
        image: "https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 0,
        portionSize: "compartir"
      },
      {
        _id: "dish_019",
        name: "Flan de la Abuela",
        description: "Postre tradicional español con caramelo casero",
        ingredients: ["huevos", "leche", "azúcar", "vainilla"],
        tags: ["postre", "española", "tradicional", "dulce"],
        price: 5.50,
        category: "postre",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=300&fit=crop",
        cookingTime: 5,
        spicyLevel: 0,
        portionSize: "individual"
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
    deliveryTime: "20-30 min",
    minOrder: 25.00,
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
        spicyLevel: 1,
        portionSize: "individual"
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
        spicyLevel: 2,
        portionSize: "individual"
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
        spicyLevel: 0,
        portionSize: "compartir"
      },
      {
        _id: "dish_020",
        name: "Tempura de Verduras",
        description: "Verduras rebozadas en tempura ligera y crujiente",
        ingredients: ["calabacín", "berenjena", "pimiento", "tempura", "salsa tentsuyu"],
        tags: ["vegetariano", "japonés", "crujiente", "ligero"],
        price: 13.50,
        category: "tempura",
        image: "https://images.unsplash.com/photo-1562158147-cf176caa4217?w=500&h=300&fit=crop",
        cookingTime: 15,
        spicyLevel: 0,
        portionSize: "compartir"
      },
      {
        _id: "dish_021",
        name: "Nigiri Premium",
        description: "Selección de nigiri con los mejores pescados",
        ingredients: ["salmón", "atún", "langostino", "anguila", "arroz sushi"],
        tags: ["japonés", "premium", "crudo", "tradicional"],
        price: 28.00,
        category: "nigiri",
        image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500&h=300&fit=crop",
        cookingTime: 10,
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_022",
        name: "Mochi de Té Verde",
        description: "Postre japonés tradicional relleno de helado",
        ingredients: ["mochi", "helado té verde", "azúcar", "almidón"],
        tags: ["postre", "japonés", "dulce", "frío"],
        price: 7.00,
        category: "postre",
        image: "https://images.unsplash.com/photo-1563379091109-46e78589a88e?w=500&h=300&fit=crop",
        cookingTime: 3,
        spicyLevel: 0,
        portionSize: "individual"
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
    deliveryTime: "20-25 min",
    minOrder: 12.00,
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
        spicyLevel: 0,
        portionSize: "individual"
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
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_023",
        name: "Smoothie Bowl Tropical",
        description: "Bowl de açaí con frutas tropicales y granola",
        ingredients: ["açaí", "mango", "piña", "coco", "granola", "chía"],
        tags: ["vegano", "desayuno", "fresco", "antioxidante", "superfood"],
        price: 9.50,
        category: "bowl",
        image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=500&h=300&fit=crop",
        cookingTime: 8,
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_024",
        name: "Curry Verde de Verduras",
        description: "Curry tailandés con leche de coco y verduras frescas",
        ingredients: ["leche de coco", "curry verde", "calabacín", "berenjena", "pimiento", "albahaca"],
        tags: ["vegano", "picante", "asiático", "aromático"],
        price: 14.00,
        category: "curry",
        image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500&h=300&fit=crop",
        cookingTime: 18,
        spicyLevel: 3,
        portionSize: "individual"
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
    deliveryTime: "25-35 min",
    minOrder: 18.00,
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
        spicyLevel: 3,
        portionSize: "individual"
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
        spicyLevel: 2,
        portionSize: "individual"
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
        spicyLevel: 1,
        portionSize: "compartir"
      },
      {
        _id: "dish_025",
        name: "Biryani de Cordero",
        description: "Arroz basmati con cordero y especias aromáticas",
        ingredients: ["arroz basmati", "cordero", "azafrán", "canela", "cardamomo", "cebolla frita"],
        tags: ["indio", "con carne", "aromático", "festivo"],
        price: 18.50,
        category: "arroz",
        image: "https://images.unsplash.com/photo-1563379091109-46e78589a88e?w=500&h=300&fit=crop",
        cookingTime: 30,
        spicyLevel: 2,
        portionSize: "individual"
      },
      {
        _id: "dish_026",
        name: "Samosas Vegetales",
        description: "Empanadillas crujientes rellenas de verduras especiadas",
        ingredients: ["masa", "patatas", "guisantes", "especias", "cilantro"],
        tags: ["vegetariano", "indio", "entrante", "crujiente"],
        price: 7.50,
        category: "entrante",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 2,
        portionSize: "compartir"
      }
    ]
  },
  {
    _id: "rest_006",
    name: "Burger & Co",
    description: "Hamburguesas gourmet y comida americana",
    address: "Calle de Fuencarral 89, Madrid",
    phone: "+34 91 678 9012",
    cuisine: ["americana", "hamburguesas"],
    rating: 4.2,
    priceRange: "€€",
    deliveryTime: "15-25 min",
    minOrder: 10.00,
    dishes: [
      {
        _id: "dish_027",
        name: "Burger Clásica",
        description: "Hamburguesa de ternera con queso, lechuga y tomate",
        ingredients: ["carne de ternera", "queso cheddar", "lechuga", "tomate", "cebolla", "pan brioche"],
        tags: ["americana", "con carne", "clásico", "popular"],
        price: 12.50,
        category: "hamburguesa",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 0,
        portionSize: "individual"
      },
      {
        _id: "dish_028",
        name: "Alitas BBQ",
        description: "Alitas de pollo con salsa barbacoa casera",
        ingredients: ["alitas de pollo", "salsa bbq", "especias", "miel"],
        tags: ["americana", "con carne", "picante", "para compartir"],
        price: 9.50,
        category: "entrante",
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&h=300&fit=crop",
        cookingTime: 18,
        spicyLevel: 2,
        portionSize: "compartir"
      },
      {
        _id: "dish_029",
        name: "Patatas Fritas Loaded",
        description: "Patatas fritas con queso, bacon y jalapeños",
        ingredients: ["patatas", "queso cheddar", "bacon", "jalapeños", "cebollino"],
        tags: ["americana", "con carne", "para compartir", "indulgente"],
        price: 8.50,
        category: "acompañamiento",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&h=300&fit=crop",
        cookingTime: 10,
        spicyLevel: 1,
        portionSize: "compartir"
      },
      {
        _id: "dish_030",
        name: "Milkshake de Oreo",
        description: "Batido cremoso con galletas Oreo",
        ingredients: ["helado vainilla", "leche", "galletas oreo", "nata"],
        tags: ["bebida", "dulce", "frío", "popular"],
        price: 5.50,
        category: "bebida",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&h=300&fit=crop",
        cookingTime: 5,
        spicyLevel: 0,
        portionSize: "individual"
      }
    ]
  },
  {
    _id: "rest_007",
    name: "Taco Libre",
    description: "Auténtica comida mexicana con sabores picantes",
    address: "Calle de la Cruz 34, Madrid",
    phone: "+34 91 543 2109",
    cuisine: ["mexicana", "picante"],
    rating: 4.4,
    priceRange: "€€",
    deliveryTime: "20-30 min",
    minOrder: 15.00,
    dishes: [
      {
        _id: "dish_031",
        name: "Tacos al Pastor",
        description: "Tacos tradicionales con carne de cerdo marinada",
        ingredients: ["tortilla maíz", "cerdo", "piña", "cebolla", "cilantro", "salsa verde"],
        tags: ["mexicana", "con carne", "picante", "tradicional"],
        price: 11.50,
        category: "tacos",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&h=300&fit=crop",
        cookingTime: 15,
        spicyLevel: 3,
        portionSize: "individual"
      },
      {
        _id: "dish_032",
        name: "Guacamole con Nachos",
        description: "Guacamole fresco con nachos de maíz caseros",
        ingredients: ["aguacate", "tomate", "cebolla", "limón", "cilantro", "nachos"],
        tags: ["vegetariano", "mexicana", "entrante", "fresco"],
        price: 8.00,
        category: "entrante",
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&h=300&fit=crop",
        cookingTime: 8,
        spicyLevel: 1,
        portionSize: "compartir"
      },
      {
        _id: "dish_033",
        name: "Quesadilla de Pollo",
        description: "Quesadilla grande con pollo y queso derretido",
        ingredients: ["tortilla harina", "pollo", "queso mexicano", "pimientos", "cebolla"],
        tags: ["mexicana", "con carne", "queso", "sustancioso"],
        price: 13.00,
        category: "quesadilla",
        image: "https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=500&h=300&fit=crop",
        cookingTime: 12,
        spicyLevel: 2,
        portionSize: "individual"
      },
      {
        _id: "dish_034",
        name: "Churros con Dulce de Leche",
        description: "Churros caseros con dulce de leche argentino",
        ingredients: ["harina", "azúcar", "canela", "dulce de leche"],
        tags: ["postre", "dulce", "casero", "caliente"],
        price: 6.50,
        category: "postre",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        cookingTime: 10,
        spicyLevel: 0,
        portionSize: "compartir"
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