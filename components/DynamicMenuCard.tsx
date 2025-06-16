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
    <Card className="w-full border-0 shadow-md bg-white">
      <CardBody className="p-0">
        {/* Header con respuesta de IA */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white rounded-full p-2">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Menú recomendado por IA</h2>
              <p className="text-sm opacity-80">Especialmente curado para {groupSuggestion.people} personas</p>
            </div>
          </div>
          <p className="text-lg font-medium">
            {groupSuggestion.funnyResponse}
          </p>
        </div>

        <div className="p-6">
          {/* Info del restaurante */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{restaurantName}</h3>
              <p className="text-sm text-gray-600">{groupSuggestion.explanation}</p>
            </div>
          </div>

          {/* Grid de platos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {dishes.map((dish, index) => (
              <div key={dish._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="relative mb-3">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Chip 
                    size="sm" 
                    className="absolute top-2 right-2 bg-yellow-400 text-black font-semibold"
                  >
                    #{index + 1}
                  </Chip>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{dish.name}</h4>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">€{dish.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">Por persona</span>
                </div>
              </div>
            ))}
          </div>

          <Divider className="my-6" />

          {/* Resumen de precios */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Por persona:</span>
                <span className="font-medium text-gray-900">€{averagePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium text-gray-900">€2.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Personas:</span>
                <span className="font-medium text-gray-900">{groupSuggestion.people}</span>
              </div>
            </div>
            <Divider className="my-3" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">€{(totalPrice + 2.50).toFixed(2)}</span>
            </div>
          </div>

          {/* Botón de acción */}
          <Button 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            size="lg"
            onPress={onAddAllToCart}
          >
            Añadir menú completo al carrito
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            ✨ Menú optimizado por IA • Entrega en 25-35 min
          </p>
        </div>
      </CardBody>
    </Card>
  )
} 