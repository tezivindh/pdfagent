import axios from 'axios'
import type { PDFUploadResponse, ChatResponse, ChatMessage, PDFMetadata } from '../types/index'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

export const uploadPDF = async (file: File): Promise<PDFUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<PDFUploadResponse>('/api/pdf/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000, // 5 minutes timeout for large PDFs
  })
  return response.data
}

export const sendMessage = async (
  message: string, 
  conversation_id: string
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/api/chat', { message, conversation_id })
  return response.data
}

export const getChatHistory = async (
  conversation_id: string
): Promise<{ messages: ChatMessage[]; pdf_metadata: PDFMetadata }> => {
  const response = await api.get<{ messages: ChatMessage[]; pdf_metadata: PDFMetadata }>(`/api/chat/history/${conversation_id}`)
  return response.data
}

export const deletePDF = async (conversation_id: string): Promise<void> => {
  await api.delete(`/api/pdf/${conversation_id}`)
}
