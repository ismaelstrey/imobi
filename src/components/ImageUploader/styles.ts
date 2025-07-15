import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

export const UploadArea = styled.div<{ isDragOver?: boolean }>`
  border: 2px dashed ${({ theme, isDragOver }) => 
    isDragOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  background: ${({ theme, isDragOver }) => 
    isDragOver ? `${theme.colors.primary}10` : theme.colors.backgroundSecondary};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}05`};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

export const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`

export const UploadText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs};

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

export const UploadSubtext = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`

export const HiddenInput = styled.input`
  display: none;
`

export const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray?.[100] || '#f3f4f6'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`

export const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.white};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
`

export const ImageCounter = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  backdrop-filter: blur(2px);
`

export const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid transparent;
  border-top: 3px solid ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }
`

export const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
`

export const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
  border-radius: 2px;
`