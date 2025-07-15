import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaBath, FaCar, FaHeart, FaRegHeart } from 'react-icons/fa'
import { Imovel } from '../../services/api'
import { useFavoritesContext } from '../../hooks/FavoritesContext'
import {
  Card,
  ImageContainer,
  PropertyImage,
  PriceTag,
  TypeBadge,
  CardContent,
  PropertyTitle,
  PropertyLocation,
  PropertyFeatures,
  Feature,
  ViewButton,
  FavoriteButton
} from './styles'

interface PropertyCardProps {
  imovel: Imovel
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ imovel }) => {
  const navigate = useNavigate()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesContext()

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getTypeLabel = (type: string): string => {
    const types = {
      casa: 'Casa',
      apartamento: 'Apartamento',
      sala_comercial: 'Sala Comercial',
      terreno: 'Terreno'
    }
    return types[type as keyof typeof types] || type
  }

  const handleViewDetails = () => {
    navigate(`/imovel/${imovel.id}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation() // Evita que o card seja clicado
    
    if (isFavorite(imovel.id)) {
      removeFavorite(imovel.id)
    } else {
      addFavorite(imovel.id)
    }
  }

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleViewDetails}
    >
      <ImageContainer>
        <PropertyImage
          src={imovel.imagens[0] || '/placeholder-image.jpg'}
          alt={imovel.titulo}
        />
        <PriceTag>{formatPrice(imovel.preco)}</PriceTag>
        <TypeBadge>{getTypeLabel(imovel.tipo)}</TypeBadge>
        <FavoriteButton 
          onClick={handleToggleFavorite}
          $isFavorite={isFavorite(imovel.id)}
          aria-label={isFavorite(imovel.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {isFavorite(imovel.id) ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
      </ImageContainer>

      <CardContent>
        <PropertyTitle>{imovel.titulo}</PropertyTitle>
        
        <PropertyLocation>
          <FaMapMarkerAlt />
          {imovel.cidade}
        </PropertyLocation>

        <PropertyFeatures>
          {imovel.dormitorios > 0 && (
            <Feature>
              <FaBed />
              {imovel.dormitorios}
            </Feature>
          )}
          {imovel.banheiros > 0 && (
            <Feature>
              <FaBath />
              {imovel.banheiros}
            </Feature>
          )}
          {imovel.vagas > 0 && (
            <Feature>
              <FaCar />
              {imovel.vagas}
            </Feature>
          )}
        </PropertyFeatures>

        <ViewButton>Ver Detalhes</ViewButton>
      </CardContent>
    </Card>
  )
}