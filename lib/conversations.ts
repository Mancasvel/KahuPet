import { withPawsitiveDB } from './mongodb'

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  _id?: string
  userId?: string
  sessionId?: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    userPet?: any
    lastQuery?: string
  }
}

/**
 * Configuración para limitar el historial de conversación
 */
const MAX_MESSAGES = 20
const COLLECTION_NAME = 'conversations'

/**
 * Obtiene una conversación existente por userId o sessionId
 */
export async function getConversation(identifier: { userId?: string; sessionId?: string }): Promise<Conversation | null> {
  return withPawsitiveDB(async (db) => {
    const collection = db.collection(COLLECTION_NAME)
    
    const query = identifier.userId 
      ? { userId: identifier.userId }
      : { sessionId: identifier.sessionId }
    
    const conversation = await collection.findOne(query, {
      sort: { updatedAt: -1 } // Obtener la conversación más reciente
    })
    
    return conversation
  })
}

/**
 * Crea una nueva conversación
 */
export async function createConversation(
  identifier: { userId?: string; sessionId?: string },
  initialMessage?: ConversationMessage,
  metadata?: any
): Promise<Conversation> {
  return withPawsitiveDB(async (db) => {
    const collection = db.collection(COLLECTION_NAME)
    
    const now = new Date()
    const conversation: Conversation = {
      ...(identifier.userId ? { userId: identifier.userId } : {}),
      ...(identifier.sessionId ? { sessionId: identifier.sessionId } : {}),
      messages: initialMessage ? [initialMessage] : [],
      createdAt: now,
      updatedAt: now,
      metadata: metadata || {}
    }
    
    const result = await collection.insertOne(conversation)
    
    return {
      ...conversation,
      _id: result.insertedId.toString()
    }
  })
}

/**
 * Agrega un mensaje a una conversación existente y limita el historial
 */
export async function addMessageToConversation(
  identifier: { userId?: string; sessionId?: string },
  message: ConversationMessage,
  metadata?: any
): Promise<Conversation> {
  return withPawsitiveDB(async (db) => {
    const collection = db.collection(COLLECTION_NAME)
    
    const query = identifier.userId 
      ? { userId: identifier.userId }
      : { sessionId: identifier.sessionId }
    
    // Obtener conversación actual
    let conversation = await collection.findOne(query, {
      sort: { updatedAt: -1 }
    })
    
    // Si no existe, crear una nueva
    if (!conversation) {
      return await createConversation(identifier, message, metadata)
    }
    
    // Agregar el nuevo mensaje
    const updatedMessages = [...conversation.messages, message]
    
    // Limitar el historial manteniendo los más recientes
    // Siempre mantener el mensaje del sistema si existe
    let limitedMessages = updatedMessages
    if (updatedMessages.length > MAX_MESSAGES) {
      const systemMessages = updatedMessages.filter(msg => msg.role === 'system')
      const otherMessages = updatedMessages.filter(msg => msg.role !== 'system')
      
      // Mantener mensajes del sistema + los mensajes más recientes
      const maxOtherMessages = MAX_MESSAGES - systemMessages.length
      const recentOtherMessages = otherMessages.slice(-maxOtherMessages)
      
      limitedMessages = [...systemMessages, ...recentOtherMessages]
    }
    
    // Actualizar la conversación
    const updateResult = await collection.updateOne(
      { _id: conversation._id },
      {
        $set: {
          messages: limitedMessages,
          updatedAt: new Date(),
          ...(metadata && { metadata: { ...conversation.metadata, ...metadata } })
        }
      }
    )
    
    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to update conversation')
    }
    
    // Retornar la conversación actualizada
    const updatedConversation = await collection.findOne({ _id: conversation._id })
    return updatedConversation!
  })
}

/**
 * Obtiene el historial de mensajes en el formato esperado por la API de OpenRouter
 */
export async function getConversationHistory(
  identifier: { userId?: string; sessionId?: string }
): Promise<ConversationMessage[]> {
  const conversation = await getConversation(identifier)
  
  if (!conversation) {
    return []
  }
  
  return conversation.messages
}

/**
 * Guarda un intercambio completo (pregunta del usuario + respuesta del asistente)
 */
export async function saveConversationExchange(
  identifier: { userId?: string; sessionId?: string },
  userMessage: string,
  assistantResponse: string,
  metadata?: any
): Promise<Conversation> {
  return withPawsitiveDB(async (db) => {
    const now = new Date()
    
    // Agregar mensaje del usuario
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: now
    }
    
    let conversation = await addMessageToConversation(identifier, userMsg, metadata)
    
    // Agregar respuesta del asistente
    const assistantMsg: ConversationMessage = {
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date()
    }
    
    conversation = await addMessageToConversation(identifier, assistantMsg, metadata)
    
    return conversation
  })
}

/**
 * Inicia una nueva conversación con un mensaje del sistema
 */
export async function initializeConversationWithSystem(
  identifier: { userId?: string; sessionId?: string },
  systemMessage: string,
  metadata?: any
): Promise<Conversation> {
  const systemMsg: ConversationMessage = {
    role: 'system',
    content: systemMessage,
    timestamp: new Date()
  }
  
  return await createConversation(identifier, systemMsg, metadata)
}

/**
 * Limpia conversaciones antiguas (opcional, para mantenimiento)
 */
export async function cleanupOldConversations(olderThanDays: number = 30): Promise<number> {
  return withPawsitiveDB(async (db) => {
    const collection = db.collection(COLLECTION_NAME)
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    
    const result = await collection.deleteMany({
      updatedAt: { $lt: cutoffDate }
    })
    
    return result.deletedCount || 0
  })
}

/**
 * Obtiene estadísticas de conversaciones (opcional, para administración)
 */
export async function getConversationStats(): Promise<{
  totalConversations: number
  totalMessages: number
  activeConversationsLast24h: number
}> {
  return withPawsitiveDB(async (db) => {
    const collection = db.collection(COLLECTION_NAME)
    
    const [totalConversations, totalMessages, activeConversations] = await Promise.all([
      collection.countDocuments(),
      collection.aggregate([
        { $project: { messageCount: { $size: '$messages' } } },
        { $group: { _id: null, total: { $sum: '$messageCount' } } }
      ]).toArray(),
      collection.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ])
    
    return {
      totalConversations,
      totalMessages: totalMessages[0]?.total || 0,
      activeConversationsLast24h: activeConversations
    }
  })
} 