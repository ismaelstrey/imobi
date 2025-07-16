import { useState, useEffect } from 'react'
import { useOfflineContext } from './OfflineContext'

interface Favorite {
  id: string
  imovelId: string
  timestamp: number
}

const STORAGE_KEY = '@imobi:favorites'

export function useFavorites() {
  const { isOnline } = useOfflineContext()
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    // Carrega os favoritos do localStorage ao inicializar
    const savedFavorites = localStorage.getItem(STORAGE_KEY)
    return savedFavorites ? JSON.parse(savedFavorites) : []
  })

  // Salva os favoritos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  /**
   * Adiciona um imóvel aos favoritos
   */
  const addFavorite = (imovelId: string) => {
    setFavorites(prev => {
      // Verifica se já existe
      if (prev.some(fav => fav.imovelId === imovelId)) {
        return prev
      }
      
      // Adiciona novo favorito
      return [
        ...prev,
        {
          id: `fav_${Date.now()}`,
          imovelId,
          timestamp: Date.now()
        }
      ]
    })

    // Se estiver online, sincroniza com o servidor
    if (isOnline) {
      // Aqui poderia ser implementada a sincronização com o backend
      // Por exemplo: api.post('/favoritos', { imovelId })
    }
  }

  /**
   * Remove um imóvel dos favoritos
   */
  const removeFavorite = (imovelId: string) => {
    setFavorites(prev => prev.filter(fav => fav.imovelId !== imovelId))

    // Se estiver online, sincroniza com o servidor
    if (isOnline) {
      // Aqui poderia ser implementada a sincronização com o backend
      // Por exemplo: api.delete(`/favoritos/${imovelId}`)
    }
  }

  /**
   * Verifica se um imóvel está nos favoritos
   */
  const isFavorite = (imovelId: string) => {
    return favorites.some(fav => fav.imovelId === imovelId)
  }

  /**
   * Retorna a lista de IDs dos imóveis favoritos
   */
  const getFavoriteIds = () => {
    return favorites.map(fav => fav.imovelId)
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteIds
  }
}