'use client'

import { Card, CardBody, Button, Chip, Divider } from '@heroui/react'

interface Dish {
  _id: string
  name: string
  description: string
  price: number
  image: string
  tags?: string[]
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
  dishes: Dish[]
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onAddToCart: (item: any) => void
}

export function RestaurantCard({ restaurant, onAddToCart }: RestaurantCardProps) {
  const handleAddToCart = (dish: Dish) => {
    onAddToCart({
      id: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      type: 'dish' as const,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name
    })
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <CardBody className="p-0">
        {/* Header del restaurante */}
        <div className="flex p-4 border-b border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{restaurant.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">{restaurant.rating}</span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{restaurant.deliveryTime}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{restaurant.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Platos disponibles */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Platos disponibles</h4>
          <div className="space-y-3">
            {restaurant.dishes?.slice(0, 4).map((dish) => (
              <div key={dish._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-900 text-sm mb-1 truncate">{dish.name}</h5>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">{dish.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">€{dish.price.toFixed(2)}</span>
                      {dish.tags && dish.tags.length > 0 && (
                        <Chip size="sm" variant="flat" className="text-xs">
                          {dish.tags[0]}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold ml-3"
                  onPress={() => handleAddToCart(dish)}
                >
                  Añadir
                </Button>
              </div>
            ))}
          </div>
          
          {restaurant.dishes && restaurant.dishes.length > 4 && (
            <div className="mt-4 text-center">
              <Button 
                variant="light" 
                size="sm"
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Ver todos los platos ({restaurant.dishes.length})
              </Button>
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {restaurant.cuisine.map((type, index) => (
              <Chip 
                key={index} 
                size="sm" 
                variant="flat" 
                className="bg-gray-100 text-gray-700 text-xs"
              >
                {type}
              </Chip>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            <p>📍 {restaurant.address}</p>
            <p>📞 {restaurant.phone}</p>
            <p>💳 Pedido mínimo: €{restaurant.minOrder}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
} 