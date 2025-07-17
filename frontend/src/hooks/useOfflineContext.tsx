import { useContext } from 'react'
import { OfflineContext, OfflineContextType } from './OfflineContext'

export const useOfflineContext = (): OfflineContextType => {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOfflineContext deve ser usado dentro de um OfflineProvider')
  }
  return context
}