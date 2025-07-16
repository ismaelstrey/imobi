import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaExclamationTriangle } from 'react-icons/fa'
import {
  Container,
  NotFoundIcon,
  Title,
  Subtitle,
  HomeButton
} from './styles'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <NotFoundIcon>
          <FaExclamationTriangle />
        </NotFoundIcon>
        
        <Title>404</Title>
        
        <Subtitle>
          Oops! A página que você está procurando não foi encontrada. 
          Ela pode ter sido movida ou não existe mais.
        </Subtitle>
        
        <HomeButton onClick={handleGoHome}>
          <FaHome />
          Voltar ao Início
        </HomeButton>
      </motion.div>
    </Container>
  )
}