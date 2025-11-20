#!/bin/bash

# ========================================
# LEADSFLOW API - AUTOMATED SETUP SCRIPT
# ========================================
# Script para configuração automática do projeto
# ========================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "========================================"
echo "🚀 LEADSFLOW API - SETUP AUTOMÁTICO"
echo "========================================"
echo -e "${NC}"

# Verificar Node.js
echo -e "${BLUE}📋 Verificando requisitos...${NC}\n"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo -e "${YELLOW}💡 Instale Node.js 18+ em: https://nodejs.org${NC}\n"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: ${NODE_VERSION}${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado!${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado: ${NPM_VERSION}${NC}\n"
fi

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}\n"

if npm install; then
    echo -e "\n${GREEN}✅ Dependências instaladas com sucesso!${NC}\n"
else
    echo -e "\n${RED}❌ Erro ao instalar dependências!${NC}\n"
    exit 1
fi

# Configurar .env
if [ ! -f .env ]; then
    echo -e "${BLUE}⚙️  Configurando arquivo .env...${NC}\n"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Arquivo .env criado a partir do .env.example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}\n"
    else
        echo -e "${RED}❌ Arquivo .env.example não encontrado!${NC}\n"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}\n"
fi

# Verificar variáveis de ambiente
echo -e "${BLUE}🔍 Verificando variáveis de ambiente...${NC}\n"

if npm run check:env; then
    echo ""
else
    echo -e "\n${YELLOW}⚠️  Configure as variáveis obrigatórias no arquivo .env${NC}\n"
fi

# Build de teste
echo -e "${BLUE}🏗️  Testando build do projeto...${NC}\n"

if npm run build; then
    echo -e "\n${GREEN}✅ Build concluído com sucesso!${NC}\n"
else
    echo -e "\n${YELLOW}⚠️  Build falhou - verifique os erros acima${NC}\n"
fi

# Resumo final
echo -e "${CYAN}========================================"
echo "✅ SETUP CONCLUÍDO!"
echo "========================================${NC}\n"

echo -e "${GREEN}🎉 O LeadsFlow API está pronto para uso!${NC}\n"

echo -e "${BLUE}📋 Próximos passos:${NC}\n"
echo "1. Configure suas credenciais no arquivo .env"
echo "   ${CYAN}nano .env${NC}\n"

echo "2. Execute o projeto em modo desenvolvimento:"
echo "   ${CYAN}npm run dev${NC}\n"

echo "3. Acesse no navegador:"
echo "   ${CYAN}http://localhost:5173${NC}\n"

echo -e "${BLUE}📚 Documentação:${NC}"
echo "   - README.md - Documentação completa"
echo "   - QUICKSTART.md - Guia rápido"
echo "   - DEPLOY.md - Guia de deploy"
echo "   - DEVELOPMENT.md - Guia para desenvolvedores\n"

echo -e "${YELLOW}💡 Dica: Execute 'npm run check:env' para verificar suas variáveis de ambiente${NC}\n"

exit 0
