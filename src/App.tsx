import React from 'react'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './hooks/useAuth'
import { AppRoutes } from './routes/AppRoutes'
import { GlobalStyle } from './styles/GlobalStyle'
import { theme } from './styles/theme'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App