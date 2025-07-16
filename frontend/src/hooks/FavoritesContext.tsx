import React, { createContext, useContext, ReactNode } from 'react'
import { useFavorites } from './useFavorites'

interface FavoritesContextType {
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

interface FavoritesProviderProps {
  children: ReactNode
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const favoritesData = useFavorites()

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = (): FavoritesContextType => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavoritesContext deve ser usado dentro de um FavoritesProvider')
  }
  return context
}