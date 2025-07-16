import styled from 'styled-components'

interface ContainerProps {
  $isOnline: boolean
}

export const Container = styled.div<ContainerProps>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $isOnline }) => 
    $isOnline ? theme.colors.success : theme.colors.warning};
  color: ${({ $isOnline }) => 
    $isOnline ? '#ffffff' : '#1e293b'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translate(-50%, -100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`

export const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Message = styled.p`
  margin: 0;
  font-weight: 500;
  font-size: 0.9rem;
`