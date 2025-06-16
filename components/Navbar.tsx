'use client'

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Badge } from '@heroui/react'

interface NavbarComponentProps {
  cartItemsCount?: number
}

export function NavbarComponent({ cartItemsCount = 0 }: NavbarComponentProps) {
  return (
    <Navbar className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg" maxWidth="full">
      <NavbarBrand>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍽️</span>
          <p className="font-bold text-white text-2xl">Komi</p>
        </div>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <Link 
            href="#" 
            className="text-white hover:text-orange-100 font-medium transition-colors"
          >
            🏠 Inicio
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link 
            href="#" 
            className="text-white hover:text-orange-100 font-medium transition-colors"
          >
            🍕 Restaurantes
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link 
            href="#" 
            className="text-white hover:text-orange-100 font-medium transition-colors"
          >
            👥 Menús Grupales
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link 
            href="#" 
            className="text-white hover:text-orange-100 font-medium transition-colors"
          >
            ⭐ Favoritos
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link 
            href="#" 
            className="text-white hover:text-orange-100 font-medium transition-colors"
          >
            📞 Contacto
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button 
            className="bg-white text-orange-500 font-semibold hover:bg-orange-50 relative"
            variant="flat"
          >
            🛒 Carrito
            {cartItemsCount > 0 && (
              <Badge 
                color="danger" 
                className="absolute -top-1 -right-1"
                size="sm"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
} 