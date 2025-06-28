'use client'

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function BienestarPage() {
  const wellnessTips = [
    {
      id: 1,
      title: "Rutina de Ejercicio Diario",
      description: "Actividad física adaptada a la edad y raza de tu mascota.",
      activities: [
        "Caminatas: 30-60 min según tamaño",
        "Juegos interactivos en casa",
        "Natación para articulaciones sensibles",
        "Escaleras y obstáculos para coordinación"
      ],
      category: "Ejercicio",
      emoji: "🏃‍♂️",
      benefits: "Mantiene peso, fortalece músculos, mejora humor"
    },
    {
      id: 2,
      title: "Estimulación Mental",
      description: "Actividades para mantener la mente activa y prevenir aburrimiento.",
      activities: [
        "Juguetes puzzle con premios",
        "Esconder comida por la casa",
        "Enseñar nuevos trucos semanalmente",
        "Rotación de juguetes cada 3-4 días"
      ],
      category: "Mental",
      emoji: "🧠",
      benefits: "Reduce ansiedad, previene comportamientos destructivos"
    },
    {
      id: 3,
      title: "Técnicas de Relajación",
      description: "Métodos para reducir estrés y promover calma en mascotas nerviosas.",
      activities: [
        "Masajes suaves en cuello y espalda",
        "Música clásica o sonidos de naturaleza",
        "Aromaterapia con lavanda (segura para mascotas)",
        "Espacios seguros y cómodos para descansar"
      ],
      category: "Relajación",
      emoji: "🧘‍♀️",
      benefits: "Disminuye cortisol, mejora sueño, fortalece vínculo"
    },
    {
      id: 4,
      title: "Cuidado del Pelaje",
      description: "Rutina de aseo que beneficia salud física y bienestar emocional.",
      activities: [
        "Cepillado diario (pelo largo) o semanal (pelo corto)",
        "Baños mensuales con shampoo específico",
        "Revisión y limpieza de orejas",
        "Corte de uñas cada 2-3 semanas"
      ],
      category: "Aseo",
      emoji: "✨",
      benefits: "Previene problemas de piel, detecta anomalías temprano"
    },
    {
      id: 5,
      title: "Socialización Continua",
      description: "Interacciones positivas para mantener habilidades sociales.",
      activities: [
        "Visitas a parques para perros",
        "Encuentros controlados con otros animales",
        "Exposición gradual a nuevos ambientes",
        "Interacción con diferentes personas"
      ],
      category: "Social",
      emoji: "🤝",
      benefits: "Reduce miedos, mejora confianza, previene agresividad"
    },
    {
      id: 6,
      title: "Tiempo de Calidad",
      description: "Actividades de vínculo que fortalecen la relación humano-mascota.",
      activities: [
        "Sesiones de caricias y mimos diarios",
        "Juegos interactivos uno-a-uno",
        "Entrenamiento positivo regular",
        "Rutinas de relajación juntos"
      ],
      category: "Vínculo",
      emoji: "💕",
      benefits: "Fortalece confianza, reduce ansiedad por separación"
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      "Ejercicio": "bg-red-100 text-red-800 border-red-200",
      "Mental": "bg-purple-100 text-purple-800 border-purple-200",
      "Relajación": "bg-blue-100 text-blue-800 border-blue-200",
      "Aseo": "bg-pink-100 text-pink-800 border-pink-200",
      "Social": "bg-green-100 text-green-800 border-green-200",
      "Vínculo": "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return colors[category as keyof typeof colors] || colors.Mental
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <span className="text-6xl">🧘</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bienestar
            </span> para Mascotas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Una vida plena va más allá de la alimentación y el ejercicio. 
            Descubre cómo promover el bienestar integral de tu compañero.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all">
              🏠 Volver al Chat de Pawsitive
            </Button>
          </Link>
        </div>

        {/* Imagen decorativa */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl p-8 text-center">
            <div className="text-8xl mb-4">🌸</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              "El bienestar es un estado de armonía"
            </h2>
            <p className="text-lg text-gray-600">
              Cuerpo sano, mente tranquila, corazón feliz
            </p>
          </div>
        </div>

        {/* Tips de Bienestar */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🌟 Pilares del Bienestar Integral
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wellnessTips.map((tip) => (
              <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border border-purple-100 hover:shadow-lg transition-all duration-300">
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
                  <div className="flex gap-2 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tip.category)}`}>
                      📂 {tip.category}
                    </span>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">🎯 Actividades recomendadas:</h4>
                  <div className="space-y-2 mb-4">
                    {tip.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2 text-sm text-gray-600">
                        <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {activity}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-gray-700 text-sm mb-1">💫 Beneficios:</h5>
                    <p className="text-xs text-gray-600">{tip.benefits}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Señales de Bienestar */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>😊</span>
                Señales de una Mascota Feliz y Relajada
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🐕</div>
                  <h3 className="font-bold text-gray-800 mb-3">Perros Felices</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      🎾 Juega espontáneamente
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      😴 Duerme profundamente
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      👅 Cola suelta y relajada
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🍽️ Come con apetito normal
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-3">🐱</div>
                  <h3 className="font-bold text-gray-800 mb-3">Gatos Felices</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      😸 Ronronea frecuentemente
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🎯 Juega con objetos
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🤗 Busca caricias
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🛌 Duerme en lugares cómodos
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-3">❤️</div>
                  <h3 className="font-bold text-gray-800 mb-3">Señales Universales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded-lg p-2">
                      👁️ Ojos brillantes y alerta
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🏃 Energía apropiada para su edad
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      🤝 Busca interacción social
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      😌 Expresión facial relajada
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Rutina Diaria de Bienestar */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-white border-2 border-purple-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📅</span>
                Rutina Diaria de Bienestar
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>☀️</span>
                    Mañana (7:00 - 12:00)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">7:00</span>
                      <span className="text-sm">Desayuno y medicamentos</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">8:00</span>
                      <span className="text-sm">Paseo matutino (20-30 min)</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">10:00</span>
                      <span className="text-sm">Tiempo de juego activo</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">11:00</span>
                      <span className="text-sm">Sesión de cepillado</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🌙</span>
                    Tarde/Noche (12:00 - 22:00)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">14:00</span>
                      <span className="text-sm">Siesta y descanso</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">17:00</span>
                      <span className="text-sm">Cena y hidratación</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">18:00</span>
                      <span className="text-sm">Paseo vespertino</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">20:00</span>
                      <span className="text-sm">Tiempo de calidad y relajación</span>
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