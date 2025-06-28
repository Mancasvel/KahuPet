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
        className="bg-white/95 backdrop-blur-md border-b border-slate-200"
        classNames={{
          wrapper: "max-w-6xl px-4 sm:px-6 lg:px-8",
        }}
        height="72px"
        maxWidth="full"
      >
        {/* Logo y Nombre */}
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900">
                Kahupet
              </span>
              <span className="text-xs text-slate-500 -mt-1">Entiende a tu mascota</span>
            </div>
          </Link>
        </NavbarBrand>

        {/* Contenido central - navegación */}
        <NavbarContent className="hidden lg:flex gap-1" justify="center">
          <NavbarItem>
            <Link href="/entrenamiento">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Entrenamiento
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/nutricion">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Nutrición
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/bienestar">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Bienestar
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/veterinarios">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Veterinarios
              </Button>
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Contenido derecho */}
        <NavbarContent justify="end" className="gap-3">
          {user ? (
            // Usuario autenticado
            <>
              {/* Botón de mascotas */}
              <NavbarItem className="hidden sm:flex">
                {user.petCount > 0 ? (
                  <Link href="/mascotas">
                    <Button
                      variant="bordered"
                      className="border-slate-200 hover:border-slate-300 text-slate-700 font-medium"
                      endContent={
                        <Chip 
                          size="sm" 
                          variant="flat" 
                          className="bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {user.petCount}/5
                        </Chip>
                      }
                    >
                      Mis mascotas
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={onRegisterPet}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    Registrar mascota
                  </Button>
                )}
              </NavbarItem>

              {/* Dropdown de usuario */}
              <NavbarItem>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button variant="light" className="p-1 min-w-0 h-auto">
                      <Avatar
                        size="sm"
                        name={getUserInitials(user.name)}
                        classNames={{
                          base: "bg-slate-100 text-slate-700",
                          name: "font-medium text-sm"
                        }}
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu" className="w-56">
                    <DropdownItem key="profile" textValue="profile" className="h-12 gap-3">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="divider" textValue="divider">
                      <div className="w-full h-px bg-slate-200" />
                    </DropdownItem>
                    <DropdownItem 
                      key="pets" 
                      startContent={<span className="text-slate-400">🐾</span>} 
                      textValue="pets" 
                      href="/mascotas"
                      className="text-slate-700"
                    >
                      Mis mascotas ({user.petCount}/5)
                    </DropdownItem>
                    <DropdownItem 
                      key="plans" 
                      startContent={<span className="text-slate-400">📋</span>} 
                      textValue="plans"
                      className="text-slate-700"
                    >
                      Mis planes
                    </DropdownItem>
                    <DropdownItem 
                      key="history" 
                      startContent={<span className="text-slate-400">📖</span>} 
                      textValue="history"
                      className="text-slate-700"
                    >
                      Historial
                    </DropdownItem>
                    <DropdownItem 
                      key="settings" 
                      startContent={<span className="text-slate-400">⚙️</span>} 
                      textValue="settings"
                      className="text-slate-700"
                    >
                      Configuración
                    </DropdownItem>
                    <DropdownItem 
                      key="help" 
                      startContent={<span className="text-slate-400">❓</span>} 
                      textValue="help"
                      className="text-slate-700"
                    >
                      Ayuda
                    </DropdownItem>
                    <DropdownItem 
                      key="logout" 
                      className="text-red-600" 
                      startContent={<span className="text-red-400">→</span>}
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
                  variant="ghost"
                  onClick={handleLogin}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Iniciar Sesión
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  onClick={handleRegister}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
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