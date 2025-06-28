'use client'

import { Card, CardBody, Chip, Divider } from '@heroui/react'

interface Recommendation {
  _id: string
  type: 'training' | 'nutrition' | 'wellness'
  title: string
  description: string
  tags?: string[]
  difficulty: string
  duration: string
  ageRange: string
}

interface PetProfile {
  _id: string
  breed?: string
  category?: string
  size?: string
  characteristics?: {
    energy?: string
    temperament?: string[]
    lifespan?: string
    weight?: string
    exerciseNeeds?: string
  }
  commonIssues?: string[]
  recommendations?: Recommendation[]
}

interface PetCardProps {
  petProfile: PetProfile
  onSelectRecommendation: (recommendation: any) => void
}

export function PetCard({ petProfile, onSelectRecommendation }: PetCardProps) {
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'training': return '🎓'
      case 'nutrition': return '🥩'
      case 'wellness': return '🧘'
      default: return '💡'
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'training': return 'bg-blue-100 text-blue-700'
      case 'nutrition': return 'bg-green-100 text-green-700'
      case 'wellness': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800'
    
    switch(difficulty.toLowerCase()) {
      case 'fácil': return 'bg-green-100 text-green-800'
      case 'moderado': return 'bg-yellow-100 text-yellow-800'
      case 'avanzado': case 'alto': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category?: string) => {
    if (!category) return '🐾'
    return category.toLowerCase() === 'perro' ? '🐕' : '🐱'
  }

  // Valores por defecto para evitar errores
  const breed = petProfile.breed || 'Mascota'
  const category = petProfile.category || 'Mascota'
  const size = petProfile.size || 'Mediano'
  const characteristics = petProfile.characteristics || {}
  const commonIssues = petProfile.commonIssues || []
  const recommendations = petProfile.recommendations || []

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      <CardBody className="p-0">
        {/* Header del perfil de mascota */}
        <div className="flex p-4 border-b border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4">
            <span className="text-3xl">{getCategoryIcon(petProfile.category)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{breed}</h3>
              <Chip size="sm" variant="flat" className="bg-blue-100 text-blue-700 text-xs">
                {category}
              </Chip>
              <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700 text-xs">
                {size}
              </Chip>
            </div>
            <div className="flex items-center gap-4 text-sm mb-2">
              {characteristics.energy && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500">⚡</span>
                    <span className="font-medium">{characteristics.energy}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                </>
              )}
              {characteristics.lifespan && (
                <>
                  <span className="text-gray-600">{characteristics.lifespan}</span>
                  <span className="text-gray-500">•</span>
                </>
              )}
              {characteristics.weight && (
                <span className="text-gray-600">{characteristics.weight}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {characteristics.temperament?.slice(0, 3).map((trait, index) => (
                <Chip 
                  key={index} 
                  size="sm" 
                  variant="flat" 
                  className="bg-purple-100 text-purple-700 text-xs"
                >
                  {trait}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        {/* Recomendaciones disponibles */}
        {recommendations.length > 0 && (
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Recomendaciones disponibles</h4>
            <div className="space-y-3">
              {recommendations.slice(0, 4).map((rec) => (
                <div 
                  key={rec._id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => onSelectRecommendation({
                    ...rec,
                    breed: breed,
                    category: category
                  })}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(rec.type)}`}>
                      <span className="text-xl">{getTypeIcon(rec.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm mb-1 truncate">{rec.title || 'Sin título'}</h5>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{rec.description || 'Sin descripción'}</p>
                      <div className="flex items-center gap-2">
                        <Chip size="sm" variant="flat" className={getDifficultyColor(rec.difficulty)}>
                          {rec.difficulty || 'No especificado'}
                        </Chip>
                        {rec.duration && (
                          <span className="text-xs text-gray-500">{rec.duration}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <Chip size="sm" variant="flat" className={getTypeColor(rec.type)}>
                      {rec.type || 'general'}
                    </Chip>
                    {rec.ageRange && (
                      <p className="text-xs text-gray-500 mt-1">{rec.ageRange}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {recommendations.length > 4 && (
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Ver todas las recomendaciones ({recommendations.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Problemas comunes */}
        {commonIssues.length > 0 && (
          <div className="px-4 pb-4">
            <h5 className="font-medium text-gray-700 mb-2">Problemas comunes:</h5>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonIssues.map((issue, index) => (
                <Chip 
                  key={index} 
                  size="sm" 
                  variant="flat" 
                  className="bg-orange-100 text-orange-700 text-xs"
                >
                  {issue}
                </Chip>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {characteristics.exerciseNeeds && (
                <p>💪 Ejercicio: {characteristics.exerciseNeeds}</p>
              )}
              <p>🏠 Ideal para familias con experiencia en {category.toLowerCase()}s</p>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay datos completos */}
        {recommendations.length === 0 && commonIssues.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No hay información adicional disponible para esta mascota</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
} 