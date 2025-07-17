import { createContext } from 'react'

export interface FavoritesContextType {
  favorites: Array<{
    id: string
    imovelId: string
    timestamp: number
  }>
  addFavorite: (imovelId: string) => void
  removeFavorite: (imovelId: string) => void
  isFavorite: (imovelId: string) => boolean
  getFavoriteIds: () => string[]
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

// Re-exportando os componentes e hooks
export { FavoritesProvider } from './FavoritesContextProvider'
export { useFavoritesContext } from './useFavoritesContext'