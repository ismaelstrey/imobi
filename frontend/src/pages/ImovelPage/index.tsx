import React from 'react'
import { motion } from 'framer-motion'

export const ImovelPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Detalhes do Imóvel</h1>
        <p>Página em desenvolvimento...</p>
      </div>
    </motion.div>
  )
}