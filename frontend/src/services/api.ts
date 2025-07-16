import axios from 'axios'
import { addPendingOperation, getPendingOperations, syncPendingOperations } from '../utils/syncManager'

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL do backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptador para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@imobi:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptador para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@imobi:token')
      localStorage.removeItem('@imobi:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para as entidades
export interface Imovel {
  id: string
  titulo: string
  preco: number
  tipo: string
  endereco: string
  cidade: string
  descricao: string
  areaUtil: number
  dormitorios: number
  banheiros: number
  vagas: number
  imagens: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  nome: string
  role: 'admin' | 'user'
}

export interface LoginData {
  email: string
  senha: string
}

export interface ContatoData {
  nome: string
  email: string
  telefone: string
  mensagem: string
  imovelId?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Verifica se o dispositivo está online
 */
const isOnline = () => navigator.onLine

/**
 * Faz uma chamada à API com suporte a modo offline
 */
const apiCall = async (endpoint: string, method: string, data?: any) => {
  try {
    const config = {
      method,
      url: endpoint,
      data
    }
    const response = await api(config)
    return response.data
  } catch (error) {
    throw error
  }
}

// Funções da API
export const apiService = {
  // Sincronização
  syncOfflineData: async () => {
    if (isOnline()) {
      return await syncPendingOperations(apiCall)
    }
    return { success: false, message: 'Dispositivo offline' }
  },
  
  hasPendingOperations: () => {
    return getPendingOperations().length > 0
  },

  // Imóveis
  getImoveis: async (filters?: {
    tipo?: string
    cidade?: string
    precoMin?: number
    precoMax?: number
    dormitorios?: number
    banheiros?: number
    vagas?: number
    areaMin?: number
    areaMax?: number
  } & PaginationParams): Promise<PaginatedResponse<Imovel>> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
    }
    
    try {
      const response = await api.get(`/imoveis?${params.toString()}`)
      
      // Armazena os resultados no cache para uso offline
      if (isOnline()) {
        localStorage.setItem(
          '@imobi:cache:imoveis',
          JSON.stringify({
            data: response.data,
            timestamp: Date.now(),
            params: filters
          })
        )
      }
      
      return response.data
    } catch (error) {
      // Se estiver offline, tenta recuperar do cache
      if (!isOnline()) {
        const cachedData = localStorage.getItem('@imobi:cache:imoveis')
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          return parsed.data
        }
      }
      throw error
    }
  },

  getImovel: async (id: string): Promise<Imovel> => {
    try {
      const response = await api.get(`/imoveis/${id}`)
      
      // Armazena no cache para uso offline
      if (isOnline()) {
        localStorage.setItem(
          `@imobi:cache:imovel:${id}`,
          JSON.stringify({
            data: response.data,
            timestamp: Date.now()
          })
        )
      }
      
      return response.data
    } catch (error) {
      // Se estiver offline, tenta recuperar do cache
      if (!isOnline()) {
        const cachedData = localStorage.getItem(`@imobi:cache:imovel:${id}`)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          return parsed.data
        }
      }
      throw error
    }
  },

  createImovel: async (data: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isOnline()) {
      // Armazena a operação para sincronização posterior
      const operationId = addPendingOperation({
        type: 'create',
        endpoint: '/admin/imoveis',
        data
      })
      
      // Retorna um ID temporário para referência
      return {
        ...data,
        id: `temp_${operationId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pendingOperation: true
      }
    }
    
    const response = await api.post('/admin/imoveis', data)
    return response.data
  },

  updateImovel: async (id: string, data: Partial<Imovel>) => {
    if (!isOnline()) {
      // Armazena a operação para sincronização posterior
      addPendingOperation({
        type: 'update',
        endpoint: `/admin/imoveis/${id}`,
        data
      })
      
      // Atualiza o cache local
      const cachedData = localStorage.getItem(`@imobi:cache:imovel:${id}`)
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        const updatedData = { ...parsed.data, ...data, updatedAt: new Date().toISOString() }
        localStorage.setItem(
          `@imobi:cache:imovel:${id}`,
          JSON.stringify({
            data: updatedData,
            timestamp: Date.now()
          })
        )
        return updatedData
      }
      
      return { ...data, id, _pendingOperation: true }
    }
    
    const response = await api.put(`/admin/imoveis/${id}`, data)
    return response.data
  },

  deleteImovel: async (id: string) => {
    if (!isOnline()) {
      // Armazena a operação para sincronização posterior
      addPendingOperation({
        type: 'delete',
        endpoint: `/admin/imoveis/${id}`,
        data: { id }
      })
      
      // Remove do cache local
      localStorage.removeItem(`@imobi:cache:imovel:${id}`)
      
      return { success: true, _pendingOperation: true }
    }
    
    const response = await api.delete(`/admin/imoveis/${id}`)
    return response.data
  },

  // Autenticação
  login: async (data: LoginData): Promise<{ token: string; user: User }> => {
    // Login requer conexão com a internet
    if (!isOnline()) {
      throw new Error('É necessário estar online para fazer login')
    }
    
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // Contato
  enviarContato: async (data: ContatoData) => {
    if (!isOnline()) {
      // Armazena a operação para sincronização posterior
      addPendingOperation({
        type: 'create',
        endpoint: '/contato',
        data
      })
      
      return { success: true, _pendingOperation: true }
    }
    
    const response = await api.post('/contato', data)
    return response.data
  },

  // Upload de imagens
  uploadImagem: async (file: File): Promise<{ url: string }> => {
    // Upload de imagens requer conexão com a internet
    if (!isOnline()) {
      throw new Error('É necessário estar online para fazer upload de imagens')
    }
    
    const formData = new FormData()
    formData.append('imagem', file)
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default api