import { NextRequest, NextResponse } from 'next/server'
import { 
  getConversation, 
  getConversationHistory, 
  getConversationStats,
  cleanupOldConversations 
} from '@/lib/conversations'

/**
 * GET - Obtiene el historial de conversación para un usuario o sesión
 * Query params: userId o sessionId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'userId or sessionId is required' }, 
        { status: 400 }
      )
    }

    const conversationId = { userId: userId || undefined, sessionId: sessionId || undefined }
    
    console.log('📚 Obteniendo historial de conversación para:', conversationId)

    const conversation = await getConversation(conversationId)
    
    if (!conversation) {
      return NextResponse.json({
        conversation: null,
        messages: [],
        total: 0
      })
    }

    return NextResponse.json({
      conversation: {
        id: conversation._id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        metadata: conversation.metadata
      },
      messages: conversation.messages,
      total: conversation.messages.length
    })

  } catch (error) {
    console.error('Error obteniendo conversación:', error)
    return NextResponse.json(
      { error: 'Error retrieving conversation' }, 
      { status: 500 }
    )
  }
}

/**
 * DELETE - Limpia conversaciones antiguas
 * Query params: days (opcional, por defecto 30)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    console.log(`🧹 Limpiando conversaciones anteriores a ${days} días`)

    const deletedCount = await cleanupOldConversations(days)

    return NextResponse.json({
      success: true,
      deletedConversations: deletedCount,
      message: `${deletedCount} conversaciones eliminadas`
    })

  } catch (error) {
    console.error('Error limpiando conversaciones:', error)
    return NextResponse.json(
      { error: 'Error cleaning up conversations' }, 
      { status: 500 }
    )
  }
}

/**
 * POST - Obtiene estadísticas de conversaciones (admin)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📊 Obteniendo estadísticas de conversaciones')

    const stats = await getConversationStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error retrieving conversation stats' }, 
      { status: 500 }
    )
  }
} 