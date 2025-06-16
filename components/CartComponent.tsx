'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Badge, Divider, Input, Textarea, Select, SelectItem } from '@heroui/react'

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
  cartItems: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
}

export function CartComponent({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'card'
  })

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Agrupar por restaurante
  const itemsByRestaurant = cartItems.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      }
    }
    acc[item.restaurantId].items.push(item)
    return acc
  }, {} as Record<string, { restaurantName: string, items: CartItem[] }>)

  const restaurantCount = Object.keys(itemsByRestaurant).length

  const handleSubmitOrder = () => {
    if (!orderForm.name || !orderForm.phone || !orderForm.address) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    // Simular envío de pedido
    console.log('Pedido enviado:', {
      items: cartItems,
      customer: orderForm,
      total: totalPrice,
      restaurants: itemsByRestaurant
    })

    alert(`¡Pedido confirmado! Total: €${totalPrice.toFixed(2)}\nRecibirás una confirmación por WhatsApp en el ${orderForm.phone}`)
    onClearCart()
    onOpenChange()
  }

  if (cartItems.length === 0) {
    return (
      <Card className="w-80">
        <CardBody className="text-center py-8">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600">Tu carrito está vacío</p>
          <p className="text-sm text-gray-500 mt-2">Añade platos o menús para empezar tu pedido</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-80">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-bold">Carrito</h3>
            <Badge color="primary" content={totalItems}>
              <div className="text-2xl">🛒</div>
            </Badge>
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          {restaurantCount > 1 && (
            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-4">
              <p className="text-sm text-orange-700">
                ⚠️ Tienes productos de {restaurantCount} restaurantes. 
                Considera hacer pedidos separados para mejor servicio.
              </p>
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(itemsByRestaurant).map(([restaurantId, group]) => (
              <div key={restaurantId}>
                <h4 className="font-semibold text-gray-700 mb-2">{group.restaurantName}</h4>
                {group.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{item.name}</h5>
                      <p className="text-xs text-gray-600">
                        {item.type === 'menu' ? '🍽️ Menú' : '🍕 Plato individual'}
                      </p>
                      <p className="text-sm font-bold text-primary">€{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        isDisabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => onRemoveItem(item.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                ))}
                <Divider className="my-3" />
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-xl font-bold text-primary">€{totalPrice.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Button
                color="primary"
                className="w-full"
                onPress={onOpen}
                size="lg"
              >
                Realizar Pedido
              </Button>
              <Button
                color="danger"
                variant="light"
                className="w-full"
                onPress={onClearCart}
                size="sm"
              >
                Vaciar Carrito
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal de pedido */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Confirmar Pedido</h3>
              </ModalHeader>
              <ModalBody>
                {/* Resumen del pedido */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Resumen del Pedido</h4>
                  {Object.entries(itemsByRestaurant).map(([restaurantId, group]) => (
                    <div key={restaurantId} className="bg-gray-50 p-4 rounded-lg mb-3">
                      <h5 className="font-medium text-gray-700 mb-2">{group.restaurantName}</h5>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Formulario de datos */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Datos de Entrega</h4>
                  
                  <Input
                    label="Nombre completo *"
                    placeholder="Tu nombre"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                  />
                  
                  <Input
                    label="Teléfono *"
                    placeholder="+34 600 000 000"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  />
                  
                  <Textarea
                    label="Dirección de entrega *"
                    placeholder="Calle, número, piso, código postal, ciudad"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                  />
                  
                  <Textarea
                    label="Notas para el repartidor"
                    placeholder="Instrucciones especiales, alergias, etc."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  />
                  
                  <Select
                    label="Método de pago"
                    selectedKeys={[orderForm.paymentMethod]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      setOrderForm({...orderForm, paymentMethod: value})
                    }}
                  >
                    <SelectItem key="card">Tarjeta (pago online)</SelectItem>
                    <SelectItem key="cash">Efectivo (pago en entrega)</SelectItem>
                    <SelectItem key="bizum">Bizum</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSubmitOrder}>
                  Confirmar Pedido - €{totalPrice.toFixed(2)}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
} 