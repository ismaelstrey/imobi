import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { ImovelPage } from '../pages/ImovelPage'
import { LoginPage } from '../pages/LoginPage'
import { AdminDashboard } from '../pages/AdminDashboard'
import { NovoImovelPage } from '../pages/NovoImovelPage'
import { EditarImovelPage } from '../pages/EditarImovelPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import FavoritosPage from '../pages/FavoritosPage'
import { PrivateRoute } from '../components/PrivateRoute'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/imovel/:id" element={<ImovelPage />} />
        <Route path="/favoritos" element={<FavoritosPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas privadas (admin) */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/novo" 
          element={
            <PrivateRoute>
              <NovoImovelPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/editar/:id" 
          element={
            <PrivateRoute>
              <EditarImovelPage />
            </PrivateRoute>
          } 
        />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}