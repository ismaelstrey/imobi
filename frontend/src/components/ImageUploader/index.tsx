import React, { useState, useRef, useCallback } from 'react'
import { FiUpload, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import styled from 'styled-components'
import {
  Container,
  UploadArea,
  UploadIcon,
  UploadText,
  UploadSubtext,
  HiddenInput,
  ImagesGrid,
  ImagePreview,
  PreviewImage,
  RemoveButton,
  ImageCounter,
  LoadingOverlay,
  LoadingSpinner
} from './styles'

/**
 * Componente de notificação inline
 */
const NotificationMessage = styled.div<{ type: 'success' | 'error' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.875rem;
  background: ${({ type }) => {
    switch (type) {
      case 'success': return '#dcfce7'
      case 'error': return '#fef2f2'
      case 'warning': return '#fef3c7'
      default: return '#f3f4f6'
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return '#166534'
      case 'error': return '#dc2626'
      case 'warning': return '#d97706'
      default: return theme.colors.text
    }
  }};
  border: 1px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return '#bbf7d0'
      case 'error': return '#fecaca'
      case 'warning': return '#fed7aa'
      default: return theme.colors.border
    }
  }};
`

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxSizeInMB?: number
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeInMB = 5
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set())
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
  } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Mostra notificação temporária
   */
  const showNotification = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  /**
   * Valida se o arquivo é uma imagem válida com validações aprimoradas
   */
  const validateFile = useCallback((file: File): string | null => {
    // Verifica tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos'
    }

    // Verifica tamanho do arquivo
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return `Arquivo muito grande. Máximo ${maxSizeInMB}MB`
    }

    // Verifica tipos específicos permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use JPG, PNG ou WebP'
    }

    return null
  }, [maxSizeInMB])

  /**
   * Valida dimensões da imagem
   */
  const validateImageDimensions = useCallback(async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const minWidth = 100
        const minHeight = 100
        const maxWidth = 4000
        const maxHeight = 4000

        if (img.width < minWidth || img.height < minHeight) {
          resolve(`Imagem muito pequena. Mínimo ${minWidth}x${minHeight}px`)
        } else if (img.width > maxWidth || img.height > maxHeight) {
          resolve(`Imagem muito grande. Máximo ${maxWidth}x${maxHeight}px`)
        } else {
          resolve(null)
        }
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => resolve('Erro ao carregar imagem')
      img.src = URL.createObjectURL(file)
    })
  }, [])

  /**
   * Converte arquivo para base64 para preview
   */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  /**
   * Comprime imagem se necessário
   */
  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const maxWidth = 1920
        const maxHeight = 1080
        
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          0.8
        )
        
        URL.revokeObjectURL(img.src)
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  /**
   * Processa os arquivos selecionados com melhorias
   */
  const processFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    if (images.length + fileArray.length > maxImages) {
      showNotification('warning', `Máximo de ${maxImages} imagens permitidas`)
      return
    }

    // Valida todos os arquivos primeiro
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        showNotification('error', `${file.name}: ${error}`)
        return
      }

      const dimensionError = await validateImageDimensions(file)
      if (dimensionError) {
        showNotification('error', `${file.name}: ${dimensionError}`)
        return
      }
    }

    // Processa uploads com progresso
    const newImages = [...images]
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const tempId = `temp-${Date.now()}-${Math.random()}`
      
      try {
        setUploadingImages(prev => new Set([...prev, tempId]))
        setUploadProgress(((i + 1) / fileArray.length) * 100)
        
        // Comprime imagem
        const compressedFile = await compressImage(file)
        
        // Simula upload
        const base64 = await fileToBase64(compressedFile)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        newImages.push(base64)
        
        if (i === fileArray.length - 1) {
          showNotification('success', `${fileArray.length} imagem(ns) enviada(s) com sucesso`)
        }
      } catch (error) {
        console.error('Erro no upload:', error)
        showNotification('error', `Erro ao fazer upload de ${file.name}`)
      } finally {
        setUploadingImages(prev => {
          const newSet = new Set(prev)
          newSet.delete(tempId)
          return newSet
        })
      }
    }
    
    onImagesChange(newImages)
    setUploadProgress(0)
  }, [images, maxImages, validateFile, validateImageDimensions, compressImage, fileToBase64, showNotification, onImagesChange])

  /**
   * Handler para seleção de arquivos via input
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = ''
  }, [processFiles])

  /**
   * Handler para clique na área de upload
   */
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /**
   * Handlers para drag and drop
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  /**
   * Remove uma imagem da lista
   */
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  return (
    <Container>
      {notification && (
        <NotificationMessage type={notification.type}>
          {notification.type === 'success' && <FiCheckCircle />}
          {notification.type === 'error' && <FiAlertCircle />}
          {notification.type === 'warning' && <FiAlertCircle />}
          {notification.message}
        </NotificationMessage>
      )}

      <UploadArea
        isDragOver={isDragOver}
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Área de upload de imagens"
      >
        <UploadIcon>
          <FiUpload />
        </UploadIcon>
        <UploadText>
          Clique para selecionar ou arraste as imagens aqui
        </UploadText>
        <UploadSubtext>
          PNG, JPG, JPEG, WebP até {maxSizeInMB}MB cada • Máximo {maxImages} imagens
        </UploadSubtext>
        
        {uploadProgress > 0 && (
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: '#e5e7eb', 
            borderRadius: '2px',
            marginTop: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}
        
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
        />
      </UploadArea>

      {(images.length > 0 || uploadingImages.size > 0) && (
        <>
          <ImagesGrid>
            {images.map((image, index) => (
              <ImagePreview key={index}>
                <PreviewImage src={image} alt={`Preview ${index + 1}`} loading="lazy" />
                <RemoveButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage(index)
                  }}
                  aria-label={`Remover imagem ${index + 1}`}
                >
                  <FiX />
                </RemoveButton>
              </ImagePreview>
            ))}
            
            {Array.from(uploadingImages).map((tempId) => (
              <ImagePreview key={tempId}>
                <LoadingOverlay>
                  <LoadingSpinner />
                </LoadingOverlay>
              </ImagePreview>
            ))}
          </ImagesGrid>
          
          <ImageCounter>
            {images.length} de {maxImages} imagens
            {uploadingImages.size > 0 && ` • ${uploadingImages.size} enviando...`}
          </ImageCounter>
        </>
      )}
    </Container>
  )
}