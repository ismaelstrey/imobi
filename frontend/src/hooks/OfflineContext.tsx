import React, { createContext, useContext, ReactNode } from 'react'
import { useOfflineMode } from './useOfflineMode'

interface OfflineContextType {
  isOnline: boolean
  lastOnlineTime: Date | null
  cachedData: Record<string, any>
  saveToCache: (key: string, data: any) => void
  getFromCache: (key: string) => any
}

interface OfflineProviderProps {
  children: ReactNode
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const offlineMode = useOfflineMode()

  return (
    <OfflineContext.Provider value={offlineMode}>
      {children}
    </OfflineContext.Provider>
  )
}

export const useOfflineContext = (): OfflineContextType => {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOfflineContext deve ser usado dentro de um OfflineProvider')
  }
  return context
}