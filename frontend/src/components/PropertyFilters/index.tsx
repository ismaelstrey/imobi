import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";
import {
  FiltersContainer,
  FiltersTitle,
  FilterGroup,
  FilterLabel,
  FilterInput,
  FilterSelect,
  PriceRange,
  FilterButtons,
  ApplyButton,
  ClearButton,
  AdvancedFiltersToggle,
  AdvancedFiltersContainer,
  FilterCount,
  FilterTags,
  FilterTag,
} from "./styles";

interface Filters {
  tipo?: string;
  cidade?: string;
  precoMin?: number;
  precoMax?: number;
  dormitorios?: number;
  banheiros?: number;
  vagas?: number;
  areaMin?: number;
  areaMax?: number;
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: Filters) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<Filters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [activeFilterTags, setActiveFilterTags] = useState<
    { key: keyof Filters; label: string; value: string }[]
  >([]);

  // Atualiza a contagem de filtros ativos e as tags de filtro
  useEffect(() => {
    // Conta quantos filtros estão ativos
    const count = Object.keys(filters).filter((key) => {
      const value = filters[key as keyof Filters];
      return value !== undefined && value !== "";
    }).length;

    setActiveFiltersCount(count);

    // Cria as tags para os filtros ativos
    const tags: { key: keyof Filters; label: string; value: string }[] = [];

    if (filters.tipo) {
      const tipoLabels: Record<string, string> = {
        casa: "Casa",
        apartamento: "Apartamento",
        sala_comercial: "Sala Comercial",
        terreno: "Terreno",
      };
      tags.push({
        key: "tipo",
        label: "Tipo",
        value: tipoLabels[filters.tipo] || filters.tipo,
      });
    }

    if (filters.cidade) {
      tags.push({ key: "cidade", label: "Cidade", value: filters.cidade });
    }

    if (filters.precoMin) {
      tags.push({
        key: "precoMin",
        label: "Preço mínimo",
        value: `R$ ${filters.precoMin.toLocaleString("pt-BR")}`,
      });
    }

    if (filters.precoMax) {
      tags.push({
        key: "precoMax",
        label: "Preço máximo",
        value: `R$ ${filters.precoMax.toLocaleString("pt-BR")}`,
      });
    }

    if (filters.dormitorios) {
      tags.push({
        key: "dormitorios",
        label: "Dormitórios",
        value: `${filters.dormitorios}+`,
      });
    }

    if (filters.banheiros) {
      tags.push({
        key: "banheiros",
        label: "Banheiros",
        value: `${filters.banheiros}+`,
      });
    }

    if (filters.vagas) {
      tags.push({
        key: "vagas",
        label: "Vagas",
        value: `${filters.vagas}+`,
      });
    }

    if (filters.areaMin) {
      tags.push({
        key: "areaMin",
        label: "Área mínima",
        value: `${filters.areaMin} m²`,
      });
    }

    if (filters.areaMax) {
      tags.push({
        key: "areaMax",
        label: "Área máxima",
        value: `${filters.areaMax} m²`,
      });
    }

    setActiveFilterTags(tags);
  }, [filters]);

  const handleInputChange = (field: keyof Filters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const handleRemoveFilter = (key: keyof Filters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });

    // Aplica os filtros automaticamente ao remover um filtro
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters((prev) => !prev);
  };

  return (
    <FiltersContainer>
      <FiltersTitle onClick={toggleAdvancedFilters}>
        Filtros
        {activeFiltersCount > 0 && (
          <FilterCount>{activeFiltersCount}</FilterCount>
        )}
        {showAdvancedFilters ? <FaChevronUp /> : <FaChevronDown />}
      </FiltersTitle>

      {activeFilterTags.length > 0 && (
        <FilterTags>
          {activeFilterTags.map((tag) => (
            <FilterTag key={tag.key}>
              {tag.label}: {tag.value}
              <span onClick={() => handleRemoveFilter(tag.key)}>
                <FaTimes />
              </span>
            </FilterTag>
          ))}
        </FilterTags>
      )}

      {/* Filtros básicos sempre visíveis */}
      <FilterGroup>
        <FilterLabel>Tipo de Imóvel</FilterLabel>
        <FilterSelect
          value={filters.tipo || ""}
          onChange={(e) => handleInputChange("tipo", e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="sala_comercial">Sala Comercial</option>
          <option value="terreno">Terreno</option>
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Cidade</FilterLabel>
        <FilterInput
          type="text"
          placeholder="Digite a cidade"
          value={filters.cidade || ""}
          onChange={(e) => handleInputChange("cidade", e.target.value)}
        />
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Faixa de Preço</FilterLabel>
        <PriceRange>
          <FilterInput
            type="number"
            placeholder="Preço mínimo"
            value={filters.precoMin || ""}
            onChange={(e) =>
              handleInputChange("precoMin", Number(e.target.value))
            }
          />
          <FilterInput
            type="number"
            placeholder="Preço máximo"
            value={filters.precoMax || ""}
            onChange={(e) =>
              handleInputChange("precoMax", Number(e.target.value))
            }
          />
        </PriceRange>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>Dormitórios</FilterLabel>
        <FilterSelect
          value={filters.dormitorios || ""}
          onChange={(e) =>
            handleInputChange("dormitorios", Number(e.target.value))
          }
        >
          <option value="">Qualquer quantidade</option>
          <option value="1">1 dormitório</option>
          <option value="2">2 dormitórios</option>
          <option value="3">3 dormitórios</option>
          <option value="4">4+ dormitórios</option>
        </FilterSelect>
      </FilterGroup>

      {/* Filtros avançados que podem ser expandidos/colapsados */}
      <AdvancedFiltersContainer isopen={showAdvancedFilters}>
        <FilterGroup>
          <FilterLabel>Banheiros</FilterLabel>
          <FilterSelect
            value={filters.banheiros || ""}
            onChange={(e) =>
              handleInputChange("banheiros", Number(e.target.value))
            }
          >
            <option value="">Qualquer quantidade</option>
            <option value="1">1 banheiro</option>
            <option value="2">2 banheiros</option>
            <option value="3">3 banheiros</option>
            <option value="4">4+ banheiros</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Vagas de Garagem</FilterLabel>
          <FilterSelect
            value={filters.vagas || ""}
            onChange={(e) => handleInputChange("vagas", Number(e.target.value))}
          >
            <option value="">Qualquer quantidade</option>
            <option value="1">1 vaga</option>
            <option value="2">2 vagas</option>
            <option value="3">3 vagas</option>
            <option value="4">4+ vagas</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Área Útil (m²)</FilterLabel>
          <PriceRange>
            <FilterInput
              type="number"
              placeholder="Área mínima"
              value={filters.areaMin || ""}
              onChange={(e) =>
                handleInputChange("areaMin", Number(e.target.value))
              }
            />
            <FilterInput
              type="number"
              placeholder="Área máxima"
              value={filters.areaMax || ""}
              onChange={(e) =>
                handleInputChange("areaMax", Number(e.target.value))
              }
            />
          </PriceRange>
        </FilterGroup>
      </AdvancedFiltersContainer>

      <AdvancedFiltersToggle onClick={toggleAdvancedFilters}>
        {showAdvancedFilters ? (
          <>
            <FaChevronUp /> Menos filtros
          </>
        ) : (
          <>
            <FaChevronDown /> Mais filtros
          </>
        )}
      </AdvancedFiltersToggle>

      <FilterButtons>
        <ApplyButton onClick={handleApplyFilters}>
          <FaSearch /> Buscar Imóveis
        </ApplyButton>
        <ClearButton onClick={handleClearFilters}>Limpar</ClearButton>
      </FilterButtons>
    </FiltersContainer>
  );
};
