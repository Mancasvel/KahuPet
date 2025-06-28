'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input, Button, Card, CardBody, Divider, Spinner, Badge } from '@heroui/react'
import { PetCard } from '@/components/PetCard'
import { RecommendationCard } from '@/components/RecommendationCard'
import { PetVoiceChat } from '@/components/PetVoiceChat'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import PetRegistrationForm from '@/components/PetRegistrationForm'

interface Recommendation {
  _id: string
  type: 'training' | 'nutrition' | 'wellness'
  title: string
  description: string
  breed: string
  category: string
  tags?: string[]
  difficulty: string
  duration: string
  ageRange: string
  image?: string
  portions?: string
}

interface PetProfile {
  _id: string
  breed: string
  category: string
  size: string
  characteristics: {
    energy: string
    temperament: string[]
    lifespan: string
    weight: string
    exerciseNeeds: string
  }
  commonIssues: string[]
  recommendations: Recommendation[]
}

interface PetVoiceResponse {
  hasRegisteredPet: boolean
  petName?: string
  petBreed?: string
  voiceMessage: string
  emotionalTone: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([])
  const [allPetProfiles, setAllPetProfiles] = useState<PetProfile[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [petVoiceResponse, setPetVoiceResponse] = useState<PetVoiceResponse | null>(null)
  const [selectedRecommendations, setSelectedRecommendations] = useState<Recommendation[]>([])
  const [searchMode, setSearchMode] = useState<'profiles' | 'recommendations'>('recommendations')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [userPet, setUserPet] = useState<any>(null)

  // Cargar todos los perfiles de mascotas al inicio
  const loadAllPetProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setAllPetProfiles(data)
        setPetProfiles(data)
      }
    } catch (error) {
      console.error('Error cargando perfiles de mascotas:', error)
    }
  }, [])

  // Cargar la mascota registrada del usuario
  const loadUserPet = useCallback(async () => {
    try {
      const response = await fetch('/api/user-pets?userId=anonymous') // Por ahora usamos anonymous
      if (response.ok) {
        const userPets = await response.json()
        if (userPets.length > 0) {
          setUserPet(userPets[0]) // Tomar la primera mascota del usuario
          console.log('🏷️ Mascota del usuario cargada:', userPets[0])
        }
      }
    } catch (error) {
      console.error('Error cargando mascota del usuario:', error)
    }
  }, [])

  // Cargar perfiles y mascota del usuario al montar el componente
  useEffect(() => {
    loadAllPetProfiles()
    loadUserPet()
  }, [loadAllPetProfiles, loadUserPet])

  const searchPetCare = async () => {
    if (!query.trim()) {
      setPetProfiles(allPetProfiles)
      setRecommendations([])
      setSummary('')
      setPetVoiceResponse(null)
      return
    }

    setIsLoading(true)
    setSummary('')
    setPetVoiceResponse(null)
    setRecommendations([])
    
    try {
      // Usar la API de parse que ya adaptamos para mascotas
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          userPet: userPet // Enviar información de la mascota registrada si existe
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        setSummary(data.summary || `Resultados para: "${query}"`)
        setPetVoiceResponse(data.petVoiceResponse)
        
        // Si hay recomendaciones específicas, mostrarlas
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations)
          setSearchMode('recommendations')
          
          // Filtrar perfiles que tengan esas recomendaciones
          const recBreeds = new Set(data.recommendations.map((rec: any) => rec.breed))
          const filteredProfiles = allPetProfiles.filter(profile => 
            recBreeds.has(profile.breed)
          )
          setPetProfiles(filteredProfiles.length > 0 ? filteredProfiles : allPetProfiles)
        } else {
          // Si no hay recomendaciones específicas, mostrar perfiles relevantes
          setSearchMode('profiles')
          setPetProfiles(allPetProfiles)
        }
        
      } else {
        setSummary('Error en la búsqueda. Mostrando todos los perfiles.')
        setPetProfiles(allPetProfiles)
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      setSummary('Error en la búsqueda. Mostrando todos los perfiles.')
      setPetProfiles(allPetProfiles)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRecommendation = (recommendation: Recommendation) => {
    setSelectedRecommendations(prev => {
      const exists = prev.find(r => r._id === recommendation._id)
      if (exists) {
        return prev.filter(r => r._id !== recommendation._id)
      } else {
        return [...prev, recommendation]
      }
    })
  }

  const handleRemoveRecommendation = (id: string) => {
    setSelectedRecommendations(prev => prev.filter(r => r._id !== id))
  }

  const handleClearSelections = () => {
    setSelectedRecommendations([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPetCare()
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'training': return '🎓'
      case 'nutrition': return '🥩'
      case 'wellness': return '🧘'
      default: return '💡'
    }
  }

  const handlePetRegistrationSuccess = (pet: any) => {
    setUserPet(pet)
    console.log('Mascota registrada exitosamente:', pet)
    // Recargar la lista de mascotas del usuario
    loadUserPet()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar estilo Pawsitive */}
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ¡Hola! Soy <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pawsitive</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cuéntame qué necesita tu mascota y te ayudo con recomendaciones personalizadas de entrenamiento, nutrición y bienestar
          </p>

          {/* Barra de búsqueda principal */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-3">
              <Input
                size="lg"
                placeholder="Ej: Mi golden retriever no deja de ladrar cuando llegan visitas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                startContent={<span className="text-2xl">🐾</span>}
                className="flex-1"
                classNames={{
                  input: "text-lg",
                  inputWrapper: "h-14 bg-white shadow-lg border-2 border-blue-100 hover:border-blue-200 focus-within:border-blue-400"
                }}
              />
              <Button
                size="lg"
                onClick={searchPetCare}
                isLoading={isLoading}
                className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? <Spinner size="sm" color="white" /> : '🔍 Buscar'}
              </Button>
            </div>
          </div>

          {/* Ejemplos de consultas */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {[
              "Mi perro ladra mucho 🐕",
              "Dieta para gato senior 🐱",
              "Ejercicio para Border Collie 🏃",
              "Entrenamiento básico 🎓"
            ].map((example, index) => (
              <Button
                key={index}
                size="sm"
                variant="flat"
                onClick={() => setQuery(example.replace(/ [🐕🐱🏃🎓]/, ''))}
                className="text-sm bg-white/70 hover:bg-white border border-gray-200 hover:border-blue-300 transition-colors"
              >
                {example}
              </Button>
            ))}
          </div>

          {/* Botón de registro de mascota */}
          <div className="flex justify-center mb-8">
            <Button
              size="lg"
              onClick={() => setShowRegistrationForm(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-xl mr-2">🐾</span>
              {userPet ? `${userPet.name} registrado` : 'Registra tu mascota'}
            </Button>
          </div>
        </div>

        {/* Respuesta de voz de la mascota */}
        {petVoiceResponse && petVoiceResponse.hasRegisteredPet && (
          <div className="max-w-4xl mx-auto mb-8">
            <PetVoiceChat petVoiceResponse={petVoiceResponse} />
          </div>
        )}

        {/* Resumen de resultados */}
        {summary && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100">
              <CardBody className="p-4">
                <p className="text-gray-700 font-medium">{summary}</p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Recomendaciones seleccionadas */}
        {selectedRecommendations.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>📋</span>
                    Plan seleccionado ({selectedRecommendations.length})
                  </h3>
                  <Button
                    size="sm"
                    variant="flat"
                    onClick={handleClearSelections}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Limpiar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRecommendations.map((rec) => (
                    <div key={rec._id} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                      <span>{getTypeIcon(rec.type)}</span>
                      <span className="text-sm font-medium text-gray-700">{rec.title}</span>
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        onClick={() => handleRemoveRecommendation(rec._id)}
                        className="text-gray-400 hover:text-red-500 w-5 h-5"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Toggle entre modos de vista */}
        {(recommendations.length > 0 || petProfiles.length > 0) && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant={searchMode === 'recommendations' ? 'solid' : 'flat'}
                onClick={() => setSearchMode('recommendations')}
                disabled={recommendations.length === 0}
                className={searchMode === 'recommendations' ? 'bg-blue-500 text-white' : ''}
              >
                🎯 Recomendaciones ({recommendations.length})
              </Button>
              <Button
                size="sm"
                variant={searchMode === 'profiles' ? 'solid' : 'flat'}
                onClick={() => setSearchMode('profiles')}
                className={searchMode === 'profiles' ? 'bg-purple-500 text-white' : ''}
              >
                🐾 Perfiles de razas ({petProfiles.length})
              </Button>
            </div>
          </div>
        )}

        {/* Grid de contenido principal */}
        <div className="max-w-6xl mx-auto">
          {searchMode === 'recommendations' && recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation._id}
                  recommendation={recommendation}
                  onSelect={handleSelectRecommendation}
                />
              ))}
            </div>
          )}

          {searchMode === 'profiles' && petProfiles.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {petProfiles.map((petProfile) => (
                <PetCard
                  key={petProfile._id}
                  petProfile={petProfile}
                  onSelectRecommendation={handleSelectRecommendation}
                />
              ))}
            </div>
          )}

          {/* Estado vacío */}
          {!isLoading && recommendations.length === 0 && petProfiles.length === 0 && query && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No encontré recomendaciones específicas
              </h3>
              <p className="text-gray-500 mb-4">
                Prueba con consultas como "mi perro ladra mucho" o "dieta para gato senior"
              </p>
              <Button
                onClick={() => {
                  setQuery('')
                  setPetProfiles(allPetProfiles)
                  setSearchMode('profiles')
                }}
                className="bg-blue-500 text-white"
              >
                Ver todos los perfiles
              </Button>
            </div>
          )}

          {/* Estado inicial */}
          {!query && allPetProfiles.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                ¿Cómo puedo ayudarte hoy?
              </h3>
              <p className="text-gray-500 mb-6">
                Cuéntame qué necesita tu mascota y te daré recomendaciones personalizadas
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allPetProfiles.slice(0, 4).map((petProfile) => (
                  <PetCard
                    key={petProfile._id}
                    petProfile={petProfile}
                    onSelectRecommendation={handleSelectRecommendation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Formulario de registro de mascota */}
      <PetRegistrationForm
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        onSuccess={handlePetRegistrationSuccess}
      />
    </div>
  )
} 