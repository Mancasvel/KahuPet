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

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

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
      size="sm"
      backdrop="blur"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        base: `
          border border-gray-200 
          mx-2 my-auto 
          sm:mx-6 
          md:mx-auto 
          max-w-[calc(100vw-16px)] 
          sm:max-w-md 
          max-h-[85vh] 
          sm:max-h-[80vh]
          mobile-modal
        `,
        header: "border-b-[1px] border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0",
        body: "px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto mobile-scroll",
      }}
    >
      <ModalContent className="flex flex-col max-h-[85vh]">
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
        <ModalBody className="flex-1 min-h-0">
          <div className="w-full h-full">
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