'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Badge, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import { DishCard } from './DishCard'

interface Dish {
  _id: string
  name: string
  description: string
  ingredients: string[]
  tags: string[]
  price: number
  category: string
  image: string
  cookingTime: number
  spicyLevel: number
  portionSize: string
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

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'dish' | 'menu'
  restaurantId: string
  restaurantName: string
}

interface Props {
  restaurant: Restaurant
  onAddToCart: (item: CartItem) => void
}

export function RestaurantCard({ restaurant, onAddToCart }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(restaurant.dishes.map(dish => dish.category)))]
  
  // Filtrar platos por categoría
  const filteredDishes = selectedCategory === 'all' 
    ? restaurant.dishes 
    : restaurant.dishes.filter(dish => dish.category === selectedCategory)

  const handleAddDish = (dish: Dish) => {
    onAddToCart({
      id: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      type: 'dish',
      restaurantId: restaurant._id,
      restaurantName: restaurant.name
    })
  }



  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 4.0) return 'warning'
    return 'danger'
  }

  const getPriceRangeColor = (range: string) => {
    if (range === '€') return 'success'
    if (range === '€€') return 'warning'
    if (range === '€€€') return 'danger'
    return 'secondary'
  }

  return (
    <>
      <Card className="w-full shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-gray-800">{restaurant.name}</h3>
              <p className="text-gray-600">{restaurant.description}</p>
              <div className="flex gap-2 flex-wrap">
                {restaurant.cuisine.map((type) => (
                  <Chip key={type} color="primary" variant="flat" size="sm">
                    {type}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge color={getRatingColor(restaurant.rating)} content={restaurant.rating}>
                <div className="w-8 h-8" />
              </Badge>
              <Chip color={getPriceRangeColor(restaurant.priceRange)} size="sm">
                {restaurant.priceRange}
              </Chip>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-4">
          <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
            <span>📍 {restaurant.address}</span>
            <span>🚚 {restaurant.deliveryTime}</span>
            <span>💰 Mín: €{restaurant.minOrder}</span>
          </div>

          <Divider className="my-4" />



          {/* Platos individuales - Vista previa */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-700">🍕 Platos Individuales</h4>
            <Button color="primary" variant="flat" onPress={onOpen}>
              Ver todos los platos ({restaurant.dishes.length})
            </Button>
          </div>

          {/* Mostrar primeros 3 platos como preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {restaurant.dishes.slice(0, 3).map((dish) => (
              <div key={dish._id} className="border rounded-lg p-3">
                <img 
                  src={dish.image} 
                  alt={dish.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h5 className="font-medium text-sm mb-1">{dish.name}</h5>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">€{dish.price}</span>
                  <Button 
                    size="sm" 
                    color="primary"
                    onPress={() => handleAddDish(dish)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Modal con todos los platos */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{restaurant.name} - Carta Completa</h3>
                <p className="text-sm text-gray-600">{restaurant.description}</p>
              </ModalHeader>
              <ModalBody>
                {/* Filtros por categoría */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Filtrar por categoría:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Chip
                        key={category}
                        color={selectedCategory === category ? "primary" : "default"}
                        variant={selectedCategory === category ? "solid" : "flat"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === 'all' ? 'Todos' : category}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Grid de platos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDishes.map((dish) => (
                    <DishCard 
                      key={dish._id} 
                      dish={{
                        ...dish,
                        restaurant: {
                          name: restaurant.name,
                          address: restaurant.address
                        }
                      }} 
                      onAddToCart={() => handleAddDish(dish)}
                      showAddButton={true}
                    />
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
} 