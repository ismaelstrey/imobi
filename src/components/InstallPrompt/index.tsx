import React, { useState, useEffect } from 'react'
import { FiDownload } from 'react-icons/fi'
import { Container, InstallButton } from './styles'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o comportamento padrão do navegador
      e.preventDefault()
      
      // Armazena o evento para uso posterior
      setInstallPrompt(e as BeforeInstallPromptEvent)
      
      // Mostra o componente
      setIsVisible(true)
    }

    // Detecta quando o app já está instalado
    const handleAppInstalled = () => {
      setIsVisible(false)
      console.log('App foi instalado com sucesso!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Verifica se o app já está instalado usando matchMedia
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(false)
      }
    }
    
    checkIfInstalled()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    // Mostra o prompt de instalação
    await installPrompt.prompt()

    // Espera o usuário responder ao prompt
    const choiceResult = await installPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      console.log('Usuário aceitou a instalação')
    } else {
      console.log('Usuário recusou a instalação')
    }

    // Limpa o prompt
    setInstallPrompt(null)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Container>
      <InstallButton onClick={handleInstallClick} id="install-button">
        <FiDownload size={18} />
        Instalar App
      </InstallButton>
    </Container>
  )
}

export default InstallPrompt