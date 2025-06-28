'use client'

import { useState, useEffect } from 'react'
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

  // Actualizar el modo cuando cambie defaultMode
  useEffect(() => {
    setMode(defaultMode)
  }, [defaultMode])

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
      size="full"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        base: "border border-gray-200 mx-2 my-2 sm:mx-6 sm:my-6 md:mx-auto md:my-auto max-w-lg md:max-w-2xl max-h-[95vh] sm:max-h-[90vh]",
        header: "border-b-[1px] border-gray-200 px-4 py-3 sm:px-6 sm:py-4",
        body: "px-4 py-2 sm:px-6 sm:py-4 max-h-[calc(95vh-120px)] overflow-y-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 flex-shrink-0">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kahupet
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Tu compañero digital para el bienestar de mascotas
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="flex-1 overflow-y-auto scrollbar-hide smooth-scroll">
          <div className="w-full max-w-md mx-auto">
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
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 