import { useState, useEffect, useCallback } from 'react'

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ConversationState {
  messages: ConversationMessage[]
  isLoading: boolean
  error: string | null
  conversationId: string | null
}

export interface UseConversationOptions {
  userId?: string
  sessionId?: string
  autoLoad?: boolean
}

export interface SendMessageOptions {
  userPet?: any
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
}

/**
 * Hook personalizado para manejar conversaciones persistentes
 */
export function useConversation(options: UseConversationOptions = {}) {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null
  })

  // Generar sessionId si no se proporciona userId
  const conversationId = options.userId 
    ? { userId: options.userId }
    : { sessionId: options.sessionId || generateSessionId() }

  /**
   * Genera un sessionId único para usuarios anónimos
   */
  function generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('kahupet_session_id')
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('kahupet_session_id', sessionId)
      }
      return sessionId
    }
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Carga el historial de conversación desde el servidor
   */
  const loadConversationHistory = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams()
      if (conversationId.userId) {
        params.append('userId', conversationId.userId)
      } else if (conversationId.sessionId) {
        params.append('sessionId', conversationId.sessionId)
      }

      const response = await fetch(`/api/conversation?${params}`)
      
      if (!response.ok) {
        throw new Error('Error loading conversation history')
      }

      const data = await response.json()
      
      setState(prev => ({
        ...prev,
        messages: data.messages || [],
        conversationId: data.conversation?.id || null,
        isLoading: false
      }))

      return data.messages || []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      console.error('Error loading conversation history:', error)
      return []
    }
  }, [conversationId.userId, conversationId.sessionId])

  /**
   * Envía un mensaje y obtiene la respuesta
   */
  const sendMessage = useCallback(async (
    message: string, 
    options: SendMessageOptions = {}
  ) => {
    if (!message.trim()) {
      const error = 'El mensaje no puede estar vacío'
      setState(prev => ({ ...prev, error }))
      options.onError?.(error)
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Agregar mensaje del usuario inmediatamente a la UI
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))

      // Enviar al servidor
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          userPet: options.userPet,
          ...conversationId
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Crear mensaje de respuesta del asistente
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: JSON.stringify({
          summary: data.summary,
          petVoiceResponse: data.petVoiceResponse,
          recommendations: data.recommendations?.length || 0,
          total: data.total
        }),
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }))

      options.onSuccess?.(data)
      return data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error enviando mensaje'
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))

      options.onError?.(errorMessage)
      console.error('Error sending message:', error)
      return null
    }
  }, [conversationId])

  /**
   * Limpia la conversación actual
   */
  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null
    })

    // Limpiar sessionId si existe
    if (typeof window !== 'undefined' && conversationId.sessionId) {
      localStorage.removeItem('kahupet_session_id')
    }
  }, [conversationId.sessionId])

  /**
   * Obtiene estadísticas de la conversación actual
   */
  const getConversationStats = useCallback(() => {
    const userMessages = state.messages.filter(msg => msg.role === 'user')
    const assistantMessages = state.messages.filter(msg => msg.role === 'assistant')
    
    return {
      totalMessages: state.messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      hasConversation: state.messages.length > 0,
      conversationId: state.conversationId
    }
  }, [state.messages, state.conversationId])

  // Auto-cargar historial si está habilitado
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadConversationHistory()
    }
  }, [loadConversationHistory, options.autoLoad])

  return {
    // Estado
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    
    // Acciones
    sendMessage,
    loadConversationHistory,
    clearConversation,
    
    // Utilidades
    getConversationStats,
    
    // Información del identificador
    identifier: conversationId
  }
}

/**
 * Hook simplificado para usuarios autenticados
 */
export function useUserConversation(userId: string, autoLoad = true) {
  return useConversation({ userId, autoLoad })
}

/**
 * Hook simplificado para usuarios anónimos
 */
export function useSessionConversation(autoLoad = true) {
  return useConversation({ autoLoad })
} 