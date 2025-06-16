'use client'

import { Divider } from '@heroui/react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 rounded-lg p-2">
                <span className="text-2xl font-bold text-black">K</span>
              </div>
              <span className="text-2xl font-bold">Komi</span>
            </div>
            <p className="text-gray-400 text-sm">
              Comida a domicilio y mucho más. Los mejores restaurantes de tu ciudad 
              con entrega rápida y servicio de calidad.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                📱 iOS
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                📱 Android
              </a>
            </div>
          </div>

          {/* Colabora con Komi */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Colabora con Komi</h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Hazte repartidor
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Hazte Partner
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Trabaja con nosotros
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Komi Business
              </a>
            </div>
          </div>

          {/* Enlaces de interés */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enlaces de interés</h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Acerca de nosotros
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Preguntas frecuentes
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Komi Prime
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Blog
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contacto
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Seguridad
              </a>
            </div>
          </div>

          {/* Síguenos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Síguenos</h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                📘 Facebook
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                📸 Instagram
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                🐦 Twitter
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                💼 LinkedIn
              </a>
            </div>
            
            <div className="pt-4">
              <h4 className="font-medium mb-2">Principales ciudades</h4>
              <div className="space-y-1">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-xs">
                  Madrid
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-xs">
                  Barcelona
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors text-xs">
                  Valencia
                </a>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-8 bg-gray-700" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6 text-xs">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Condiciones de uso
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Política de cookies
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Cumplimiento
            </a>
          </div>
          
          <div className="text-xs text-gray-500">
            © 2024 Komi. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
} 