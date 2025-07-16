import React from 'react'
import { motion } from 'framer-motion'
import { LoaderContainer, Spinner, LoaderText } from './styles'

interface LoaderProps {
  text?: string
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Carregando...' }) => {
  return (
    <LoaderContainer>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Spinner />
      </motion.div>
      <LoaderText>{text}</LoaderText>
    </LoaderContainer>
  )
}