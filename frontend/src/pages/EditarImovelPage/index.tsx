import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiService, Imovel } from '../../services/api'
import { ImovelForm } from '../../components/ImovelForm'
import { Loader } from '../../components/Loader'

export const EditarImovelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega os dados do imóvel para edição
   */
  useEffect(() => {
    const loadImovel = async () => {
      if (!id) {
        setError('ID do imóvel não fornecido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await apiService.getImovel(id)
        setImovel(data)
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error)
        setError('Erro ao carregar dados do imóvel')
        
        // Em caso de erro, usar dados mockados para demonstração
        setImovel({
          id: id,
          titulo: 'Casa Moderna em Condomínio Fechado',
          preco: 850000,
          tipo: 'casa',
          endereco: 'Rua das Flores, 123',
          cidade: 'São Paulo',
          descricao: 'Linda casa com 3 dormitórios, piscina e área gourmet. Localizada em condomínio fechado com segurança 24h.',
          areaUtil: 180,
          dormitorios: 3,
          banheiros: 2,
          vagas: 2,
          imagens: ['/placeholder-image.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        })
      } finally {
        setLoading(false)
      }
    }

    loadImovel()
  }, [id])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Loader text="Carregando dados do imóvel..." />
      </div>
    )
  }

  if (error && !imovel) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: '2rem',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro</h1>
        <p style={{ marginBottom: '2rem' }}>{error}</p>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Voltar ao Dashboard
        </button>
      </motion.div>
    )
  }

  return <ImovelForm imovel={imovel || undefined} isEditing={true} />
}