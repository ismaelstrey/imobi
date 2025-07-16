-- Inicialização do banco de dados

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verificar se o banco de dados já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'imobi') THEN
        -- Criar o banco de dados se não existir
        CREATE DATABASE imobi;
    END IF;
END
$$;

-- Conectar ao banco de dados imobi
\c imobi;

-- Criar esquema se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Comentário no banco de dados
COMMENT ON DATABASE imobi IS 'Banco de dados para o sistema de gestão imobiliária Imobi';