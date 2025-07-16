import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerServiceWorker, setupInstallPrompt } from './registerSW'

// Registra o service worker para PWA
registerServiceWorker()

// Configura o prompt de instalação
setupInstallPrompt()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)