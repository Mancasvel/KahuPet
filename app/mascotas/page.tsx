'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip,
  Divider,
  Spinner 
} from '@heroui/react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import PetRegistrationForm from '@/components/PetRegistrationForm'

interface Pet {
  _id: string
  nombre: string
  tipo: 'perro' | 'gato'
  raza: string
  edad?: number
  peso?: number
  genero?: 'macho' | 'hembra'
  notas?: string
  createdAt: string
  updatedAt: string
}

export default function MascotasPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  // Cargar mascotas del usuario
  const loadUserPets = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/user-pets', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userPets = await response.json()
        setPets(userPets)
        console.log('🐾 Mascotas cargadas:', userPets.length)
      } else {
        console.error('Error cargando mascotas')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }
      loadUserPets()
    }
  }, [user, loading, router])

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet)
    setShowRegistrationForm(true)
  }

  const handleAddNewPet = () => {
    setEditingPet(null)
    setShowRegistrationForm(true)
  }

  const handleDeletePet = async (pet: Pet) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar a ${pet.nombre}? Esta acción no se puede deshacer.`)
    
    if (!confirmDelete) return
    
    try {
      const response = await fetch(`/api/user-pets?petId=${pet._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        loadUserPets() // Recargar lista
        refreshUser() // Actualizar contador en navbar
        console.log('🗑️ Mascota eliminada exitosamente')
      } else {
        console.error('Error eliminando mascota')
        alert('Error al eliminar la mascota. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error eliminando mascota:', error)
      alert('Error al eliminar la mascota. Por favor intenta de nuevo.')
    }
  }

  const handlePetRegistrationSuccess = () => {
    loadUserPets()
    refreshUser() // Actualizar contador en navbar
    setEditingPet(null)
  }

  const handleCloseRegistrationForm = () => {
    setShowRegistrationForm(false)
    setEditingPet(null)
  }

  const getPetEmoji = (tipo: string) => {
    return tipo === 'perro' ? '🐕' : '🐱'
  }

  const getGenderEmoji = (genero?: string) => {
    if (!genero) return ''
    return genero === 'macho' ? '♂️' : '♀️'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Cargando tus mascotas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Gestión de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mascotas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Administra la información de tus compañeros peludos
          </p>
          
          {/* Contador y botón añadir */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Chip 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
            >
              {pets.length}/5 mascotas registradas
            </Chip>
            
            {pets.length < 5 && (
              <Button
                size="lg"
                onClick={handleAddNewPet}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-xl mr-2">➕</span>
                Añadir mascota
              </Button>
            )}
          </div>
        </div>

        {/* Lista de mascotas */}
        <div className="max-w-4xl mx-auto">
          {pets.length === 0 ? (
            /* Estado vacío */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                ¡Aún no tienes mascotas registradas!
              </h3>
              <p className="text-gray-500 mb-6">
                Registra tu primera mascota para comenzar a recibir recomendaciones personalizadas
              </p>
              <Button
                size="lg"
                onClick={handleAddNewPet}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <span className="text-xl mr-2">🐾</span>
                Registrar primera mascota
              </Button>
            </div>
          ) : (
            /* Grid de mascotas */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pets.map((pet) => (
                <Card key={pet._id} className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <CardBody className="p-6">
                    {/* Header de la mascota */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">
                          {getPetEmoji(pet.tipo)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {pet.nombre}
                            {getGenderEmoji(pet.genero) && (
                              <span className="text-lg">{getGenderEmoji(pet.genero)}</span>
                            )}
                          </h3>
                          <p className="text-gray-600">{pet.raza}</p>
                        </div>
                      </div>
                      
                      <Chip
                        size="sm"
                        className={`${
                          pet.tipo === 'perro' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {pet.tipo === 'perro' ? 'Perro' : 'Gato'}
                      </Chip>
                    </div>

                    <Divider className="my-4" />

                    {/* Información detallada */}
                    <div className="space-y-2 mb-4">
                      {pet.edad && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>🎂</span>
                          <span>{pet.edad} {pet.edad === 1 ? 'año' : 'años'}</span>
                        </div>
                      )}
                      
                      {pet.peso && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>⚖️</span>
                          <span>{pet.peso} kg</span>
                        </div>
                      )}
                      
                      {pet.genero && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{getGenderEmoji(pet.genero)}</span>
                          <span>{pet.genero === 'macho' ? 'Macho' : 'Hembra'}</span>
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {pet.notas && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium">Notas:</span> {pet.notas}
                        </p>
                      </div>
                    )}

                    {/* Fecha de registro */}
                    <div className="text-xs text-gray-400 mb-4">
                      Registrado el {formatDate(pet.createdAt)}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditPet(pet)}
                        className="bg-blue-500 text-white font-medium flex-1"
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeletePet(pet)}
                        className="bg-red-500 text-white font-medium flex-1 hover:bg-red-600"
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Botón volver al chat */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="mr-2">💬</span>
            Volver al Chat
          </Button>
        </div>
      </div>

      <Footer />

      {/* Formulario de registro/edición */}
      <PetRegistrationForm
        isOpen={showRegistrationForm}
        onClose={handleCloseRegistrationForm}
        onSuccess={handlePetRegistrationSuccess}
        existingPet={editingPet}
      />
    </div>
  )
} 