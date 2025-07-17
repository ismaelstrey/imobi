export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    });
  }
}

// Função para solicitar permissão de notificação
export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permissão de notificação concedida');
        // Aqui você pode subscrever o usuário para notificações push
        // subscribeUserToPush();
      }
    });
  }
}

// Função para verificar se o app está instalado ou pode ser instalado
export function setupInstallPrompt() {
  // Define um tipo para o evento BeforeInstallPromptEvent
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  const installButton = document.getElementById('install-button');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o comportamento padrão do navegador
    e.preventDefault();
    // Armazena o evento para uso posterior
    deferredPrompt = e;
    
    // Mostra o botão de instalação se ele existir
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', () => {
        // Mostra o prompt de instalação
        deferredPrompt.prompt();
        
        // Espera o usuário responder ao prompt
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Usuário aceitou a instalação do A2HS');
          } else {
            console.log('Usuário recusou a instalação do A2HS');
          }
          // Limpa a referência ao prompt
          deferredPrompt = null;
          
          // Esconde o botão de instalação
          if (installButton) {
            installButton.style.display = 'none';
          }
        });
      });
    }
  });
  
  // Detecta quando o app é instalado
  window.addEventListener('appinstalled', () => {
    console.log('App foi instalado');
    // Esconde o botão de instalação
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
}