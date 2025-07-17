import React, { useEffect, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { useOfflineContext } from '../../hooks/OfflineContext'
import { apiService } from '../../services/api'
import { Container, SyncButton, SyncStatus } from './styles'

const SyncManager: React.FC = () => {
  const { isOnline } = useOfflineContext()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    success?: boolean
    syncedCount?: number
    failedCount?: number
    message?: string
  } | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [hasPendingOperations, setHasPendingOperations] = useState(false)

  // Verifica se há operações pendentes
  useEffect(() => {
    const checkPendingOperations = () => {
      const pending = apiService.hasPendingOperations()
      setHasPendingOperations(pending)
    }

    checkPendingOperations()
    
    // Verifica a cada 30 segundos
    const interval = setInterval(checkPendingOperations, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Tenta sincronizar automaticamente quando voltar a ficar online
  useEffect(() => {
    if (isOnline && hasPendingOperations && !isSyncing) {
      handleSync()
    }
  }, [isOnline, hasPendingOperations])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncResult(null)

    try {
      const result = await apiService.syncOfflineData()
      setSyncResult(result)
      setShowStatus(true)
      
      // Atualiza o status de operações pendentes
      setHasPendingOperations(apiService.hasPendingOperations())
      
      // Esconde o status após 5 segundos
      setTimeout(() => {
        setShowStatus(false)
      }, 5000)
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Erro ao sincronizar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
      setShowStatus(true)
    } finally {
      setIsSyncing(false)
    }
  }

  if (!hasPendingOperations && !showStatus) return null

  return (
    <Container>
      {showStatus && syncResult && (
        <SyncStatus $success={syncResult.success}>
          {syncResult.success 
            ? `Sincronização concluída! ${syncResult.syncedCount} operações sincronizadas.` 
            : syncResult.message || 'Erro ao sincronizar dados'}
        </SyncStatus>
      )}
      
      {hasPendingOperations && (
        <SyncButton 
          onClick={handleSync} 
          disabled={!isOnline || isSyncing}
          title={!isOnline ? 'Você precisa estar online para sincronizar' : 'Sincronizar dados'}
        >
          <FiRefreshCw size={16} className={isSyncing ? 'rotating' : ''} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </SyncButton>
      )}
    </Container>
  )
}

export default SyncManager