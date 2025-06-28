'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Input, Link, Divider } from '@heroui/react'
import { useAuth } from '@/lib/AuthContext'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onClose: () => void
}

export function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}

    if (!formData.email) {
      errors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    clearError()
    const success = await login(formData.email, formData.password)
    
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
            ¡Bienvenido de vuelta! 🐾
          </h2>
          <p className="text-gray-600">
            Inicia sesión para acceder a tus mascotas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            isInvalid={!!validationErrors.password}
            errorMessage={validationErrors.password}
            startContent={<span className="text-default-400">🔒</span>}
            variant="bordered"
            className="w-full"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <Divider className="my-6" />

        <div className="text-center">
          <p className="text-gray-600 mb-2">
            ¿No tienes una cuenta?
          </p>
          <Link
            as="button"
            color="primary"
            onClick={onSwitchToRegister}
            className="font-semibold"
          >
            Regístrate aquí 🐕
          </Link>
        </div>
      </CardBody>
    </Card>
  )
} 