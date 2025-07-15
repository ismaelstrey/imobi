import React, { useState, useEffect } from 'react'
import { FiWifi, FiWifiOff } from 'react-icons/fi'
import { Container, Message, Icon } from './styles'
import { useOfflineContext } from '../../hooks/OfflineContext'

const OfflineNotice: React.FC = () => {
  const { isOnline } = useOfflineContext()
  const [showNotice, setShowNotice] = useState(!isOnline)

  useEffect(() => {
    // Mostra a notificação quando o status de conexão muda
    setShowNotice(true)
    
    // Esconde a notificação após 3 segundos se estiver online
    const timer = setTimeout(() => {
      if (isOnline) {
        setShowNotice(false)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [isOnline])

  if (!showNotice) return null

  return (
    <Container $isOnline={isOnline}>
      <Icon>
        {isOnline ? <FiWifi size={18} /> : <FiWifiOff size={18} />}
      </Icon>
      <Message>
        {isOnline 
          ? 'Você está online novamente!' 
          : 'Você está offline. Algumas funcionalidades podem estar limitadas.'}
      </Message>
    </Container>
  )
}

export default OfflineNotice