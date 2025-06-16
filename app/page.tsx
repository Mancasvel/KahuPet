'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input, Button, Card, CardBody, Divider, Spinner, Badge } from '@heroui/react'
import { RestaurantCard } from '@/components/RestaurantCard'
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
  useEffect(() => {
    loadAllRestaurants()
  }, [loadAllRestaurants])

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
    <div className="min-h-screen bg-white">
      {/* Navbar estilo Glovo */}
      <NavbarComponent cartItemsCount={totalCartItems} />
      
      {/* Hero Section estilo Glovo - MÁS GRANDE Y CENTRADO */}
      <section className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 text-white min-h-[70vh] flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Comida a domicilio y mucho más
            </h1>
            <p className="text-2xl md:text-3xl mb-12 font-light max-w-3xl mx-auto">
              Restaurantes, comida rápida, ¡lo que sea!
            </p>
            
            {/* Barra de búsqueda principal estilo Glovo - CENTRADA */}
            <div className="bg-white rounded-lg p-3 shadow-2xl max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Introduce tu dirección para saber qué hay cerca de ti"
                    size="lg"
                    classNames={{
                      input: "text-gray-700 text-lg",
                      inputWrapper: "bg-white border-0 shadow-none h-16"
                    }}
                    startContent={<span className="text-gray-400 text-xl">📍</span>}
                  />
                </div>
                <Button 
                  color="primary" 
                  size="lg"
                  onPress={searchDishes}
                  isDisabled={isLoading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-16 px-10 text-lg"
                >
                  {isLoading ? <Spinner size="sm" /> : 'Buscar'}
                </Button>
              </div>
              
              {/* Enlaces de ejemplo - CENTRADOS */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button 
                  size="sm" 
                  variant="light" 
                  className="text-gray-600 text-sm h-10 px-4 hover:bg-gray-100 rounded-full" 
                  onPress={() => setQuery("somos 4 y queremos pizza")}
                >
                  Pizza para 4 personas
                </Button>
                <Button 
                  size="sm" 
                  variant="light" 
                  className="text-gray-600 text-sm h-10 px-4 hover:bg-gray-100 rounded-full" 
                  onPress={() => setQuery("comida vegana para 2")}
                >
                  Comida vegana
                </Button>
                <Button 
                  size="sm" 
                  variant="light" 
                  className="text-gray-600 text-sm h-10 px-4 hover:bg-gray-100 rounded-full" 
                  onPress={() => setQuery("algo barato y rápido")}
                >
                  Rápido y barato
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marcas populares estilo Glovo */}
      {!isLoading && restaurants.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Los mejores restaurantes</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {restaurants.slice(0, 8).map((restaurant) => (
                <div key={restaurant._id} className="flex-none">
                  <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <p className="text-xs text-center mt-2 w-20 truncate">{restaurant.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Estado de búsqueda */}
        {(summary || isLoading) && (
          <div className="mb-6">
            <Card className="border-0 shadow-sm">
              <CardBody className="py-4">
                <div className="flex items-center gap-3">
                  {isMCPMode ? (
                    <Badge color="success" variant="flat" className="bg-green-100 text-green-700">
                      🤖 IA Activada
                    </Badge>
                  ) : (
                    <Badge color="warning" variant="flat" className="bg-yellow-100 text-yellow-700">
                      🧪 Modo Demo
                    </Badge>
                  )}
                  <span className="text-gray-700">
                    {isLoading ? 'Buscando los mejores restaurantes cerca de ti...' : summary}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Área principal */}
          <div className="flex-1">
            {/* Menú dinámico generado por IA */}
            {dynamicMenu.length > 0 && groupSuggestion && (
              <div className="mb-8">
                <DynamicMenuCard
                  dishes={dynamicMenu}
                  groupSuggestion={groupSuggestion}
                  onAddAllToCart={() => handleAddMenuToCart(dynamicMenu)}
                />
              </div>
            )}

            {/* Lista de restaurantes estilo Glovo */}
            {isLoading ? (
              <div className="text-center py-16">
                <Spinner size="lg" className="text-yellow-500" />
                <p className="mt-4 text-gray-600">Analizando tu solicitud...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardBody className="text-center py-16">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">No encontramos restaurantes</h3>
                      <p className="text-gray-600 mb-6">
                        Intenta con una búsqueda diferente o explora todos los restaurantes disponibles.
                      </p>
                      <Button 
                        color="primary" 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                        onPress={loadAllRestaurants}
                      >
                        Ver todos los restaurantes
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {restaurants.length} restaurantes disponibles
                      </h2>
                    </div>
                    {restaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant._id}
                        restaurant={restaurant}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 