'use client'

import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { NavbarComponent } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function VeterinariosPage() {
  const healthTips = [
    {
      id: 1,
      title: "Chequeos Preventivos Regulares",
      description: "Calendario de visitas veterinarias según edad y estado de salud.",
      guidelines: [
        "Cachorros: cada 2-4 semanas hasta los 4 meses",
        "Adultos jóvenes (1-7 años): revisión anual",
        "Seniors (+7 años): revisión cada 6 meses",
        "Emergencias: consulta inmediata ante síntomas"
      ],
      category: "Prevención",
      emoji: "📅",
      urgency: "regular"
    },
    {
      id: 2,
      title: "Señales de Alerta Inmediata",
      description: "Síntomas que requieren atención veterinaria urgente.",
      guidelines: [
        "🚨 Dificultad para respirar o jadeo excesivo",
        "🚨 Vómitos persistentes o diarrea con sangre",
        "🚨 Convulsiones o pérdida de consciencia",
        "🚨 Traumatismo grave o accidentes"
      ],
      category: "Emergencia",
      emoji: "🚨",
      urgency: "urgent"
    },
    {
      id: 3,
      title: "Calendario de Vacunación",
      description: "Esquema de vacunas esenciales para proteger contra enfermedades.",
      guidelines: [
        "6-8 semanas: Primera vacuna múltiple",
        "10-12 semanas: Refuerzo múltiple + antirrábica",
        "14-16 semanas: Último refuerzo inicial",
        "Anual: Refuerzos según protocolo veterinario"
      ],
      category: "Vacunas",
      emoji: "💉",
      urgency: "scheduled"
    },
    {
      id: 4,
      title: "Desparasitación Integral",
      description: "Programa de control de parásitos internos y externos.",
      guidelines: [
        "Cachorros: cada 2 semanas hasta los 3 meses",
        "Adultos: desparasitación cada 3-6 meses",
        "Antipulgas/garrapatas: según productos veterinarios",
        "Filaria: prevención mensual en zonas endémicas"
      ],
      category: "Parásitos",
      emoji: "🐛",
      urgency: "regular"
    },
    {
      id: 5,
      title: "Cuidado Dental Preventivo",
      description: "Mantenimiento de la salud oral para prevenir enfermedades.",
      guidelines: [
        "Cepillado dental 2-3 veces por semana",
        "Juguetes dentales y snacks específicos",
        "Limpieza profesional anual (bajo anestesia)",
        "Revisión dental en cada consulta"
      ],
      category: "Dental",
      emoji: "🦷",
      urgency: "regular"
    },
    {
      id: 6,
      title: "Monitoreo de Peso y Condición",
      description: "Evaluación regular para mantener peso corporal ideal.",
      guidelines: [
        "Pesaje mensual en casa o veterinaria",
        "Evaluación de condición corporal",
        "Ajuste de dieta según necesidades",
        "Control de obesidad y desnutrición"
      ],
      category: "Nutrición",
      emoji: "⚖️",
      urgency: "regular"
    }
  ]

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      "urgent": "bg-red-100 text-red-800 border-red-200",
      "scheduled": "bg-orange-100 text-orange-800 border-orange-200",
      "regular": "bg-green-100 text-green-800 border-green-200"
    }
    return colors[urgency as keyof typeof colors] || colors.regular
  }

  const getUrgencyLabel = (urgency: string) => {
    const labels = {
      "urgent": "🚨 URGENTE",
      "scheduled": "📅 PROGRAMADO",
      "regular": "✅ RUTINARIO"
    }
    return labels[urgency as keyof typeof labels] || labels.regular
  }

  const commonConditions = [
    {
      condition: "Infecciones de Oído",
      symptoms: ["Mal olor", "Rascado excesivo", "Secreción"],
      treatment: "Limpieza + medicación tópica",
      prevention: "Limpieza regular, secar después del baño"
    },
    {
      condition: "Problemas Digestivos",
      symptoms: ["Vómitos", "Diarrea", "Pérdida de apetito"],
      treatment: "Ayuno controlado + dieta blanda",
      prevention: "Dieta consistente, evitar comida humana"
    },
    {
      condition: "Problemas de Piel",
      symptoms: ["Picazón", "Enrojecimiento", "Pérdida de pelo"],
      treatment: "Shampoos medicados + antihistamínicos",
      prevention: "Cepillado regular, control de pulgas"
    },
    {
      condition: "Artritis en Seniors",
      symptoms: ["Rigidez", "Dificultad para levantarse", "Cojera"],
      treatment: "Antiinflamatorios + suplementos",
      prevention: "Ejercicio moderado, control de peso"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <NavbarComponent />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
            <span className="text-6xl">🏥</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Cuidado Veterinario
            </span> Preventivo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La prevención es la mejor medicina. Aprende a mantener a tu mascota sana 
            y reconocer cuándo necesita atención profesional.
          </p>
          
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all">
              🏠 Volver al Chat de Pawsitive
            </Button>
          </Link>
        </div>

        {/* Imagen decorativa */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-orange-200 to-red-200 rounded-3xl p-8 text-center">
            <div className="text-8xl mb-4">🩺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              "Prevenir es mejor que curar"
            </h2>
            <p className="text-lg text-gray-600">
              Un cuidado preventivo adecuado puede evitar muchos problemas de salud
            </p>
          </div>
        </div>

        {/* Tips de Cuidado Veterinario */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🩺 Guía de Cuidado Preventivo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthTips.map((tip) => (
              <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border border-orange-100 hover:shadow-lg transition-all duration-300">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(tip.urgency)}`}>
                      {getUrgencyLabel(tip.urgency)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      📂 {tip.category}
                    </span>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">📋 Protocolo recomendado:</h4>
                  <div className="space-y-2">
                    {tip.guidelines.map((guideline, index) => (
                      <div key={index} className="flex gap-2 text-sm text-gray-600">
                        <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {guideline}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Condiciones Comunes */}
        <div className="max-w-6xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🔍</span>
                Condiciones Comunes y Cómo Reconocerlas
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commonConditions.map((condition, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">
                      {condition.condition}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-red-700 text-sm mb-1">🚩 Síntomas:</h4>
                        <p className="text-sm text-gray-600">{condition.symptoms.join(", ")}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-700 text-sm mb-1">💊 Tratamiento:</h4>
                        <p className="text-sm text-gray-600">{condition.treatment}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 text-sm mb-1">🛡️ Prevención:</h4>
                        <p className="text-sm text-gray-600">{condition.prevention}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Kit de Primeros Auxilios */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-white border-2 border-red-200">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🧰</span>
                Kit de Primeros Auxilios para Mascotas
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🏥</span>
                    Elementos Básicos
                  </h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">🩹</span>
                      <span className="text-sm">Vendas elásticas y gasas estériles</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">🧴</span>
                      <span className="text-sm">Suero fisiológico y agua oxigenada</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">🌡️</span>
                      <span className="text-sm">Termómetro digital</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">✂️</span>
                      <span className="text-sm">Tijeras de punta roma</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>💊</span>
                    Medicamentos de Emergencia
                  </h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">💧</span>
                      <span className="text-sm">Solución electrolítica oral</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">🧊</span>
                      <span className="text-sm">Compresas frías instantáneas</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">📞</span>
                      <span className="text-sm">Números de emergencia veterinaria</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">📋</span>
                      <span className="text-sm">Historial médico y alergias</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Números de Emergencia */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300">
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📞</span>
                Contactos de Emergencia
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                    <h3 className="font-bold text-gray-800 mb-2">🚨 Emergencias 24/7</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Ten siempre a mano el número de tu veterinario de emergencia más cercano
                    </p>
                    <Button size="sm" className="bg-red-500 text-white">
                      Buscar Veterinario de Emergencia
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                    <h3 className="font-bold text-gray-800 mb-2">🏥 Tu Veterinario Habitual</h3>
                    <p className="text-sm text-gray-600">
                      Mantén actualizado el contacto de tu veterinario de confianza
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="font-bold text-gray-800 mb-2">☎️ Centro de Toxicología</h3>
                    <p className="text-sm text-gray-600">
                      Servicio de consulta por intoxicaciones en mascotas
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <h3 className="font-bold text-gray-800 mb-2">🚗 Transporte de Emergencia</h3>
                    <p className="text-sm text-gray-600">
                      Servicios de ambulancia veterinaria en tu ciudad
                    </p>
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