'use client'

import { useState, useCallback } from 'react'
import { Input, Button, Card, CardBody, Divider, Spinner, Badge } from '@heroui/react'
import { RestaurantCard } from '@/components/RestaurantCard'
import { CartComponent } from '@/components/CartComponent'
import { DynamicMenuCard } from '@/components/DynamicMenuCard'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'dish' | 'menu'
  restaurantId: string
  restaurantName: string
}

interface Restaurant {
  _id: string
  name: string
  description: string
  address: string
  phone: string
  cuisine: string[]
  rating: number
  priceRange: string
  deliveryTime: string
  minOrder: number
  dishes: any[]
  groupMenus?: any[]
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [isMCPMode, setIsMCPMode] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [groupSuggestion, setGroupSuggestion] = useState<any>(null)
  const [dynamicMenu, setDynamicMenu] = useState<any[]>([])

  // Cargar todos los restaurantes al inicio
  const loadAllRestaurants = useCallback(async () => {
    try {
      const response = await fetch('/api/restaurants')
      if (response.ok) {
        const data = await response.json()
        setAllRestaurants(data)
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Error cargando restaurantes:', error)
    }
  }, [])

  // Cargar restaurantes al montar el componente
  useState(() => {
    loadAllRestaurants()
  })

  const searchDishes = async () => {
    if (!query.trim()) {
      setRestaurants(allRestaurants)
      setSummary('')
      setGroupSuggestion(null)
      return
    }

    setIsLoading(true)
    setSummary('')
    setGroupSuggestion(null)
    setDynamicMenu([])
    
    try {
      // Intentar primero con MCP (LLM + Base de datos)
      const mcpResponse = await fetch('/api/mcp-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (mcpResponse.ok) {
        const mcpData = await mcpResponse.json()
        
        setIsMCPMode(true)
        setSummary(mcpData.summary || `Resultados para: "${query}"`)
        setGroupSuggestion(mcpData.groupSuggestion)
        setDynamicMenu(mcpData.dynamicMenu || [])

        // Si hay restaurantes específicos recomendados, usarlos
        if (mcpData.restaurants && mcpData.restaurants.length > 0) {
          setRestaurants(mcpData.restaurants)
        } else {
          // Filtrar restaurantes que tengan platos recomendados
          const dishRestaurantIds = new Set(mcpData.dishes?.map((dish: any) => dish.restaurant._id) || [])
          const filteredRestaurants = allRestaurants.filter(restaurant => 
            dishRestaurantIds.has(restaurant._id)
          )
          setRestaurants(filteredRestaurants.length > 0 ? filteredRestaurants : allRestaurants)
        }
        
        return
      }

      // Fallback al modo demo
      console.log('MCP falló, usando modo demo')
      setIsMCPMode(false)
      
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(`🧪 Modo Demo - ${data.summary || `Resultados para: "${query}"`}`)
        
        // Filtrar restaurantes basado en platos encontrados
        const dishRestaurantIds = new Set(data.dishes?.map((dish: any) => dish.restaurant._id) || [])
        const filteredRestaurants = allRestaurants.filter(restaurant => 
          dishRestaurantIds.has(restaurant._id)
        )
        setRestaurants(filteredRestaurants.length > 0 ? filteredRestaurants : allRestaurants)
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setSummary('Error en la búsqueda. Mostrando todos los restaurantes.')
      setRestaurants(allRestaurants)
      setIsMCPMode(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && i.restaurantId === item.restaurantId)
      
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id && i.restaurantId === item.restaurantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        return [...prevItems, item]
      }
    })
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== id))
    } else {
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  const handleAddMenuToCart = (dishes: any[]) => {
    dishes.forEach(dish => {
      handleAddToCart({
        id: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        type: 'dish',
        restaurantId: dish.restaurant._id,
        restaurantName: dish.restaurant.name
      })
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDishes()
    }
  }

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Navbar */}
      <NavbarComponent cartItemsCount={totalCartItems} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header mejorado */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
              🍽️ Komi
            </h1>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">🌟</div>
          </div>
          <p className="text-xl text-gray-700 mb-4 font-medium">
            Descubre los mejores restaurantes y crea menús perfectos
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Nuestra IA inteligente analiza tus preferencias y crea menús personalizados para cualquier ocasión. 
            ¡Solo dinos qué quieres y nosotros nos encargamos del resto!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Área principal */}
          <div className="flex-1">
            {/* Barra de búsqueda mejorada */}
            <div className="mb-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="¿Qué te apetece comer hoy? Ej: 'somos 3 personas y queremos comida italiana', 'quiero algo vegano y barato', 'sushi para 2'"
                      size="lg"
                      className="flex-1"
                      startContent={<span className="text-xl">🔍</span>}
                      classNames={{
                        input: "text-lg",
                        inputWrapper: "bg-gray-50 border-2 border-gray-200 hover:border-orange-300 focus-within:border-orange-500"
                      }}
                    />
                    <Button 
                      color="primary" 
                      size="lg"
                      onPress={searchDishes}
                      isDisabled={isLoading}
                      className="bg-gradient-to-r from-orange-500 to-red-500 font-semibold text-white min-w-32 shadow-lg hover:shadow-xl transition-all"
                    >
                      {isLoading ? <Spinner size="sm" color="white" /> : '🚀 Buscar'}
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-xs text-gray-500">Ejemplos populares:</span>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      className="text-xs h-6 hover:bg-orange-100" 
                      onPress={() => setQuery("somos 4 y queremos pizza")}
                    >
                      somos 4 y queremos pizza
                    </Button>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      className="text-xs h-6 hover:bg-orange-100" 
                      onPress={() => setQuery("comida vegana para 2")}
                    >
                      comida vegana para 2
                    </Button>
                    <Button 
                      size="sm" 
                      variant="flat" 
                      className="text-xs h-6 hover:bg-orange-100" 
                      onPress={() => setQuery("algo barato y rápido")}
                    >
                      algo barato y rápido
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de conexión y resumen */}
            {(summary || isLoading) && (
              <Card className="mb-6">
                <CardBody>
                  <div className="flex items-center gap-2">
                    {isMCPMode ? (
                      <Badge color="success" variant="flat">🤖 IA + Base de Datos</Badge>
                    ) : (
                      <Badge color="warning" variant="flat">🧪 Modo Demo</Badge>
                    )}
                    <span className="text-gray-700">
                      {isLoading ? 'Buscando los mejores restaurantes...' : summary}
                    </span>
                  </div>
                  

                </CardBody>
              </Card>
            )}

            {/* Menú dinámico generado por IA */}
            {dynamicMenu.length > 0 && groupSuggestion && (
              <div className="mb-6">
                <DynamicMenuCard
                  dishes={dynamicMenu}
                  groupSuggestion={groupSuggestion}
                  onAddAllToCart={() => handleAddMenuToCart(dynamicMenu)}
                />
              </div>
            )}

            {/* Lista de restaurantes */}
            {isLoading ? (
              <div className="text-center py-12">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Analizando tu solicitud...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {restaurants.length === 0 ? (
                  <Card>
                    <CardBody className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold mb-2">No se encontraron restaurantes</h3>
                      <p className="text-gray-600">
                        Intenta con una búsqueda diferente o carga los datos iniciales.
                      </p>
                      <Button 
                        color="primary" 
                        className="mt-4"
                        onPress={loadAllRestaurants}
                      >
                        Cargar todos los restaurantes
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant._id}
                      restaurant={restaurant}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Carrito lateral */}
          <div className="lg:w-80">
            <div className="sticky top-8">
              <CartComponent
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 