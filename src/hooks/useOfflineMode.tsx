import { useState, useEffect } from 'react'

interface UseOfflineModeReturn {
  isOnline: boolean
  lastOnlineTime: Date | null
  cachedData: Record<string, any>
  saveToCache: (key: string, data: any) => void
  getFromCache: (key: string) => any
}

/**
 * Hook para gerenciar o estado online/offline e o cache da aplicação
 */
export function useOfflineMode(): UseOfflineModeReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(isOnline ? new Date() : null)
  const [cachedData, setCachedData] = useState<Record<string, any>>(() => {
    // Recupera dados do cache do localStorage ao inicializar
    const savedCache = localStorage.getItem('@imobi:cache')
    return savedCache ? JSON.parse(savedCache) : {}
  })

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnlineTime(new Date())
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Salva o cache no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('@imobi:cache', JSON.stringify(cachedData))
  }, [cachedData])

  /**
   * Salva dados no cache
   */
  const saveToCache = (key: string, data: any) => {
    setCachedData(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: new Date().getTime()
      }
    }))
  }

  /**
   * Recupera dados do cache
   */
  const getFromCache = (key: string) => {
    const cachedItem = cachedData[key]
    if (!cachedItem) return null

    // Verifica se o cache expirou (24 horas)
    const now = new Date().getTime()
    const expirationTime = 24 * 60 * 60 * 1000 // 24 horas em milissegundos
    
    if (now - cachedItem.timestamp > expirationTime) {
      // Remove o item expirado do cache
      const newCache = { ...cachedData }
      delete newCache[key]
      setCachedData(newCache)
      return null
    }

    return cachedItem.data
  }

  return {
    isOnline,
    lastOnlineTime,
    cachedData,
    saveToCache,
    getFromCache
  }
}