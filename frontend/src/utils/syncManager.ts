/**
 * Gerenciador de sincronização para operações offline
 * Este utilitário permite armazenar operações realizadas offline
 * para sincronizá-las quando o usuário voltar a ficar online
 */

interface PendingOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  data: any
  timestamp: number
}

const STORAGE_KEY = '@imobi:pending_operations'

/**
 * Adiciona uma operação à fila de sincronização
 */
export const addPendingOperation = (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
  const pendingOperations = getPendingOperations()
  
  const newOperation: PendingOperation = {
    ...operation,
    id: generateId(),
    timestamp: Date.now()
  }
  
  pendingOperations.push(newOperation)
  savePendingOperations(pendingOperations)
  
  return newOperation.id
}

/**
 * Recupera todas as operações pendentes
 */
export const getPendingOperations = (): PendingOperation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Erro ao recuperar operações pendentes:', error)
    return []
  }
}

/**
 * Salva as operações pendentes no localStorage
 */
const savePendingOperations = (operations: PendingOperation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(operations))
  } catch (error) {
    console.error('Erro ao salvar operações pendentes:', error)
  }
}

/**
 * Remove uma operação da fila de sincronização
 */
export const removePendingOperation = (id: string) => {
  const pendingOperations = getPendingOperations()
  const filteredOperations = pendingOperations.filter(op => op.id !== id)
  savePendingOperations(filteredOperations)
}

/**
 * Gera um ID único para a operação
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Sincroniza todas as operações pendentes
 * @param apiCall Função que faz a chamada à API
 * @returns Promise com o resultado da sincronização
 */
export const syncPendingOperations = async (
  apiCall: (endpoint: string, method: string, data?: any) => Promise<any>
) => {
  const pendingOperations = getPendingOperations()
  
  if (pendingOperations.length === 0) {
    return { success: true, syncedCount: 0 }
  }
  
  const results = []
  const failedOperations = []
  
  // Ordena as operações por timestamp (mais antigas primeiro)
  const sortedOperations = [...pendingOperations].sort((a, b) => a.timestamp - b.timestamp)
  
  for (const operation of sortedOperations) {
    try {
      const method = operation.type === 'create' ? 'POST' : 
                    operation.type === 'update' ? 'PUT' : 'DELETE'
      
      const result = await apiCall(operation.endpoint, method, operation.data)
      results.push(result)
      
      // Remove a operação da fila após sincronização bem-sucedida
      removePendingOperation(operation.id)
    } catch (error) {
      console.error(`Erro ao sincronizar operação ${operation.id}:`, error)
      failedOperations.push(operation)
    }
  }
  
  return {
    success: failedOperations.length === 0,
    syncedCount: sortedOperations.length - failedOperations.length,
    failedCount: failedOperations.length,
    results
  }
}