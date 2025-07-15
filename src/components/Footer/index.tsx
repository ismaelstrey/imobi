import React from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'
import { 
  FooterContainer, 
  FooterContent, 
  FooterSection, 
  ContactInfo, 
  Copyright 
} from './styles'

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Sobre a Imobi</h3>
          <p>
            Sua imobiliária digital de confiança. Encontre o imóvel dos seus sonhos 
            com facilidade e segurança. Oferecemos as melhores opções do mercado 
            com atendimento personalizado.
          </p>
        </FooterSection>

        <FooterSection>
          <h3>Contato</h3>
          <ContactInfo>
            <FaPhone />
            <span>(11) 99999-9999</span>
          </ContactInfo>
          <ContactInfo>
            <FaWhatsapp />
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope />
            <a href="mailto:contato@imobi.com.br">contato@imobi.com.br</a>
          </ContactInfo>
          <ContactInfo>
            <FaMapMarkerAlt />
            <span>São Paulo, SP - Brasil</span>
          </ContactInfo>
        </FooterSection>

        <FooterSection>
          <h3>Links Úteis</h3>
          <a href="/">Início</a>
          <a href="/imoveis">Imóveis</a>
          <a href="/sobre">Sobre Nós</a>
          <a href="/contato">Contato</a>
        </FooterSection>
      </FooterContent>

      <Copyright>
        <p>&copy; 2024 Imobi. Todos os direitos reservados.</p>
      </Copyright>
    </FooterContainer>
  )
}