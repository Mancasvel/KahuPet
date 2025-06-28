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
  Avatar,
  Badge,
  Chip
} from '@heroui/react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { AuthModal } from './AuthModal'

interface NavbarComponentProps {
  onRegisterPet?: () => void
}

export function NavbarComponent({ onRegisterPet }: NavbarComponentProps) {
  const { user, logout, loading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const handleLogin = () => {
    setAuthModalMode('login')
    setIsAuthModalOpen(true)
  }

  const handleRegister = () => {
    setAuthModalMode('register')
    setIsAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
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
                Kahupet
              </span>
              <span className="text-xs text-gray-500">Entiende a tu mascota</span>
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
          {user ? (
            // Usuario autenticado
            <>
              {/* Botón de mascotas */}
              <NavbarItem className="hidden sm:flex">
                {user.petCount > 0 ? (
                  <Link href="/mascotas">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                      startContent={<span>🐾</span>}
                      endContent={
                        <Chip size="sm" variant="flat" className="bg-white/20 text-white text-xs">
                          {user.petCount}/5
                        </Chip>
                      }
                    >
                      Gestionar mascotas
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={onRegisterPet}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    startContent={<span>🐾</span>}
                  >
                    Registra tu primera mascota
                  </Button>
                )}
              </NavbarItem>

              {/* Dropdown de usuario */}
              <NavbarItem>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="light" className="p-2 min-w-0">
                      <Badge 
                        content={user.petCount > 0 ? user.petCount : ''} 
                        color="primary" 
                        size="sm"
                        isInvisible={user.petCount === 0}
                      >
                        <Avatar
                          size="sm"
                          name={getUserInitials(user.name)}
                          classNames={{
                            base: "bg-gradient-to-r from-blue-500 to-purple-500",
                            name: "text-white font-semibold"
                          }}
                        />
                      </Badge>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu">
                    <DropdownItem key="profile" textValue="profile" className="h-14 gap-2">
                      <div className="flex flex-col">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="divider" textValue="divider">
                      <div className="w-full h-px bg-gray-200" />
                    </DropdownItem>
                    <DropdownItem key="pets" startContent={<span>🐾</span>} textValue="pets" href="/mascotas">
                      Mis mascotas ({user.petCount}/5)
                    </DropdownItem>
                    <DropdownItem key="plans" startContent={<span>📋</span>} textValue="plans">
                      Mis planes
                    </DropdownItem>
                    <DropdownItem key="history" startContent={<span>📖</span>} textValue="history">
                      Historial
                    </DropdownItem>
                    <DropdownItem key="settings" startContent={<span>⚙️</span>} textValue="settings">
                      Configuración
                    </DropdownItem>
                    <DropdownItem key="help" startContent={<span>❓</span>} textValue="help">
                      Ayuda
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      className="text-danger" 
                      startContent={<span>🚪</span>}
                      onClick={handleLogout}
                      textValue="logout"
                    >
                      Cerrar sesión
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            </>
          ) : (
            // Usuario no autenticado
            <>
              <NavbarItem className="hidden sm:flex">
                <Button
                  variant="light"
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Iniciar Sesión
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  startContent={<span>🐾</span>}
                >
                  Registrarse
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  )
} 