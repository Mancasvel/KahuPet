'use client'

import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from '@heroui/react'
import { useState } from 'react'
import Link from 'next/link'

interface NavbarComponentProps {
  // Removido cartItemsCount ya que no hay carrito en Pawsitive
}

export function NavbarComponent({}: NavbarComponentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <Navbar 
      isBordered 
      className="bg-white/80 backdrop-blur-md border-blue-100"
      classNames={{
        wrapper: "max-w-7xl",
        brand: "text-blue-600",
        content: "text-gray-700"
      }}
    >
      {/* Logo y Nombre */}
      <NavbarBrand className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🐾</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pawsitive
            </span>
            <span className="text-xs text-gray-500">Bienestar para mascotas</span>
          </div>
        </Link>
      </NavbarBrand>

      {/* Contenido central - navegación */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarItem>
          <Link href="/entrenamiento">
            <Button
              variant="light"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              startContent={<span>🎓</span>}
            >
              Entrenamiento
            </Button>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/nutricion">
            <Button
              variant="light"
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
              startContent={<span>🥩</span>}
            >
              Nutrición
            </Button>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/bienestar">
            <Button
              variant="light"
              className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              startContent={<span>🧘</span>}
            >
              Bienestar
            </Button>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/veterinarios">
            <Button
              variant="light"
              className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              startContent={<span>🏥</span>}
            >
              Veterinarios
            </Button>
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Contenido derecho */}
      <NavbarContent justify="end">
        {/* Botón de registro de mascota */}
        <NavbarItem className="hidden sm:flex">
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            startContent={<span>🐾</span>}
          >
            Registra tu mascota
          </Button>
        </NavbarItem>

        {/* Dropdown de usuario */}
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" className="p-2 min-w-0">
                <Avatar
                  size="sm"
                  showFallback
                  fallback={<span className="text-lg">👤</span>}
                  classNames={{
                    base: "bg-gradient-to-r from-blue-100 to-purple-100",
                    fallback: "text-blue-600"
                  }}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="profile" startContent={<span>👤</span>}>
                Mi perfil
              </DropdownItem>
              <DropdownItem key="pets" startContent={<span>🐾</span>}>
                Mis mascotas
              </DropdownItem>
              <DropdownItem key="plans" startContent={<span>📋</span>}>
                Mis planes
              </DropdownItem>
              <DropdownItem key="history" startContent={<span>📖</span>}>
                Historial
              </DropdownItem>
              <DropdownItem key="settings" startContent={<span>⚙️</span>}>
                Configuración
              </DropdownItem>
              <DropdownItem key="help" startContent={<span>❓</span>}>
                Ayuda
              </DropdownItem>
              <DropdownItem key="logout" className="text-danger" startContent={<span>🚪</span>}>
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
} 