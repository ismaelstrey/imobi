import React from 'react'
import { ImovelForm } from '../../components/ImovelForm'

export const NovoImovelPage: React.FC = () => {
  return <ImovelForm isEditing={false} />
}