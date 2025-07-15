/**
 * Utilitários para manipulação de imagens
 */

export interface ImageValidationOptions {
  maxSizeInMB?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  allowedTypes?: string[]
}

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Valida arquivo de imagem
 */
export const validateImageFile = (
  file: File,
  options: ImageValidationOptions = {}
): string | null => {
  const {
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  } = options

  // Verifica tipo de arquivo
  if (!file.type.startsWith('image/')) {
    return 'Apenas arquivos de imagem são permitidos'
  }

  // Verifica tipos específicos
  if (!allowedTypes.includes(file.type)) {
    return `Formato não suportado. Use: ${allowedTypes.map(type => 
      type.replace('image/', '').toUpperCase()
    ).join(', ')}`
  }

  // Verifica tamanho
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    return `Arquivo muito grande. Máximo ${maxSizeInMB}MB`
  }

  return null
}

/**
 * Valida dimensões da imagem
 */
export const validateImageDimensions = (
  file: File,
  options: ImageValidationOptions = {}
): Promise<string | null> => {
  const {
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000
  } = options

  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
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
}

/**
 * Converte arquivo para base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime imagem mantendo proporção
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8
  } = options

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      // Calcula novas dimensões mantendo proporção
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

      // Desenha imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height)

      // Converte para blob
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
        quality
      )

      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Gera thumbnail da imagem
 */
export const generateThumbnail = (
  file: File,
  size = 150
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      // Calcula posição para crop centralizado
      const { width, height } = img
      const minDimension = Math.min(width, height)
      const x = (width - minDimension) / 2
      const y = (height - minDimension) / 2

      // Desenha imagem cropada e redimensionada
      ctx?.drawImage(
        img,
        x, y, minDimension, minDimension,
        0, 0, size, size
      )

      // Converte para base64
      const thumbnail = canvas.toDataURL(file.type, 0.8)
      resolve(thumbnail)
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calcula hash da imagem para evitar duplicatas
 */
export const calculateImageHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Formata tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Extrai metadados da imagem
 */
export const extractImageMetadata = (file: File): Promise<{
  width: number
  height: number
  size: string
  type: string
  name: string
}> => {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: formatFileSize(file.size),
        type: file.type,
        name: file.name
      })
      URL.revokeObjectURL(img.src)
    }
    
    img.src = URL.createObjectURL(file)
  })
}