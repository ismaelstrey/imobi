import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { apiService, Imovel } from '../../services/api'
import { ImageUploader } from '../ImageUploader'
import {
  Container,
  Content,
  Header,
  Title,
  Subtitle,
  FormCard,
  Form,
  FormSection,
  SectionTitle,
  FormRow,
  FormGroup,
  Label,
  RequiredMark,
  Input,
  Select,
  Textarea,
  ErrorMessage,
  ButtonGroup,
  Button,
  LoadingSpinner
} from './styles'

// Schema de validação com Yup
const imovelSchema = yup.object({
  titulo: yup
    .string()
    .required('Título é obrigatório')
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  preco: yup
    .number()
    .required('Preço é obrigatório')
    .positive('Preço deve ser positivo')
    .min(1000, 'Preço mínimo é R$ 1.000'),
  tipo: yup
    .string()
    .required('Tipo é obrigatório')
    .oneOf(['casa', 'apartamento', 'comercial', 'terreno'], 'Tipo inválido'),
  endereco: yup
    .string()
    .required('Endereço é obrigatório')
    .min(10, 'Endereço deve ter pelo menos 10 caracteres'),
  cidade: yup
    .string()
    .required('Cidade é obrigatória')
    .min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  descricao: yup
    .string()
    .required('Descrição é obrigatória')
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  areaUtil: yup
    .number()
    .required('Área útil é obrigatória')
    .positive('Área deve ser positiva')
    .min(1, 'Área mínima é 1m²'),
  dormitorios: yup
    .number()
    .required('Número de dormitórios é obrigatório')
    .integer('Deve ser um número inteiro')
    .min(0, 'Mínimo 0 dormitórios')
    .max(20, 'Máximo 20 dormitórios'),
  banheiros: yup
    .number()
    .required('Número de banheiros é obrigatório')
    .integer('Deve ser um número inteiro')
    .min(1, 'Mínimo 1 banheiro')
    .max(20, 'Máximo 20 banheiros'),
  vagas: yup
    .number()
    .required('Número de vagas é obrigatório')
    .integer('Deve ser um número inteiro')
    .min(0, 'Mínimo 0 vagas')
    .max(20, 'Máximo 20 vagas')
})

type ImovelFormData = yup.InferType<typeof imovelSchema>

interface ImovelFormProps {
  imovel?: Imovel
  isEditing?: boolean
}

export const ImovelForm: React.FC<ImovelFormProps> = ({ 
  imovel, 
  isEditing = false 
}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(imovel?.imagens || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ImovelFormData>({
    resolver: yupResolver(imovelSchema),
    defaultValues: imovel ? {
      titulo: imovel.titulo,
      preco: imovel.preco,
      tipo: imovel.tipo as 'casa' | 'apartamento' | 'comercial' | 'terreno',
      endereco: imovel.endereco,
      cidade: imovel.cidade,
      descricao: imovel.descricao,
      areaUtil: imovel.areaUtil,
      dormitorios: imovel.dormitorios,
      banheiros: imovel.banheiros,
      vagas: imovel.vagas
    } : undefined
  })

  // Atualiza o formulário quando o imóvel muda (modo edição)
  useEffect(() => {
    if (imovel && isEditing) {
      reset({
        titulo: imovel.titulo,
        preco: imovel.preco,
        tipo: imovel.tipo as 'casa' | 'apartamento' | 'comercial' | 'terreno',
        endereco: imovel.endereco,
        cidade: imovel.cidade,
        descricao: imovel.descricao,
        areaUtil: imovel.areaUtil,
        dormitorios: imovel.dormitorios,
        banheiros: imovel.banheiros,
        vagas: imovel.vagas
      })
      setImages(imovel.imagens || [])
    }
  }, [imovel, isEditing, reset])

  /**
   * Submete o formulário para criar ou editar um imóvel
   */
  const onSubmit = async (data: ImovelFormData) => {
    try {
      setLoading(true)

      const imovelData = {
        ...data,
        imagens: images
      }

      if (isEditing && imovel?.id) {
        await apiService.updateImovel(imovel.id, imovelData)
      } else {
        await apiService.createImovel(imovelData)
      }

      // Redireciona para o dashboard após sucesso
      navigate('/admin', { 
        state: { 
          message: isEditing ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!' 
        }
      })
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error)
      // TODO: Implementar toast de erro
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancela a operação e volta para o dashboard
   */
  const handleCancel = () => {
    navigate('/admin')
  }

  /**
   * Callback para atualizar as imagens
   */
  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  return (
    <Container>
      <Content>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Header>
            <Title>
              {isEditing ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
            </Title>
            <Subtitle>
              {isEditing 
                ? 'Atualize as informações do imóvel' 
                : 'Preencha os dados para cadastrar um novo imóvel'
              }
            </Subtitle>
          </Header>

          <FormCard>
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* Informações Básicas */}
              <FormSection>
                <SectionTitle>Informações Básicas</SectionTitle>
                
                <FormRow className="full-width">
                  <FormGroup>
                    <Label>
                      Título do Imóvel
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      {...register('titulo')}
                      placeholder="Ex: Casa moderna com piscina"
                      hasError={!!errors.titulo}
                    />
                    {errors.titulo && (
                      <ErrorMessage>{errors.titulo.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>
                      Preço (R$)
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      {...register('preco', { valueAsNumber: true })}
                      type="number"
                      placeholder="450000"
                      hasError={!!errors.preco}
                    />
                    {errors.preco && (
                      <ErrorMessage>{errors.preco.message}</ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      Tipo do Imóvel
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Select
                      {...register('tipo')}
                      hasError={!!errors.tipo}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="comercial">Comercial</option>
                      <option value="terreno">Terreno</option>
                    </Select>
                    {errors.tipo && (
                      <ErrorMessage>{errors.tipo.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>
              </FormSection>

              {/* Localização */}
              <FormSection>
                <SectionTitle>Localização</SectionTitle>
                
                <FormRow className="full-width">
                  <FormGroup>
                    <Label>
                      Endereço Completo
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      {...register('endereco')}
                      placeholder="Rua das Flores, 123 - Bairro Centro"
                      hasError={!!errors.endereco}
                    />
                    {errors.endereco && (
                      <ErrorMessage>{errors.endereco.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>
                      Cidade
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      {...register('cidade')}
                      placeholder="São Paulo"
                      hasError={!!errors.cidade}
                    />
                    {errors.cidade && (
                      <ErrorMessage>{errors.cidade.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>
              </FormSection>

              {/* Características */}
              <FormSection>
                <SectionTitle>Características</SectionTitle>
                
                <FormRow className="full-width">
                  <FormGroup>
                    <Label>
                      Descrição
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Textarea
                      {...register('descricao')}
                      placeholder="Descreva as principais características do imóvel..."
                      hasError={!!errors.descricao}
                    />
                    {errors.descricao && (
                      <ErrorMessage>{errors.descricao.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>

                <FormRow className="three-columns">
                  <FormGroup>
                    <Label>
                      Área Útil (m²)
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Input
                      {...register('areaUtil', { valueAsNumber: true })}
                      type="number"
                      placeholder="120"
                      hasError={!!errors.areaUtil}
                    />
                    {errors.areaUtil && (
                      <ErrorMessage>{errors.areaUtil.message}</ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      Dormitórios
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Select
                      {...register('dormitorios', { valueAsNumber: true })}
                      hasError={!!errors.dormitorios}
                    >
                      <option value="">Selecione</option>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    {errors.dormitorios && (
                      <ErrorMessage>{errors.dormitorios.message}</ErrorMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      Banheiros
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Select
                      {...register('banheiros', { valueAsNumber: true })}
                      hasError={!!errors.banheiros}
                    >
                      <option value="">Selecione</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    {errors.banheiros && (
                      <ErrorMessage>{errors.banheiros.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>
                      Vagas de Garagem
                      <RequiredMark>*</RequiredMark>
                    </Label>
                    <Select
                      {...register('vagas', { valueAsNumber: true })}
                      hasError={!!errors.vagas}
                    >
                      <option value="">Selecione</option>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    {errors.vagas && (
                      <ErrorMessage>{errors.vagas.message}</ErrorMessage>
                    )}
                  </FormGroup>
                </FormRow>
              </FormSection>

              {/* Upload de Imagens */}
              <FormSection>
                <SectionTitle>Imagens do Imóvel</SectionTitle>
                <ImageUploader
                  images={images}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />
              </FormSection>

              {/* Botões de Ação */}
              <ButtonGroup>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading && <LoadingSpinner />}
                  {loading 
                    ? (isEditing ? 'Atualizando...' : 'Cadastrando...') 
                    : (isEditing ? 'Atualizar Imóvel' : 'Cadastrar Imóvel')
                  }
                </Button>
              </ButtonGroup>
            </Form>
          </FormCard>
        </motion.div>
      </Content>
    </Container>
  )
}