'use client'

import { Card, CardBody, Button, Chip, Divider } from '@heroui/react'

interface RecommendationCardProps {
  recommendation: {
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
  onSelect?: (recommendation: any) => void
  showBreed?: boolean
}

export function RecommendationCard({ 
  recommendation, 
  onSelect, 
  showBreed = true 
}: RecommendationCardProps) {
  
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
      case 'training': return 'bg-blue-500'
      case 'nutrition': return 'bg-green-500'
      case 'wellness': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'training': return 'Entrenamiento'
      case 'nutrition': return 'Nutrición'
      case 'wellness': return 'Bienestar'
      default: return 'Recomendación'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'fácil': return 'success'
      case 'moderado': return 'warning'
      case 'avanzado': case 'alto': return 'danger'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    return category.toLowerCase() === 'perro' ? '🐕' : '🐱'
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(recommendation)
    }
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
      <CardBody className="p-0">
        {/* Imagen de cabecera */}
        {recommendation.image && (
          <div className="relative w-full h-48 overflow-hidden">
            <img 
              src={recommendation.image} 
              alt={recommendation.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <Chip 
                size="sm" 
                className={`${getTypeColor(recommendation.type)} text-white font-semibold`}
                startContent={<span className="mr-1">{getTypeIcon(recommendation.type)}</span>}
              >
                {getTypeLabel(recommendation.type)}
              </Chip>
            </div>
            {showBreed && (
              <div className="absolute top-3 right-3">
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-white/90 backdrop-blur-sm text-gray-700"
                  startContent={<span className="mr-1">{getCategoryIcon(recommendation.category)}</span>}
                >
                  {recommendation.breed}
                </Chip>
              </div>
            )}
          </div>
        )}

        {/* Contenido principal */}
        <div className="p-4">
          {!recommendation.image && (
            <div className="flex items-center justify-between mb-3">
              <Chip 
                size="sm" 
                className={`${getTypeColor(recommendation.type)} text-white font-semibold`}
                startContent={<span className="mr-1">{getTypeIcon(recommendation.type)}</span>}
              >
                {getTypeLabel(recommendation.type)}
              </Chip>
              {showBreed && (
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="bg-gray-100 text-gray-700"
                  startContent={<span className="mr-1">{getCategoryIcon(recommendation.category)}</span>}
                >
                  {recommendation.breed}
                </Chip>
              )}
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {recommendation.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {recommendation.description}
          </p>

          <Divider className="mb-3" />

          {/* Información detallada */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Dificultad:</span>
                <Chip 
                  size="sm" 
                  color={getDifficultyColor(recommendation.difficulty)}
                  variant="flat"
                >
                  {recommendation.difficulty}
                </Chip>
              </div>
              <span className="text-xs text-gray-600">{recommendation.ageRange}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Duración:</span>
                <span className="text-xs font-medium text-gray-700">{recommendation.duration}</span>
              </div>
              {recommendation.portions && (
                <span className="text-xs text-gray-600">{recommendation.portions}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {recommendation.tags.slice(0, 4).map((tag, index) => (
                  <Chip 
                    key={index} 
                    size="sm" 
                    variant="flat" 
                    className="bg-gray-100 text-gray-600 text-xs"
                  >
                    {tag}
                  </Chip>
                ))}
                {recommendation.tags.length > 4 && (
                  <Chip 
                    size="sm" 
                    variant="flat" 
                    className="bg-gray-100 text-gray-500 text-xs"
                  >
                    +{recommendation.tags.length - 4}
                  </Chip>
                )}
              </div>
            </div>
          )}

          {/* Botón de acción */}
          {onSelect && (
            <Button
              className={`w-full ${getTypeColor(recommendation.type)} text-white font-semibold`}
              onPress={handleSelect}
            >
              Ver detalles
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
} 