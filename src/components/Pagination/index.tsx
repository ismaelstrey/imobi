import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight 
} from 'react-icons/fa'
import {
  PaginationContainer,
  PaginationInfo,
  PaginationControls,
  PageButton,
  PageNumber,
  NavigationButton,
  Ellipsis,
  ItemsPerPageSelector,
  ItemsPerPageLabel,
  ItemsPerPageSelect
} from './styles'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPreviousPage: () => void
  onFirstPage: () => void
  onLastPage: () => void
  getPageNumbers: () => number[]
  onItemsPerPageChange?: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
  showItemsPerPageSelector?: boolean
  showInfo?: boolean
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  getPageNumbers,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  showItemsPerPageSelector = true,
  showInfo = true,
  className
}) => {
  const pageNumbers = getPageNumbers()

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value, 10)
    onItemsPerPageChange?.(newItemsPerPage)
  }

  if (totalPages <= 1 && !showInfo) {
    return null
  }

  return (
    <PaginationContainer className={className}>
      {showInfo && (
        <PaginationInfo>
          Mostrando {startIndex + 1} a {endIndex + 1} de {totalItems} itens
        </PaginationInfo>
      )}

      <PaginationControls>
        {/* Botão primeira página */}
        <NavigationButton
          onClick={onFirstPage}
          disabled={!hasPreviousPage}
          title="Primeira página"
          as={motion.button}
          whileHover={{ scale: hasPreviousPage ? 1.05 : 1 }}
          whileTap={{ scale: hasPreviousPage ? 0.95 : 1 }}
        >
          <FaAngleDoubleLeft />
        </NavigationButton>

        {/* Botão página anterior */}
        <NavigationButton
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
          title="Página anterior"
          as={motion.button}
          whileHover={{ scale: hasPreviousPage ? 1.05 : 1 }}
          whileTap={{ scale: hasPreviousPage ? 0.95 : 1 }}
        >
          <FaChevronLeft />
        </NavigationButton>

        {/* Números das páginas */}
        {pageNumbers.map((pageNumber, index) => {
          const prevPage = pageNumbers[index - 1]
          const showEllipsisBefore = prevPage && pageNumber - prevPage > 1

          return (
            <React.Fragment key={pageNumber}>
              {showEllipsisBefore && <Ellipsis>...</Ellipsis>}
              
              <PageButton
                onClick={() => onPageChange(pageNumber)}
                $isActive={pageNumber === currentPage}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Página ${pageNumber}`}
              >
                <PageNumber>{pageNumber}</PageNumber>
              </PageButton>
            </React.Fragment>
          )
        })}

        {/* Botão próxima página */}
        <NavigationButton
          onClick={onNextPage}
          disabled={!hasNextPage}
          title="Próxima página"
          as={motion.button}
          whileHover={{ scale: hasNextPage ? 1.05 : 1 }}
          whileTap={{ scale: hasNextPage ? 0.95 : 1 }}
        >
          <FaChevronRight />
        </NavigationButton>

        {/* Botão última página */}
        <NavigationButton
          onClick={onLastPage}
          disabled={!hasNextPage}
          title="Última página"
          as={motion.button}
          whileHover={{ scale: hasNextPage ? 1.05 : 1 }}
          whileTap={{ scale: hasNextPage ? 0.95 : 1 }}
        >
          <FaAngleDoubleRight />
        </NavigationButton>
      </PaginationControls>

      {/* Seletor de itens por página */}
      {showItemsPerPageSelector && onItemsPerPageChange && (
        <ItemsPerPageSelector>
          <ItemsPerPageLabel>Itens por página:</ItemsPerPageLabel>
          <ItemsPerPageSelect
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </ItemsPerPageSelect>
        </ItemsPerPageSelector>
      )}
    </PaginationContainer>
  )
}