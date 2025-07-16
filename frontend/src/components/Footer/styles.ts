import styled from 'styled-components'

export const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.gray[800]};
  color: ${({ theme }) => theme.colors.white};
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.lg};
`

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

export const FooterSection = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.white};
  }

  p, a {
    color: ${({ theme }) => theme.colors.gray[300]};
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  a {
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.white};
    }
  }
`

export const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.gray[300]};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    justify-content: center;
  }
`

export const Copyright = styled.div`
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[700]};
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 0.875rem;
`