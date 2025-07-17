import { useContext } from 'react'
import { FavoritesContext, FavoritesContextType } from './FavoritesContext'

export const useFavoritesContext = (): FavoritesContextType => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavoritesContext deve ser usado dentro de um FavoritesProvider')
  }
  return context
}