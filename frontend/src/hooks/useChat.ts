import { useState, useCallback } from 'react'
import { ChatMessage, PDFMetadata } from '../types'
import { uploadPDF, sendMessage as apiSendMessage, deletePDF } from '../lib/api'

export const useChat = () => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)
    try {
      const response = await uploadPDF(file)
      setConversationId(response.conversation_id)
      setPdfMetadata({
        filename: response.filename,
        page_count: response.page_count,
        chunk_count: response.chunk_count,
        loaded_at: new Date().toISOString()
      })
      setMessages([])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload PDF')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      citations: [],
      is_refusal: false,
      confidence: 0,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    setIsSending(true)
    setError(null)

    try {
      const response = await apiSendMessage(text, conversationId)
      
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        is_refusal: response.is_refusal,
        refusal_reason: response.refusal_reason as ChatMessage['refusal_reason'],
        confidence: response.confidence,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send message')
      setMessages(prev => prev.filter(msg => msg !== userMsg))
    } finally {
      setIsSending(false)
    }
  }, [conversationId])

  const clearSession = useCallback(async () => {
    if (conversationId) {
      try {
        await deletePDF(conversationId)
      } catch (e) {
        console.error('Failed to delete session', e)
      }
    }
    setConversationId(null)
    setPdfMetadata(null)
    setMessages([])
    setError(null)
  }, [conversationId])

  return {
    conversationId,
    pdfMetadata,
    messages,
    isUploading,
    isSending,
    error,
    handleUpload,
    sendMessage,
    clearSession
  }
}
