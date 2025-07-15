import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

interface PaginationResult<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  getPaginatedItems: (items: T[]) => T[]
  getPageNumbers: () => number[]
}

/**
 * Hook personalizado para gerenciar paginação
 * @param totalItems - Total de itens a serem paginados
 * @param itemsPerPage - Número de itens por página
 * @param initialPage - Página inicial (padrão: 1)
 * @returns Objeto com estado e funções de paginação
 */
export const usePagination = <T,>({
  totalItems,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Cálculos derivados
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage
  }, [currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage - 1, totalItems - 1)
  }, [startIndex, itemsPerPage, totalItems])

  // Funções de navegação
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  // Função para obter itens paginados
  const getPaginatedItems = (items: T[]): T[] => {
    return items.slice(startIndex, startIndex + itemsPerPage)
  }

  // Função para obter números das páginas para exibição
  const getPageNumbers = (): number[] => {
    const pages: number[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Se temos poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas com reticências
      const halfVisible = Math.floor(maxVisiblePages / 2)
      
      if (currentPage <= halfVisible + 1) {
        // Início: 1, 2, 3, 4, 5, ..., last
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - halfVisible) {
        // Final: 1, ..., n-4, n-3, n-2, n-1, n
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pages.push(1)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    getPaginatedItems,
    getPageNumbers
  }
}