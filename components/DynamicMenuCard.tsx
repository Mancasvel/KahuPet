'use client'

import { Card, CardBody, Button, Chip, Divider } from '@heroui/react'

interface Dish {
  _id: string
  name: string
  description: string
  price: number
  image: string
  restaurant?: {
    _id: string
    name: string
  }
}

interface DynamicMenuCardProps {
  dishes: Dish[]
  groupSuggestion: {
    people: number
    explanation: string
    funnyResponse: string
  }
  onAddAllToCart: () => void
}

export function DynamicMenuCard({ dishes, groupSuggestion, onAddAllToCart }: DynamicMenuCardProps) {
  const totalPrice = dishes.reduce((sum, dish) => sum + dish.price, 0)
  const averagePrice = totalPrice / dishes.length
  const restaurantName = dishes.length > 0 ? dishes[0].restaurant?.name : 'Restaurante'

  return (
    <Card className="w-full bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 border-3 border-orange-300 shadow-xl">
      <CardBody className="p-8">
        {/* Respuesta graciosa prominente */}
        <div className="text-center mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2">
            🎉 ¡Menú Recomendado! 🎉
          </h2>
          <p className="text-xl font-medium mb-2">
            {groupSuggestion.funnyResponse}
          </p>
          <p className="text-sm opacity-90">
            Especialmente curado para {groupSuggestion.people} personas
          </p>
        </div>

        {/* Info del restaurante */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            📍 {restaurantName}
          </h3>
          <p className="text-sm text-gray-600">
            {groupSuggestion.explanation}
          </p>
        </div>

        <Divider className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {dishes.map((dish, index) => (
            <div key={dish._id} className="bg-white rounded-lg p-4 shadow-sm">
              <img 
                src={dish.image} 
                alt={dish.name}
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <h4 className="font-semibold text-sm mb-1">{dish.name}</h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">€{dish.price.toFixed(2)}</span>
                <Chip color="primary" size="sm" variant="flat">
                  Plato {index + 1}
                </Chip>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total del menú:</span>
            <span className="text-xl font-bold text-green-600">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Precio promedio por plato:</span>
            <span className="text-sm font-medium text-gray-700">€{averagePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ahorro vs individual:</span>
            <span className="text-sm font-medium text-green-600">
              ¡Menú ya optimizado! 🎉
            </span>
          </div>
        </div>

        <Button 
          color="primary" 
          size="lg"
          className="w-full"
          onPress={onAddAllToCart}
        >
          🛒 Añadir Todo el Menú al Carrito (€{totalPrice.toFixed(2)})
        </Button>
      </CardBody>
    </Card>
  )
} 