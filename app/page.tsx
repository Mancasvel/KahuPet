'use client'

import { useState } from 'react'
import { Card, CardBody, Input, Button, Spinner } from '@heroui/react'
import { DishCard } from '@/components/DishCard'
import { SearchIcon } from '@/components/SearchIcon'

interface Dish {
  _id: string
  name: string
  description: string
  ingredients: string[]
  tags: string[]
  price: number
  image: string
  restaurant: {
    name: string
    address: string
  }
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [usedMCP, setUsedMCP] = useState(false)
  const [searchSummary, setSearchSummary] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      // Intentar primero con el endpoint MCP
      let response = await fetch('/api/mcp-parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      // Si falla, usar el endpoint original como fallback
      if (!response.ok) {
        console.log('MCP endpoint falló, usando fallback...')
        response = await fetch('/api/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        })
      }

      if (response.ok) {
        const data = await response.json()
        setDishes(data.dishes || [])
        setUsedMCP(data.mcp || false)
        setSearchSummary(data.summary || '')
        
        // Mostrar mensaje si necesita configuración
        if (data.needsConfig) {
          alert(data.error + '\n\nRevisa las instrucciones en el README para configurar las variables de entorno.')
        }

        // Log para debugging
        console.log('🎯 Respuesta:', {
          total: data.total,
          mcp: data.mcp,
          summary: data.summary
        })
      } else {
        console.error('Error en la búsqueda')
        alert('Error en la búsqueda. Verifica que el servidor esté funcionando.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Komi
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Describe lo que te apetece y encuentra el plato perfecto
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Ej: Quiero algo vegano con arroz, que sea rápido y sin picante"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                size="lg"
                startContent={<SearchIcon />}
                className="flex-1"
              />
              <Button
                color="primary"
                size="lg"
                onClick={handleSearch}
                isLoading={loading}
                className="px-8"
              >
                {loading ? <Spinner size="sm" color="white" /> : 'Buscar'}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Buscando platos perfectos para ti...</p>
          </div>
        )}

        {hasSearched && !loading && dishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No encontramos platos que coincidan con tu búsqueda. 
              Intenta con una descripción diferente.
            </p>
          </div>
        )}

        {dishes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Platos recomendados para ti
                </h2>
                {searchSummary && (
                  <p className="text-gray-600 mt-1">{searchSummary}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                usedMCP 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {usedMCP ? '🤖 IA + Base de Datos' : '🧪 Modo Demo'}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <DishCard key={dish._id} dish={dish} />
              ))}
            </div>
          </div>
        )}

        {/* Example queries */}
        {!hasSearched && (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              Ejemplos de búsquedas:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Algo vegano con arroz, rápido y sin picante',
                'Comida tradicional española con carne',
                'Plato sin gluten y económico',
                'Algo picante con pollo para llevar'
              ].map((example, index) => (
                <Card 
                  key={index} 
                  isPressable 
                  onPress={() => setQuery(example)}
                  className="hover:scale-105 transition-transform"
                >
                  <CardBody className="p-4">
                    <p className="text-gray-600 text-center">"{example}"</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 