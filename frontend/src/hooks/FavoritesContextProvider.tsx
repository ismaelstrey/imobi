import React, { ReactNode } from 'react'
import { FavoritesContext } from './FavoritesContext'
import { useFavorites } from './useFavorites'

interface FavoritesProviderProps {
  children: ReactNode
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const favoritesData = useFavorites()

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  )
}