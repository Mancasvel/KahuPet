'use client'

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function NutricionPage() {
  const nutritionTips = [
    {
      id: 1,
      title: "Frecuencia de Alimentación por Edad",
      description: "Las necesidades nutricionales cambian según la etapa de vida de tu mascota.",
      details: [
        "Cachorros (2-6 meses): 3-4 comidas al día",
        "Juveniles (6-12 meses): 2-3 comidas al día", 
        "Adultos (1-7 años): 2 comidas al día",
        "Seniors (+7 años): 2 comidas pequeñas al día"
      ],
      category: "Horarios",
      emoji: "⏰",
      color: "blue"
    },
    {
      id: 2,
      title: "Alimentos Tóxicos que Debes Evitar",
      description: "Lista esencial de alimentos peligrosos para perros y gatos.",
      details: [
        "🚫 Chocolate (especialmente negro)",
        "🚫 Uvas y pasas (daño renal severo)",
        "🚫 Cebolla y ajo (anemia)",
        "🚫 Aguacate (perxina tóxica)"
      ],
      category: "Seguridad",
      emoji: "⚠️",
      color: "red"
    },
    {
      id: 3,
      title: "Porciones Correctas por Peso",
      description: "Guía práctica para evitar sobrepeso y mantener condición corporal ideal.",
      details: [
        "Perros pequeños (2-10kg): 1/4 - 1 taza diaria",
        "Perros medianos (10-25kg): 1-2 tazas diarias",
        "Perros grandes (25-45kg): 2-3 tazas diarias",
        "Gatos adultos: 1/2-3/4 taza diaria"
      ],
      category: "Porciones",
      emoji: "⚖️",
      color: "green"
    },
    {
      id: 4,
      title: "Hidratación Adecuada",
      description: "El agua es tan importante como la comida para la salud de tu mascota.",
      details: [
        "Perros: 50-100ml por kg de peso corporal",
        "Gatos: 200-400ml diarios (prefieren agua fresca)",
        "Cambiar agua diariamente",
        "Múltiples fuentes de agua en casa"
      ],
      category: "Hidratación",
      emoji: "💧",
      color: "cyan"
    },
    {
      id: 5,
      title: "Transición de Alimentos",
      description: "Cómo cambiar de comida sin causar problemas digestivos.",
      details: [
        "Día 1-2: 75% comida anterior + 25% nueva",
        "Día 3-4: 50% comida anterior + 50% nueva",
        "Día 5-6: 25% comida anterior + 75% nueva",
        "Día 7+: 100% nueva comida"
      ],
      category: "Cambios",
      emoji: "🔄",
      color: "purple"
    },
    {
      id: 6,
      title: "Suplementos Beneficiosos",
      description: "Complementos nutricionales que pueden mejorar la salud.",
      details: [
        "Omega-3: Piel y pelaje saludable",
        "Probióticos: Salud digestiva",
        "Glucosamina: Articulaciones en seniors",
        "Vitamina E: Antioxidante natural"
      ],
      category: "Suplementos",
      emoji: "💊",
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      red: "bg-red-100 text-red-800 border-red-200",
      green: "bg-green-100 text-green-800 border-green-200",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6">
            <span className="text-6xl">🥩</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Nutrición
            </span> para Mascotas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Una alimentación balanceada es la base de una vida larga y saludable. 
            Descubre cómo nutrir correctamente a tu compañero peludo.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all">
              🏠 Volver al Chat de Kahupet
            </Button>
          </Link>
        </div>

        {/* Imagen decorativa */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-200 to-emerald-200 rounded-3xl p-8 text-center">
            <div className="text-8xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              "Que el alimento sea tu medicina"
            </h2>
            <p className="text-lg text-gray-600">
              Una nutrición adecuada previene enfermedades y prolonga la vida
            </p>
          </div>
        </div>

        {/* Tips de Nutrición */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🍎 Guía Completa de Nutrición
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionTips.map((tip) => (
              <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border border-green-100 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tip.emoji}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{tip.title}</h3>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorClasses(tip.color)}`}>
                      📂 {tip.category}
                    </span>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="pt-4">
                  <div className="space-y-2">
                    {tip.details.map((detail, index) => (
                      <div key={index} className="flex gap-2 text-sm text-gray-600">
                        <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {detail}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabla de Nutrientes Esenciales */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🧪</span>
                Nutrientes Esenciales por Etapa
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🐶</div>
                  <h3 className="font-bold text-gray-800 mb-3">Cachorros</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      <strong>Proteína:</strong> 22-28%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Grasa:</strong> 8-17%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Calcio:</strong> 1.0-1.8%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>DHA:</strong> Esencial
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-3">🐕</div>
                  <h3 className="font-bold text-gray-800 mb-3">Adultos</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      <strong>Proteína:</strong> 18-25%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Grasa:</strong> 5-15%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Fibra:</strong> 2-5%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Antioxidantes:</strong> Importante
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-3">🐕‍🦺</div>
                  <h3 className="font-bold text-gray-800 mb-3">Seniors</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      <strong>Proteína:</strong> 16-22%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Grasa:</strong> 5-12%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Fibra:</strong> 3-6%
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <strong>Glucosamina:</strong> Beneficioso
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Señales de Buena Nutrición */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-white border-2 border-green-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>✅</span>
                Señales de una Buena Nutrición
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pelaje Brillante</h3>
                      <p className="text-sm text-gray-600">Pelo sedoso, sin caspa ni opacidad</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">👁️</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Ojos Claros</h3>
                      <p className="text-sm text-gray-600">Sin secreciones ni enrojecimiento</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🦷</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Dientes Limpios</h3>
                      <p className="text-sm text-gray-600">Encías rosadas, sin mal aliento</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Energía Constante</h3>
                      <p className="text-sm text-gray-600">Activo y juguetón según su edad</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Peso Ideal</h3>
                      <p className="text-sm text-gray-600">Se sienten las costillas sin presionar</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Digestión Normal</h3>
                      <p className="text-sm text-gray-600">Deposiciones firmes y regulares</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
} 