'use client'

import { Divider } from '@heroui/react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🐾</span>
              </div>
              <span className="text-2xl font-bold text-white">Kahupet</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              La plataforma de inteligencia artificial que entiende a tu mascota. 
              Recomendaciones personalizadas de entrenamiento, nutrición y bienestar 
              para perros y gatos.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-slate-400">🐕 Perros</span>
              <span className="text-slate-400">🐱 Gatos</span>
              <span className="text-slate-400">🤖 IA</span>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Servicios</h3>
            <div className="space-y-3">
              <a href="/entrenamiento" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Entrenamiento
              </a>
              <a href="/nutricion" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Nutrición
              </a>
              <a href="/bienestar" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Bienestar
              </a>
              <a href="/veterinarios" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Veterinarios
              </a>
              <a href="/mascotas" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Gestión de mascotas
              </a>
            </div>
          </div>

          {/* Soporte y Recursos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Soporte</h3>
            <div className="space-y-3">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Centro de ayuda
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Preguntas frecuentes
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Guías de cuidado
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Contacto
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Blog de mascotas
              </a>
            </div>
          </div>

          {/* Empresa y Comunidad */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-white">Empresa</h3>
            <div className="space-y-3">
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Acerca de nosotros
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Misión y valores
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Equipo
              </a>
              <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">
                Trabajar con nosotros
              </a>
            </div>
            
            <div className="pt-4">
              <h4 className="font-medium mb-3 text-white">Síguenos</h4>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📸
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  📺
                </a>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-12 bg-slate-700" />

        {/* Footer bottom */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Términos de servicio
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Política de cookies
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              Aviso legal
            </a>
          </div>
          
          <div className="text-sm text-slate-500 text-center lg:text-right">
            <p>© 2024 Kahupet. Todos los derechos reservados.</p>
            <p className="text-xs mt-1">Hecho con ❤️ para el bienestar de las mascotas</p>
          </div>
        </div>
      </div>
    </footer>
  )
} 