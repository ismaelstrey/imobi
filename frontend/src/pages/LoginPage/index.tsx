import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaUser, FaLock } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../hooks/useAuth'
import {
  Container,
  LoginCard,
  LoginHeader,
  LoginTitle,
  LoginSubtitle,
  LoginForm,
  FormGroup,
  FormLabel,
  FormInput,
  ErrorMessage,
  LoginButton,
  BackLink
} from './styles'

interface LoginFormData {
  email: string
  senha: string
}

const loginSchema = yup.object({
  email: yup
    .string()
    .required('E-mail é obrigatório')
    .email('E-mail inválido'),
  senha: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setLoginError('')
      
      await login(data.email, data.senha)
      navigate('/admin')
    } catch (error) {
      console.error('Erro no login:', error)
      setLoginError('E-mail ou senha incorretos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoginCard>
          <LoginHeader>
            <LoginTitle>Login Administrativo</LoginTitle>
            <LoginSubtitle>
              Acesse o painel de administração da Imobi
            </LoginSubtitle>
          </LoginHeader>

          <LoginForm onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <FormLabel>
                <FaUser /> E-mail
              </FormLabel>
              <FormInput
                type="email"
                placeholder="Digite seu e-mail"
                className={errors.email ? 'error' : ''}
                {...register('email')}
              />
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>
                <FaLock /> Senha
              </FormLabel>
              <FormInput
                type="password"
                placeholder="Digite sua senha"
                className={errors.senha ? 'error' : ''}
                {...register('senha')}
              />
              {errors.senha && (
                <ErrorMessage>{errors.senha.message}</ErrorMessage>
              )}
            </FormGroup>

            {loginError && (
              <ErrorMessage>{loginError}</ErrorMessage>
            )}

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </LoginButton>
          </LoginForm>

          <BackLink as={Link} to="/">
            <FaArrowLeft />
            Voltar para o site
          </BackLink>
        </LoginCard>
      </motion.div>
    </Container>
  )
}