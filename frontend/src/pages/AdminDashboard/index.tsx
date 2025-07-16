import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { apiService, Imovel, PaginationParams } from '../../services/api'
import { Loader } from '../../components/Loader'
import { Pagination } from '../../components/Pagination'
import { usePagination } from '../../hooks/usePagination'
import {
  Container,
  Header,
  Title,
  AddButton,
  PropertiesGrid,
  PropertyCard,
  PropertyImage,
  PropertyContent,
  PropertyTitle,
  PropertyPrice,
  PropertyLocation,
  PropertyActions,
  EditButton,
  DeleteButton,
  EmptyState,
  PaginationWrapper
} from './styles'

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  // Configuração da paginação
  const ITEMS_PER_PAGE = 8
  const pagination = usePagination<Imovel>({
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    initialPage: 1
  })

  const loadImoveis = async () => {
    try {
      setLoading(true)
      const paginationParams: PaginationParams = {
        page: pagination.currentPage,
        limit: ITEMS_PER_PAGE
      }
      const response = await apiService.getImoveis(paginationParams)
      
      if ('data' in response && 'pagination' in response) {
        // Resposta paginada do backend
        setImoveis(response.data)
        setTotalItems(response.pagination.totalItems)
      } else {
        // Fallback para resposta não paginada (compatibilidade)
        setImoveis(response as unknown as Imovel[])
        setTotalItems((response as unknown as Imovel[]).length)
      }
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error)
      // Dados mockados para demonstração
      setImoveis([
        {
          id: '1',
          titulo: 'Casa Moderna em Condomínio Fechado',
          preco: 850000,
          tipo: 'casa',
          endereco: 'Rua das Flores, 123',
          cidade: 'São Paulo',
          descricao: 'Linda casa com 3 dormitórios, piscina e área gourmet.',
          areaUtil: 180,
          dormitorios: 3,
          banheiros: 2,
          vagas: 2,
          imagens: ['/placeholder-image.jpg'],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImoveis()
  }, [pagination.currentPage])
  
  // Carregar imóveis iniciais
  useEffect(() => {
    loadImoveis()
  }, [])

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleEdit = (id: string) => {
    navigate(`/admin/editar/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        await apiService.deleteImovel(id)
        setImoveis(prev => prev.filter(imovel => imovel.id !== id))
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error)
        alert('Erro ao excluir imóvel. Tente novamente.')
      }
    }
  }

  const handleAddNew = () => {
    navigate('/admin/novo')
  }

  if (loading) {
    return (
      <Container>
        <Loader text="Carregando imóveis..." />
      </Container>
    )
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <Title>Painel Administrativo</Title>
          <AddButton onClick={handleAddNew}>
            <FaPlus />
            Novo Imóvel
          </AddButton>
        </Header>

        {imoveis.length > 0 ? (
          <>
            <PropertiesGrid>
              {imoveis.map((imovel) => (
                <motion.div
                  key={imovel.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard>
                    <PropertyImage
                      src={imovel.imagens[0] || '/placeholder-image.jpg'}
                      alt={imovel.titulo}
                    />
                    <PropertyContent>
                      <PropertyTitle>{imovel.titulo}</PropertyTitle>
                      <PropertyPrice>{formatPrice(imovel.preco)}</PropertyPrice>
                      <PropertyLocation>{imovel.cidade}</PropertyLocation>
                      
                      <PropertyActions>
                        <EditButton onClick={() => handleEdit(imovel.id)}>
                          <FaEdit />
                          Editar
                        </EditButton>
                        <DeleteButton onClick={() => handleDelete(imovel.id)}>
                          <FaTrash />
                          Excluir
                        </DeleteButton>
                      </PropertyActions>
                    </PropertyContent>
                  </PropertyCard>
                </motion.div>
              ))}
            </PropertiesGrid>
            
            <PaginationWrapper>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                startIndex={pagination.startIndex}
                endIndex={pagination.endIndex}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={pagination.goToPage}
                onNextPage={pagination.nextPage}
                onPreviousPage={pagination.previousPage}
                onFirstPage={pagination.goToFirstPage}
                onLastPage={pagination.goToLastPage}
                getPageNumbers={pagination.getPageNumbers}
                showItemsPerPageSelector={false}
              />
            </PaginationWrapper>
          </>
        ) : (
          <EmptyState>
            <h3>Nenhum imóvel cadastrado</h3>
            <p>
              Comece adicionando seu primeiro imóvel ao sistema.
            </p>
            <AddButton onClick={handleAddNew}>
              <FaPlus />
              Adicionar Primeiro Imóvel
            </AddButton>
          </EmptyState>
        )}
      </motion.div>
    </Container>
  )
}