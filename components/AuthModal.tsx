'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)

  const handleClose = () => {
    setMode('login')
    onClose()
  }

  const switchToLogin = () => setMode('login')
  const switchToRegister = () => setMode('register')

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      backdrop="blur"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        base: "border border-gray-200",
        header: "border-b-[1px] border-gray-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kahupet
            </h1>
            <p className="text-sm text-gray-500">
              Tu compañero digital para el bienestar de mascotas
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          {mode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={switchToRegister}
              onClose={handleClose}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
              onClose={handleClose}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 