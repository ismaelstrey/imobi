import React, { useState, useEffect } from 'react'
import { PropertyCard } from '../../components/PropertyCard'
import { useFavoritesContext } from '../../hooks/FavoritesContext'
import { apiService, Imovel } from '../../services/api'
import { useOfflineContext } from '../../hooks/OfflineContext'
import { Container, Title, FavoritesGrid, EmptyState, LoadingContainer } from './styles'
import { FaHeart } from 'react-icons/fa'
import { Loader } from '../../components/Loader'

const FavoritosPage: React.FC = () => {
  const { getFavoriteIds } = useFavoritesContext()
  const { isOnline, getFromCache } = useOfflineContext()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoritos = async () => {
      setLoading(true)
      const favoriteIds = getFavoriteIds()
      
      if (favoriteIds.length === 0) {
        setImoveis([])
        setLoading(false)
        return
      }

      try {
        // Se estiver online, busca os imóveis da API
        if (isOnline) {
          const imoveisPromises = favoriteIds.map(id => apiService.getImovel(id))
          const imoveisData = await Promise.all(imoveisPromises)
          setImoveis(imoveisData)
        } else {
          // Se estiver offline, busca do cache
          const cachedImoveis = favoriteIds
            .map(id => {
              const cachedData = getFromCache(`imovel:${id}`)
              return cachedData ? cachedData : null
            })
            .filter(Boolean) as Imovel[]
          
          setImoveis(cachedImoveis)
        }
      } catch (error) {
        console.error('Erro ao buscar imóveis favoritos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoritos()
  }, [getFavoriteIds, isOnline, getFromCache])

  if (loading) {
    return (
      <LoadingContainer>
        <Loader />
      </LoadingContainer>
    )
  }

  return (
    <Container>
      <Title>Meus Favoritos</Title>
      
      {imoveis.length > 0 ? (
        <FavoritesGrid>
          {imoveis.map(imovel => (
            <PropertyCard key={imovel.id} imovel={imovel} />
          ))}
        </FavoritesGrid>
      ) : (
        <EmptyState>
          <FaHeart size={48} />
          <h3>Nenhum imóvel favorito</h3>
          <p>Adicione imóveis aos favoritos para vê-los aqui</p>
        </EmptyState>
      )}
    </Container>
  )
}

export default FavoritosPage