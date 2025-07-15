import axios from 'axios'

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

// Funções da API
export const apiService = {
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
    const response = await api.get(`/imoveis?${params.toString()}`)
    return response.data
  },

  getImovel: async (id: string): Promise<Imovel> => {
    const response = await api.get(`/imoveis/${id}`)
    return response.data
  },

  createImovel: async (data: Omit<Imovel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/admin/imoveis', data)
    return response.data
  },

  updateImovel: async (id: string, data: Partial<Imovel>) => {
    const response = await api.put(`/admin/imoveis/${id}`, data)
    return response.data
  },

  deleteImovel: async (id: string) => {
    const response = await api.delete(`/admin/imoveis/${id}`)
    return response.data
  },

  // Autenticação
  login: async (data: LoginData): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // Contato
  enviarContato: async (data: ContatoData) => {
    const response = await api.post('/contato', data)
    return response.data
  },

  // Upload de imagens
  uploadImagem: async (file: File): Promise<{ url: string }> => {
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