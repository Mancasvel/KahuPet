'use client'

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function EntrenamientoPage() {
  const trainingTips = [
    {
      id: 1,
      title: "Comando 'Siéntate' - Lo básico primero",
      description: "El comando más fundamental que todo perro debe aprender. Base para cualquier entrenamiento.",
      steps: [
        "Sostén una golosina cerca de su nariz",
        "Levanta la mano lentamente hacia arriba y hacia atrás",
        "Su trasero tocará el suelo naturalmente",
        "Di 'siéntate' y dale la recompensa inmediatamente"
      ],
      difficulty: "Principiante",
      time: "5-10 min",
      emoji: "🪑"
    },
    {
      id: 2,
      title: "Control de Ladridos Excesivos",
      description: "Técnicas efectivas para reducir ladridos problemáticos sin dañar la comunicación natural.",
      steps: [
        "Identifica el trigger (visitas, ruidos, ansiedad)",
        "Usa el comando 'Silencio' consistentemente",
        "Recompensa cuando pare de ladrar por 3 segundos",
        "Incrementa gradualmente el tiempo de silencio"
      ],
      difficulty: "Intermedio",
      time: "15-20 min",
      emoji: "🔇"
    },
    {
      id: 3,
      title: "Caminar sin Tirar de la Correa",
      description: "Aprende a disfrutar paseos relajados donde tu perro camine a tu lado.",
      steps: [
        "Usa una correa de 1.5-2 metros máximo",
        "Para inmediatamente cuando tire",
        "Cambia de dirección cuando vaya adelante",
        "Recompensa cuando esté a tu lado"
      ],
      difficulty: "Intermedio",
      time: "20-30 min",
      emoji: "🚶‍♂️"
    },
    {
      id: 4,
      title: "Socialización Temprana (Cachorros)",
      description: "Período crítico entre 3-14 semanas para formar personalidad social saludable.",
      steps: [
        "Exponlo a diferentes sonidos gradualmente",
        "Presenta personas de diferentes edades",
        "Conocer otros perros vacunados y amigables",
        "Explorar diferentes superficies y ambientes"
      ],
      difficulty: "Principiante",
      time: "30-45 min",
      emoji: "🐶"
    },
    {
      id: 5,
      title: "Comando 'Déjalo' para Seguridad",
      description: "Comando vital que puede salvar la vida de tu mascota en situaciones peligrosas.",
      steps: [
        "Cierra el puño con golosina dentro",
        "Di 'déjalo' y espera que pare de intentar",
        "Cuando se aleje, marca y recompensa",
        "Practica con objetos cada vez más tentadores"
      ],
      difficulty: "Intermedio",
      time: "10-15 min",
      emoji: "✋"
    },
    {
      id: 6,
      title: "Entrenamiento con Clicker",
      description: "Método científico de refuerzo positivo para comunicación clara y efectiva.",
      steps: [
        "Asocia el sonido del clicker con recompensa",
        "Haz click exactamente cuando haga lo correcto",
        "Sigue inmediatamente con premio",
        "Gradualmente añade comandos verbales"
      ],
      difficulty: "Avanzado",
      time: "25-40 min",
      emoji: "📢"
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Principiante': return 'bg-green-100 text-green-800'
      case 'Intermedio': return 'bg-yellow-100 text-yellow-800'
      case 'Avanzado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <span className="text-6xl">🎓</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Entrenamiento
            </span> para Mascotas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubre técnicas efectivas de entrenamiento basadas en refuerzo positivo. 
            Construye una relación más fuerte con tu mascota mientras aprenden habilidades esenciales.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all">
              🏠 Volver al Chat de Kahupet
            </Button>
          </Link>
        </div>

        {/* Imagen decorativa */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl p-8 text-center">
            <div className="text-8xl mb-4">🐕‍🦺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              "El entrenamiento no es sobre dominar a tu mascota"
            </h2>
            <p className="text-lg text-gray-600">
              Es sobre comunicarse claramente y construir confianza mutua
            </p>
          </div>
        </div>

        {/* Tips de Entrenamiento */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🏆 Técnicas de Entrenamiento Comprobadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingTips.map((tip) => (
              <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border border-blue-100 hover:shadow-lg transition-all duration-300">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                      {tip.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ⏱️ {tip.time}
                    </span>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">📋 Pasos a seguir:</h4>
                  <ol className="space-y-2">
                    {tip.steps.map((step, index) => (
                      <li key={index} className="flex gap-2 text-sm text-gray-600">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Consejos Generales */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>💡</span>
                Consejos de Oro para el Entrenamiento
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Consistencia es Clave</h3>
                      <p className="text-sm text-gray-600">Entrena todos los días por períodos cortos (5-15 min)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Refuerzo Positivo</h3>
                      <p className="text-sm text-gray-600">Recompensa comportamientos buenos, ignora los malos</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">😊</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Paciencia Infinita</h3>
                      <p className="text-sm text-gray-600">Cada mascota aprende a su propio ritmo</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">🍖</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Recompensas de Alto Valor</h3>
                      <p className="text-sm text-gray-600">Usa sus treats favoritos para motivación extra</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Un Comando a la Vez</h3>
                      <p className="text-sm text-gray-600">Domina uno antes de introducir el siguiente</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">Celebra el Progreso</h3>
                      <p className="text-sm text-gray-600">Reconoce cada pequeño logro alcanzado</p>
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