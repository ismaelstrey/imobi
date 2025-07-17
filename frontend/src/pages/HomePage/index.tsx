import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiService, Imovel, PaginationParams } from "../../services/api";
import { PropertyCard } from "../../components/PropertyCard";
import { PropertyFilters } from "../../components/PropertyFilters";
import { Pagination } from "../../components/Pagination";
import { Loader } from "../../components/Loader";
import { usePagination } from "../../hooks/usePagination";
import {
  Container,
  Hero,
  HeroTitle,
  HeroSubtitle,
  Content,
  FiltersSection,
  PropertiesSection,
  PropertiesGrid,
  LoadingContainer,
  EmptyState,
  PaginationWrapper,
} from "./styles";

interface Filters {
  tipo?: string;
  cidade?: string;
  precoMin?: number;
  precoMax?: number;
  dormitorios?: number;
}

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Filters & PaginationParams>({});
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Configuração da paginação
  const pagination = usePagination<Imovel>({
    totalItems,
    itemsPerPage,
    initialPage: 1,
  });

  const loadImoveis = async (
    currentFilters: Filters & PaginationParams = {}
  ) => {
    try {
      setLoading(true);
      const paginationParams: PaginationParams = {
        page: pagination.currentPage,
        limit: itemsPerPage,
      };
      const mergedFilters = { ...currentFilters, ...paginationParams };
      const response = await apiService.getImoveis(mergedFilters);

      if ("data" in response && "pagination" in response) {
        // Resposta paginada do backend
        setImoveis(response.data);
        setTotalItems(response.pagination.totalItems);
      } else {
        // Fallback para resposta não paginada (compatibilidade)
        setImoveis(response as unknown as Imovel[]);
        setTotalItems((response as unknown as Imovel[]).length);
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      // Em caso de erro, usar dados mockados para demonstração
      setImoveis([
        {
          id: "1",
          titulo: "Casa Moderna em Condomínio Fechado",
          preco: 850000,
          tipo: "casa",
          endereco: "Rua das Flores, 123",
          cidade: "São Paulo",
          descricao: "Linda casa com 3 dormitórios, piscina e área gourmet.",
          areaUtil: 180,
          dormitorios: 3,
          banheiros: 2,
          vagas: 2,
          imagens: [
            "data:image/jpeg;base64,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",
          ],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          titulo: "Apartamento no Centro",
          preco: 450000,
          tipo: "apartamento",
          endereco: "Av. Paulista, 1000",
          cidade: "São Paulo",
          descricao: "Apartamento moderno com vista para a cidade.",
          areaUtil: 85,
          dormitorios: 2,
          banheiros: 1,
          vagas: 1,
          imagens: [
            "data:image/jpeg;base64,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",
          ],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImoveis(filters);
  }, [pagination.currentPage, itemsPerPage]);

  // Carregar imóveis iniciais
  useEffect(() => {
    loadImoveis(filters);
  }, []);

  const handleFiltersChange = (newFilters: Filters) => {
    // Ao mudar os filtros, voltamos para a primeira página
    pagination.goToFirstPage();
    setFilters(newFilters);
    loadImoveis(newFilters);
  };

  // Função para mudar o número de itens por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    // Atualiza o estado local para armazenar o novo número de itens por página
    // Como ITEMS_PER_PAGE é uma constante, precisamos criar uma variável de estado
    setItemsPerPage(newItemsPerPage);

    // Recarrega os imóveis com o novo valor de itens por página
    // Volta para a primeira página ao mudar o número de itens
    loadImoveis({
      ...filters,
      page: 1,
      limit: newItemsPerPage,
    });
    // Função implementada para alterar o número de itens por página
  };

  return (
    <Container>
      <Hero>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroTitle>Encontre o Imóvel dos Seus Sonhos</HeroTitle>
          <HeroSubtitle>
            Descubra as melhores opções de casas, apartamentos e imóveis
            comerciais com a qualidade e confiança que você merece.
          </HeroSubtitle>
        </motion.div>
      </Hero>

      <Content>
        <FiltersSection>
          <PropertyFilters onFiltersChange={handleFiltersChange} />
        </FiltersSection>

        <PropertiesSection>
          {loading ? (
            <LoadingContainer>
              <Loader text="Carregando imóveis..." />
            </LoadingContainer>
          ) : imoveis.length > 0 ? (
            <>
              <PropertiesGrid>
                {imoveis.map((imovel) => (
                  <PropertyCard key={imovel.id} imovel={imovel} />
                ))}
              </PropertiesGrid>

              <PaginationWrapper>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
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
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPageSelector={true}
                  itemsPerPageOptions={[6, 12, 24, 48]}
                />
              </PaginationWrapper>
            </>
          ) : (
            <EmptyState>
              <h3>Nenhum imóvel encontrado</h3>
              <p>
                Não encontramos imóveis que correspondam aos seus filtros. Tente
                ajustar os critérios de busca.
              </p>
            </EmptyState>
          )}
        </PropertiesSection>
      </Content>
    </Container>
  );
};
