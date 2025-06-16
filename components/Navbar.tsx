'use client'

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Badge } from '@heroui/react'

interface NavbarComponentProps {
  cartItemsCount: number
}

export function NavbarComponent({ cartItemsCount }: NavbarComponentProps) {
  return (
    <Navbar 
      maxWidth="full" 
      className="bg-white border-b border-gray-200 shadow-sm"
      height="72px"
    >
      <NavbarBrand>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 rounded-lg p-2">
            <span className="text-2xl font-bold text-black">K</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">Komi</span>
        </div>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Button 
            variant="light" 
            className="text-gray-700 font-medium hover:text-yellow-600"
          >
            Restaurantes
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button 
            variant="light" 
            className="text-gray-700 font-medium hover:text-yellow-600"
          >
            Categorías
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button 
            variant="light" 
            className="text-gray-700 font-medium hover:text-yellow-600"
          >
            Ofertas
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            variant="light" 
            className="text-gray-700 font-medium hover:text-yellow-600"
          >
            Iniciar sesión
          </Button>
        </NavbarItem>
        <NavbarItem>
          <div className="relative">
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold min-w-unit-20"
            >
              🛒 Carrito
            </Button>
            {cartItemsCount > 0 && (
              <Badge 
                color="danger" 
                size="sm"
                className="absolute -top-1 -right-1 bg-red-500 text-white"
              >
                {cartItemsCount}
              </Badge>
            )}
          </div>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
} 