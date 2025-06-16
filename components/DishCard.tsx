'use client'

import { Card, CardBody, CardFooter, Image, Chip, Button } from '@heroui/react'

interface Dish {
  _id: string
  name: string
  description: string
  ingredients: string[]
  tags: string[]
  price: number
  image: string
  restaurant: {
    name: string
    address: string
  }
}

interface DishCardProps {
  dish: Dish
  onAddToCart?: () => void
  showAddButton?: boolean
}

export function DishCard({ dish, onAddToCart, showAddButton = false }: DishCardProps) {
  return (
    <Card className="max-w-md hover:scale-105 transition-transform duration-200">
      <CardBody className="p-0">
        <Image
          alt={dish.name}
          className="object-cover w-full h-48"
          src={dish.image}
          width="100%"
        />
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{dish.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</p>
            <div className="flex flex-wrap gap-1">
              {dish.ingredients.slice(0, 3).map((ingredient, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="text-xs"
                >
                  {ingredient}
                </Chip>
              ))}
              {dish.ingredients.length > 3 && (
                <Chip size="sm" variant="flat" color="default" className="text-xs">
                  +{dish.ingredients.length - 3} más
                </Chip>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {dish.tags.map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="dot"
                  color="primary"
                  className="text-xs"
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="justify-between bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-700">{dish.restaurant.name}</p>
          <p className="text-xs text-gray-500">{dish.restaurant.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-primary">{dish.price.toFixed(2)}€</p>
          {showAddButton && onAddToCart && (
            <Button 
              color="primary" 
              size="sm"
              onPress={onAddToCart}
            >
              Añadir
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 