'use client'

import { Card, CardBody, Chip } from '@heroui/react'

interface PetVoiceChatProps {
  petVoiceResponse: {
    hasRegisteredPet: boolean
    petName?: string
    petBreed?: string
    voiceMessage: string
    emotionalTone: string
  }
}

export function PetVoiceChat({ petVoiceResponse }: PetVoiceChatProps) {
  if (!petVoiceResponse.hasRegisteredPet || !petVoiceResponse.voiceMessage) {
    return null
  }

  const getEmotionalIcon = (tone: string) => {
    switch(tone.toLowerCase()) {
      case 'feliz': return '😊'
      case 'juguetón': return '😄'
      case 'preocupado': return '🥺'
      case 'ansioso': return '😰'
      case 'triste': return '😢'
      case 'avergonzado': return '😳'
      case 'emocionado': return '🤩'
      case 'calmado': return '😌'
      case 'confundido': return '😕'
      case 'culpable': return '😔'
      case 'orgulloso': return '😤'
      case 'curioso': return '🤔'
      case 'nervioso': return '😬'
      case 'relajado': return '😴'
      case 'enérgico': return '⚡'
      // Estados adicionales anteriores
      case 'cariñoso': return '🥰'
      case 'tranquilo': return '😌'
      default: return '🐾'
    }
  }

  const getEmotionalColor = (tone: string) => {
    switch(tone.toLowerCase()) {
      case 'feliz': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'juguetón': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'preocupado': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'ansioso': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'triste': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'avergonzado': return 'bg-red-100 text-red-700 border-red-200'
      case 'emocionado': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'calmado': return 'bg-green-100 text-green-700 border-green-200'
      case 'confundido': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'culpable': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'orgulloso': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'curioso': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'nervioso': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'relajado': return 'bg-teal-100 text-teal-700 border-teal-200'
      case 'enérgico': return 'bg-lime-100 text-lime-700 border-lime-200'
      // Estados adicionales anteriores
      case 'cariñoso': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'tranquilo': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPetIcon = (breed?: string) => {
    if (!breed) return '🐾'
    
    const lowerBreed = breed.toLowerCase()
    if (lowerBreed.includes('gato') || lowerBreed.includes('persa') || lowerBreed.includes('maine')) {
      return '🐱'
    }
    return '🐕'
  }

  const formatPetName = () => {
    if (petVoiceResponse.petName && petVoiceResponse.petName !== 'tu mascota') {
      return petVoiceResponse.petName
    }
    
    if (petVoiceResponse.petBreed) {
      if (petVoiceResponse.petBreed.toLowerCase().includes('gato')) {
        return 'tu gatito'
      }
      return 'tu perrito'
    }
    
    return 'tu mascota'
  }

  return (
    <Card className={`border-2 ${getEmotionalColor(petVoiceResponse.emotionalTone)} shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
      <CardBody className="p-0">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="p-4 relative">
          {/* Header con información de la mascota */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl">{getPetIcon(petVoiceResponse.petBreed)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 capitalize">
                  {formatPetName()}
                </h3>
                <Chip size="sm" variant="flat" className="bg-white/70 text-gray-600">
                  {petVoiceResponse.petBreed || 'Mascota'}
                </Chip>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Estado:</span>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-white/70 text-gray-700"
                  startContent={<span className="mr-1">{getEmotionalIcon(petVoiceResponse.emotionalTone)}</span>}
                >
                  {petVoiceResponse.emotionalTone}
                </Chip>
              </div>
            </div>
          </div>

          {/* Mensaje de la mascota */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 relative">
            {/* Bubble pointer */}
            <div className="absolute -top-2 left-6 w-4 h-4 bg-white/60 backdrop-blur-sm rotate-45"></div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                <span className="text-lg">{getEmotionalIcon(petVoiceResponse.emotionalTone)}</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {petVoiceResponse.voiceMessage.split('\n').map((paragraph, index) => (
                    <p key={index} className={index > 0 ? 'mt-4' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer decorativo */}
          <div className="flex items-center justify-center mt-3 gap-1">
            <span className="text-xs text-gray-500">💬</span>
            <span className="text-xs text-gray-500 font-medium">Mensaje de {formatPetName()}</span>
            <span className="text-xs text-gray-500">💬</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
} 