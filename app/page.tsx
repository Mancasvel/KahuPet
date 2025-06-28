'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Input, Button, Card, CardBody, Divider, Spinner } from '@heroui/react'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import PetRegistrationForm from '@/components/PetRegistrationForm'
import { useAuth } from '@/lib/AuthContext'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  petContext?: any
}

export default function Home() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [userPets, setUserPets] = useState<any[]>([])
  const [selectedPet, setSelectedPet] = useState<any>(null)
  const [editingPet, setEditingPet] = useState<any>(null)
  const [interestedInPaying, setInterestedInPaying] = useState(false)
  const [isMarkingInterest, setIsMarkingInterest] = useState(false)
  
  // New conversation states
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationStarted, setConversationStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar las mascotas registradas del usuario autenticado
  const loadUserPets = useCallback(async () => {
    if (!user) {
      setUserPets([])
      setSelectedPet(null)
      return
    }

    try {
      const response = await fetch('/api/user-pets', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const pets = await response.json()
        setUserPets(pets)
        
        if (pets.length > 0) {
          if (!selectedPet) {
            setSelectedPet(pets[0])
          } else {
            const stillExists = pets.find((pet: any) => pet._id === selectedPet._id)
            if (!stillExists) {
              setSelectedPet(pets[0])
            }
          }
        } else {
          setSelectedPet(null)
        }
      } else if (response.status === 401) {
        setUserPets([])
        setSelectedPet(null)
      }
    } catch (error) {
      console.error('Error cargando mascotas del usuario:', error)
      setUserPets([])
      setSelectedPet(null)
    }
  }, [user, selectedPet])

  // Cargar mascotas cuando el usuario cambie
  useEffect(() => {
    loadUserPets()
    if (user) {
      setInterestedInPaying(user.interestedInPaying === 1)
    }
  }, [loadUserPets, user])

  // Generar sessionId para usuarios anónimos
  const getSessionId = () => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('kahupet_session_id')
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('kahupet_session_id', sessionId)
      }
      return sessionId
    }
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const searchPetCare = async () => {
    if (!query.trim()) {
      return
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
      petContext: selectedPet
    }

    setMessages(prev => [...prev, userMessage])
    setConversationStarted(true)
    setIsLoading(true)
    
    const currentQuery = query
    setQuery('') // Clear input immediately
    
    try {
      // Preparar identificadores para el nuevo sistema de conversaciones
      const conversationParams = user?.id 
        ? { userId: user.id }
        : { sessionId: getSessionId() }

      console.log('🔄 Enviando consulta con parámetros:', {
        query: currentQuery,
        userPet: selectedPet?.nombre || 'Sin mascota',
        ...conversationParams
      })
      
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: currentQuery,
          userPet: selectedPet,
          ...conversationParams
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        console.log('✅ Respuesta exitosa del servidor:', {
          petVoiceResponse: !!data.petVoiceResponse,
          summary: !!data.summary,
          recommendations: data.recommendations?.length || 0,
          conversationSaved: data.conversationSaved
        })
        
        // Priorizar respuesta de voz de la mascota si está disponible
        let assistantContent = ''
        if (data.petVoiceResponse && data.petVoiceResponse.voiceMessage) {
          assistantContent = data.petVoiceResponse.voiceMessage
        } else if (data.summary) {
          assistantContent = data.summary
        } else if (data.recommendation) {
          assistantContent = data.recommendation
        } else if (data.message) {
          assistantContent = data.message
        } else {
          // Fallback con información básica de las recomendaciones
          if (data.recommendations && data.recommendations.length > 0) {
            assistantContent = `¡He encontrado ${data.recommendations.length} recomendaciones útiles para ti! 🐾`
          } else {
            assistantContent = 'Lo siento, no pude procesar tu consulta en este momento.'
          }
        }
        
        // Add assistant response to conversation
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Handle error response with more details
        console.error('❌ Error en la respuesta del servidor:', response.status, response.statusText)
        
        let errorContent = 'Lo siento, hubo un error procesando tu consulta.'
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorContent = `Error: ${errorData.error}`
            console.error('📋 Detalles del error:', errorData)
          }
        } catch (parseError) {
          console.error('❌ Error parseando respuesta de error:', parseError)
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: errorContent,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      searchPetCare()
    }
  }

  const handlePetRegistrationSuccess = (pet: any) => {
    console.log('🎉 Mascota registrada exitosamente:', pet)
    loadUserPets()
    refreshUser()
    setShowRegistrationForm(false)
    setEditingPet(null)
  }

  const handleEditPet = () => {
    if (selectedPet) {
      setEditingPet(selectedPet)
      setShowRegistrationForm(true)
    }
  }

  const handleAddNewPet = () => {
    setEditingPet(null)
    setShowRegistrationForm(true)
  }

  const handleCloseRegistrationForm = () => {
    setShowRegistrationForm(false)
    setEditingPet(null)
  }

  const handleMarkInterest = async () => {
    setIsMarkingInterest(true)
    try {
      const response = await fetch('/api/user-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ interestedInPaying: 1 })
      })

      if (response.ok) {
        setInterestedInPaying(true)
        if (user) {
          refreshUser()
        }
      } else {
        console.error('Error marcando interés:', response.statusText)
        alert('Error al marcar el interés. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error marcando interés:', error)
      alert('Error al marcar el interés. Por favor intenta de nuevo.')
    } finally {
      setIsMarkingInterest(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationStarted(false)
    setQuery('')
    
    // Limpiar sessionId para usuarios anónimos para iniciar nueva conversación
    if (!user?.id && typeof window !== 'undefined') {
      localStorage.removeItem('kahupet_session_id')
      console.log('🔄 Nueva conversación iniciada - SessionId limpiado')
    }
  }

  // Detectar cambio de mascota y limpiar conversación si está activa
  const previousSelectedPetRef = useRef(selectedPet)
  useEffect(() => {
    const previousPet = previousSelectedPetRef.current
    
    // Si hay una conversación activa y la mascota cambió, iniciar nueva conversación
    if (conversationStarted && previousPet && selectedPet && 
        previousPet._id !== selectedPet._id) {
      console.log('🔄 Mascota cambió de', previousPet.nombre, 'a', selectedPet.nombre, '- Iniciando nueva conversación')
      startNewConversation()
    }
    
    previousSelectedPetRef.current = selectedPet
  }, [selectedPet, conversationStarted])

  // Render conversation interface
  if (conversationStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navbar */}
        <NavbarComponent onRegisterPet={handleAddNewPet} />
        
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {selectedPet ? (selectedPet.tipo === 'gato' ? '🐱' : '🐕') : '🐾'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {selectedPet ? selectedPet.nombre : 'Kahupet'}
                  </h1>
                  {selectedPet && (
                    <p className="text-sm text-slate-600">
                      {selectedPet.raza} • {selectedPet.edad} {selectedPet.edad === 1 ? 'año' : 'años'}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="light"
                onClick={startNewConversation}
                className="text-slate-600 hover:text-slate-900"
              >
                Nueva consulta
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs">
                            {selectedPet ? (selectedPet.tipo === 'gato' ? '🐱' : '🐕') : '🤖'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {selectedPet ? selectedPet.nombre : 'Kahupet'}
                        </span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-indigo-200' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-2xl px-4 py-3 bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">
                          {selectedPet ? (selectedPet.tipo === 'gato' ? '🐱' : '🐕') : '🤖'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {selectedPet ? selectedPet.nombre : 'Kahupet'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-slate-500">
                        {selectedPet 
                          ? `${selectedPet.nombre} está pensando...` 
                          : 'Analizando tu consulta...'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-3">
              <Input
                placeholder={
                  selectedPet 
                    ? `Pregúntale algo más a ${selectedPet.nombre}...`
                    : "Escribe tu siguiente pregunta..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                classNames={{
                  input: "text-base",
                  inputWrapper: "bg-slate-50 border-slate-200 hover:border-slate-300 focus-within:border-indigo-500"
                }}
                disabled={isLoading}
              />
              <Button
                onClick={searchPetCare}
                isLoading={isLoading}
                isDisabled={!query.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
              >
                {isLoading ? <Spinner size="sm" color="white" /> : 'Enviar'}
              </Button>
            </div>
            {selectedPet && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                💬 Conversando con {selectedPet.nombre} • {selectedPet.raza}
              </p>
            )}
          </div>
        </div>

        {/* Modal de registro de mascotas */}
        {showRegistrationForm && (
          <PetRegistrationForm
            isOpen={showRegistrationForm}
            onClose={handleCloseRegistrationForm}
            onSuccess={handlePetRegistrationSuccess}
            existingPet={editingPet}
          />
        )}
      </div>
    )
  }

  // Initial landing page (before conversation starts)
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarComponent onRegisterPet={handleAddNewPet} />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="text-center max-w-4xl mx-auto">
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              ¡Hola! Soy{' '}
              <span className="text-indigo-600">Kahupet</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed">
              Entiende a tu mascota con recomendaciones personalizadas<br className="hidden sm:block" />
              de entrenamiento, nutrición y bienestar
            </p>

            {/* Search Section */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Input
                  size="lg"
                  placeholder={
                    selectedPet 
                      ? `Ej: ${selectedPet.nombre} no deja de ladrar cuando llegan visitas...`
                      : "Ej: Mi golden retriever no deja de ladrar cuando llegan visitas..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  startContent={
                    <span className="text-xl text-slate-400">
                      {selectedPet 
                        ? (selectedPet.tipo === 'gato' ? '🐱' : '🐕')
                        : '🔍'
                      }
                    </span>
                  }
                  className="flex-1"
                  classNames={{
                    input: "text-lg placeholder:text-slate-400",
                    inputWrapper: "h-14 bg-white border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 shadow-sm"
                  }}
                />
                <Button
                  size="lg"
                  onClick={searchPetCare}
                  isLoading={isLoading}
                  className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  {isLoading ? <Spinner size="sm" color="white" /> : 'Buscar'}
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {(() => {
                  if (selectedPet) {
                    const petName = selectedPet.nombre
                    const isPerro = selectedPet.tipo === 'perro'
                    return [
                      `${petName} ${isPerro ? 'ladra mucho' : 'maúlla de noche'}`,
                      `Dieta para ${petName}`,
                      `Ejercicio para ${petName}`,
                      `Entrenamiento de ${petName}`
                    ]
                  } else {
                    return [
                      "Mi perro ladra mucho",
                      "Dieta para gato senior", 
                      "Ejercicio para Border Collie",
                      "Entrenamiento básico"
                    ]
                  }
                })().map((example, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="light"
                    onClick={() => setQuery(example)}
                    className="text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Pets Section */}
        {user && userPets.length > 0 && (
          <div className="pb-16">
            <Card className="border border-slate-200">
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🐾</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    Tus Mascotas
                  </h2>
                  <p className="text-slate-600">
                    {userPets.length} de 5 mascotas registradas
                  </p>
                </div>
                
                {/* Pet selector */}
                <div className="mb-8">
                  <p className="text-sm font-medium text-slate-700 mb-4 text-center">
                    Consultar para:
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {userPets.map((pet) => (
                      <Button
                        key={pet._id}
                        size="lg"
                        variant={selectedPet?._id === pet._id ? "solid" : "bordered"}
                        onClick={() => setSelectedPet(pet)}
                        className={`${
                          selectedPet?._id === pet._id 
                            ? 'bg-indigo-600 text-white shadow-lg border-indigo-600' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {pet.tipo === 'gato' ? '🐱' : '🐕'}
                          </span>
                          <div className="text-left">
                            <div className="font-medium">{pet.nombre}</div>
                            <div className="text-xs opacity-75">{pet.raza}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Active pet indicator */}
                  {selectedPet && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-sm text-indigo-800 text-center">
                        <span className="font-medium">Modo activo:</span> Las consultas serán personalizadas para{' '}
                        <span className="font-semibold">{selectedPet.nombre}</span>{' '}
                        ({selectedPet.raza}, {selectedPet.edad} {selectedPet.edad === 1 ? 'año' : 'años'})
                      </p>
                    </div>
                  )}
                </div>

                {/* Pet management actions */}
                <Divider className="mb-6" />
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    variant="bordered"
                    onClick={() => window.location.href = '/mascotas'}
                    className="border-slate-200 hover:border-slate-300 text-slate-700"
                  >
                    Ver todas las mascotas
                  </Button>
                  {selectedPet && (
                    <Button
                      variant="bordered"
                      onClick={handleEditPet}
                      className="border-slate-200 hover:border-slate-300 text-slate-700"
                    >
                      Editar {selectedPet.nombre}
                    </Button>
                  )}
                  {userPets.length < 5 && (
                    <Button
                      onClick={handleAddNewPet}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Añadir mascota
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* First-time user CTA */}
        {user && userPets.length === 0 && (
          <div className="pb-16">
            <Card className="border border-slate-200">
              <CardBody className="text-center p-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🐾</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  ¡Registra tu primera mascota!
                </h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Para recibir recomendaciones personalizadas y aprovechar al máximo Kahupet
                </p>
                <Button
                  size="lg"
                  onClick={handleAddNewPet}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8"
                >
                  Registrar mascota
                </Button>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Welcome message for non-authenticated users */}
        {!user && (
          <div className="pb-16">
            <Card className="border border-slate-200">
              <CardBody className="text-center p-12">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  ¡Bienvenido a Kahupet!
                </h2>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                  Regístrate para guardar hasta 5 mascotas y recibir recomendaciones personalizadas, 
                  o continúa usando Kahupet sin registrarte
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {/* Handle signup */}}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8"
                  >
                    Crear cuenta gratis
                  </Button>
                  <Button
                    variant="bordered"
                    className="border-slate-200 hover:border-slate-300 text-slate-700"
                  >
                    Continuar sin registrarse
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Premium CTA - Moved to bottom */}
      {user && !interestedInPaying && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="border border-amber-200 bg-white/80 backdrop-blur-sm">
              <CardBody className="text-center p-12">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⭐</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  ¿Te gustaría la versión Premium?
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Desbloquea acceso ilimitado, funciones avanzadas, planes personalizados 
                  y soporte prioritario para el cuidado de tus mascotas
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-lg">✅</span>
                    <span>Consultas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-lg">✅</span>
                    <span>Planes personalizados</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-lg">✅</span>
                    <span>Soporte prioritario</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleMarkInterest}
                  isLoading={isMarkingInterest}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-12 py-4 text-lg"
                >
                  {isMarkingInterest ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>Sí, me interesa Premium</>
                  )}
                </Button>
                <p className="text-sm text-slate-500 mt-4">
                  Sin compromiso • Te contactaremos pronto
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Thank you message for interested users */}
      {user && interestedInPaying && (
        <div className="bg-emerald-50 border-t border-emerald-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="border border-emerald-200 bg-white/80">
              <CardBody className="text-center p-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">✅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  ¡Gracias por tu interés en Premium!
                </h3>
                <p className="text-emerald-800">
                  Nuestro equipo se pondrá en contacto contigo pronto para darte más detalles 
                  sobre las funciones Premium de Kahupet.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de registro de mascotas */}
      {showRegistrationForm && (
        <PetRegistrationForm
          isOpen={showRegistrationForm}
          onClose={handleCloseRegistrationForm}
          onSuccess={handlePetRegistrationSuccess}
          existingPet={editingPet}
        />
      )}

      <Footer />
    </div>
  )
} 