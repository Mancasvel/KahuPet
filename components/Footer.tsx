'use client'

import { Divider } from '@heroui/react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍽️</span>
              <h3 className="text-2xl font-bold">Komi</h3>
            </div>
            <p className="text-gray-300 text-sm">
              La mejor plataforma para descubrir restaurantes increíbles y crear menús perfectos para cualquier ocasión.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">🔗 Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Inicio</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Restaurantes</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Menús Grupales</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Favoritos</a></li>
            </ul>
          </div>

          {/* Para restaurantes */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">🏪 Restaurantes</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Registra tu restaurante</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Portal de socios</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Herramientas de gestión</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Comisiones</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-400">📞 Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">📧 hola@komi.food</li>
              <li className="text-gray-300">📱 +34 900 123 456</li>
              <li className="text-gray-300">🕒 Lun-Dom 9:00-22:00</li>
              <li className="flex gap-3 mt-4">
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📘</span>
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📷</span>
                <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🐦</span>
              </li>
            </ul>
          </div>
        </div>

        <Divider className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2024 Komi. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-400 transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Términos de Uso</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 