import React from 'react'
import { FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import { 
  HeaderContainer, 
  HeaderContent, 
  Logo, 
  Nav, 
  NavLink, 
  UserMenu, 
  UserName, 
  LogoutButton 
} from './styles'

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <FaHome />
          Imobi
        </Logo>

        <Nav>
          <NavLink to="/">Início</NavLink>
          
          {isAuthenticated ? (
            <UserMenu>
              <NavLink to="/admin">Dashboard</NavLink>
              <UserName>Olá, {user?.nome}</UserName>
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt />
              </LogoutButton>
            </UserMenu>
          ) : (
            <NavLink to="/login">
              <FaUser /> Login
            </NavLink>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  )
}