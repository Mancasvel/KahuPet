'use client'

import { Card, CardHeader, CardBody, Button, Divider } from '@heroui/react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'dish' | 'menu'
  restaurantId: string
  restaurantName: string
}

interface CartComponentProps {
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
}

export function CartComponent({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }: CartComponentProps) {
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (cartItems.length === 0) {
    return (
      <Card className="w-full border-0 shadow-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">Tu carrito</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
            <p className="text-gray-400 text-xs mt-1">Añade algunos platos deliciosos</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg font-semibold text-gray-800">Tu carrito</h3>
          <Button 
            size="sm" 
            variant="light" 
            className="text-gray-500 hover:text-gray-700"
            onPress={onClearCart}
          >
            Limpiar
          </Button>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.restaurantId}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                <p className="text-xs text-gray-500 truncate">{item.restaurantName}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">€{item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <Button
                    size="sm"
                    variant="light"
                    className="min-w-8 h-8 text-gray-600 hover:text-gray-800"
                    onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-800 min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="light"
                    className="min-w-8 h-8 text-gray-600 hover:text-gray-800"
                    onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  className="min-w-8 h-8 text-gray-400 hover:text-red-500"
                  onPress={() => onRemoveItem(item.id)}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Divider className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Subtotal ({totalItems} items)</span>
            <span className="font-medium text-gray-900">€{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium text-gray-900">€2.50</span>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">€{(totalPrice + 2.50).toFixed(2)}</span>
          </div>
        </div>

        <Button 
          className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          size="lg"
        >
          Proceder al pago
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Tiempo estimado de entrega: 25-35 min
        </p>
      </CardBody>
    </Card>
  )
} 