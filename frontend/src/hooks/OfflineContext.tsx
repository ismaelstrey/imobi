import { createContext } from 'react'

export interface OfflineContextType {
  isOnline: boolean
  lastOnlineTime: Date | null
  cachedData: Record<string, unknown>
  saveToCache: (key: string, data: unknown) => void
  getFromCache: (key: string) => unknown
}

export const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

// Re-exportando os componentes e hooks
export { OfflineProvider } from './OfflineContextProvider'
export { useOfflineContext } from './useOfflineContext'