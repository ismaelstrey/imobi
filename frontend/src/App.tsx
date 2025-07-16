import React from 'react'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'
import { GlobalStyle } from './styles/GlobalStyle'
import { theme } from './styles/theme'
import InstallPrompt from './components/InstallPrompt'
import OfflineNotice from './components/OfflineNotice'
import SyncManager from './components/SyncManager'
import { OfflineProvider } from './hooks/OfflineContext'
import { FavoritesProvider } from './hooks/FavoritesContext'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <OfflineProvider>
        <FavoritesProvider>
          <AuthProvider>
            <AppRoutes />
            <InstallPrompt />
            <OfflineNotice />
            <SyncManager />
          </AuthProvider>
        </FavoritesProvider>
      </OfflineProvider>
    </ThemeProvider>
  )
}

export default App