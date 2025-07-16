import styled from 'styled-components'

export const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin: 2rem 0;
  padding: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

export const PaginationInfo = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  font-weight: 500;
  
  @media (max-width: 767px) {
    order: 3;
    text-align: center;
  }
`

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 767px) {
    order: 1;
  }
`

export const PageButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.border};
  border-radius: 0.375rem;
  background-color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.white : theme.colors.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.primaryDark : `${theme.colors.primary}20`};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.white : theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PageNumber = styled.span`
  line-height: 1;
`

export const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.375rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => `${theme.colors.primary}20`};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.background};
      border-color: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.text};
    }
  }
  
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`

export const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  user-select: none;
`

export const ItemsPerPageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 767px) {
    order: 2;
    justify-content: center;
  }
`

export const ItemsPerPageLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
`

export const ItemsPerPageSelect = styled.select`
  padding: 0.375rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.375rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
  
  option {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`