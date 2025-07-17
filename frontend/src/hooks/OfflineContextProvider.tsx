import React, { ReactNode } from 'react'
import { OfflineContext } from './OfflineContext'
import { useOfflineMode } from './useOfflineMode'

interface OfflineProviderProps {
  children: ReactNode
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const offlineMode = useOfflineMode()

  return (
    <OfflineContext.Provider value={offlineMode}>
      {children}
    </OfflineContext.Provider>
  )
}