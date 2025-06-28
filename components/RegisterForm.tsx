'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Input, Link, Divider } from '@heroui/react'
import { useAuth } from '@/lib/AuthContext'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onClose: () => void
}

export function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const { register, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    if (!formData.name) {
      errors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.email) {
      errors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    clearError()
    const success = await register(formData.name, formData.email, formData.password)
    
    if (success) {
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) clearError()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardBody className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Únete a Kahupet! 🐾
          </h2>
          <p className="text-gray-600">
            Crea tu cuenta para registrar hasta 5 mascotas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Nombre completo"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            isInvalid={!!validationErrors.name}
            errorMessage={validationErrors.name}
            startContent={<span className="text-default-400">👤</span>}
            variant="bordered"
            className="w-full"
          />

          <Input
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            isInvalid={!!validationErrors.email}
            errorMessage={validationErrors.email}
            startContent={<span className="text-default-400">📧</span>}
            variant="bordered"
            className="w-full"
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            isInvalid={!!validationErrors.password}
            errorMessage={validationErrors.password}
            startContent={<span className="text-default-400">🔒</span>}
            variant="bordered"
            className="w-full"
          />

          <Input
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            isInvalid={!!validationErrors.confirmPassword}
            errorMessage={validationErrors.confirmPassword}
            startContent={<span className="text-default-400">🔐</span>}
            variant="bordered"
            className="w-full"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">💡</span>
              <div className="text-blue-700 text-sm">
                <p className="font-semibold mb-1">¡Beneficios de registrarte!</p>
                <ul className="text-xs space-y-1">
                  <li>• Hasta 5 mascotas registradas</li>
                  <li>• Respuestas personalizadas</li>
                  <li>• Historial de consultas</li>
                  <li>• Recomendaciones específicas</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <Divider className="my-6" />

        <div className="text-center">
          <p className="text-gray-600 mb-2">
            ¿Ya tienes una cuenta?
          </p>
          <Link
            as="button"
            color="primary"
            onClick={onSwitchToLogin}
            className="font-semibold"
          >
            Inicia sesión aquí 🐱
          </Link>
        </div>
      </CardBody>
    </Card>
  )
} 