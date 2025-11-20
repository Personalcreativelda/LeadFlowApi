#!/bin/bash

# ========================================
# LEADSFLOW API - PRÉ-DEPLOY VALIDATION
# ========================================
# Verifica se tudo está pronto para deploy
# ========================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Banner
echo -e "${CYAN}"
echo "========================================"
echo "🔍 LEADSFLOW API - PRÉ-DEPLOY CHECK"
echo "========================================"
echo -e "${NC}\n"

# ========================================
# 1. Verificar Node.js e npm
# ========================================
echo -e "${BLUE}[1/10] Verificando Node.js e npm...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não instalado!${NC}"
    ((ERRORS++))
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js $(node -v) OK${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ Node.js $(node -v) - Requer v18+${NC}"
        ((ERRORS++))
    fi
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não instalado!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ npm $(npm -v) OK${NC}"
    ((SUCCESS++))
fi

echo ""

# ========================================
# 2. Verificar arquivos críticos
# ========================================
echo -e "${BLUE}[2/10] Verificando arquivos críticos...${NC}"

CRITICAL_FILES=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    "index.html"
    "main.tsx"
    "App.tsx"
    ".env.example"
    "Dockerfile"
    "nginx.conf"
    "nixpacks.toml"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $file FALTANDO!${NC}"
        ((ERRORS++))
    fi
done

echo ""

# ========================================
# 3. Verificar node_modules
# ========================================
echo -e "${BLUE}[3/10] Verificando dependências...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Instalando...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependências instaladas${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ Falha ao instalar dependências${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${GREEN}✅ node_modules existe${NC}"
    ((SUCCESS++))
fi

echo ""

# ========================================
# 4. Verificar dependência xlsx
# ========================================
echo -e "${BLUE}[4/10] Verificando dependência xlsx...${NC}"

if grep -q '"xlsx"' package.json; then
    echo -e "${GREEN}✅ xlsx presente no package.json${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ xlsx NÃO está no package.json!${NC}"
    ((ERRORS++))
fi

echo ""

# ========================================
# 5. Verificar TypeScript
# ========================================
echo -e "${BLUE}[5/10] Verificando TypeScript...${NC}"

if npm run check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript sem erros${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️  TypeScript com warnings/erros${NC}"
    ((WARNINGS++))
fi

echo ""

# ========================================
# 6. Testar Build
# ========================================
echo -e "${BLUE}[6/10] Testando build de produção...${NC}"

# Limpar build anterior
rm -rf dist

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build completado com sucesso${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Build FALHOU!${NC}"
    echo -e "${YELLOW}Execute 'npm run build' para ver os erros${NC}"
    ((ERRORS++))
fi

echo ""

# ========================================
# 7. Verificar pasta dist/
# ========================================
echo -e "${BLUE}[7/10] Verificando estrutura dist/...${NC}"

if [ -d "dist" ]; then
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ dist/index.html existe${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ dist/index.html não encontrado${NC}"
        ((ERRORS++))
    fi
    
    if [ -d "dist/assets" ]; then
        echo -e "${GREEN}✅ dist/assets/ existe${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  dist/assets/ não encontrado${NC}"
        ((WARNINGS++))
    fi
    
    # Verificar tamanho
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${CYAN}📦 Tamanho do build: $DIST_SIZE${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Pasta dist/ não existe${NC}"
    ((ERRORS++))
fi

echo ""

# ========================================
# 8. Verificar configuração Vite
# ========================================
echo -e "${BLUE}[8/10] Verificando vite.config.ts...${NC}"

if grep -q "outDir: 'dist'" vite.config.ts; then
    echo -e "${GREEN}✅ outDir configurado como 'dist'${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠️  Verifique outDir em vite.config.ts${NC}"
    ((WARNINGS++))
fi

echo ""

# ========================================
# 9. Verificar Dockerfile
# ========================================
echo -e "${BLUE}[9/10] Verificando Dockerfile...${NC}"

if [ -f "Dockerfile" ]; then
    if grep -q "FROM node:18-alpine AS builder" Dockerfile; then
        echo -e "${GREEN}✅ Dockerfile com multi-stage build${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Dockerfile pode estar desatualizado${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "FROM nginx:alpine" Dockerfile; then
        echo -e "${GREEN}✅ Stage de produção com Nginx${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Stage Nginx não encontrado${NC}"
        ((WARNINGS++))
    fi
fi

echo ""

# ========================================
# 10. Verificar nginx.conf
# ========================================
echo -e "${BLUE}[10/10] Verificando nginx.conf...${NC}"

if [ -f "nginx.conf" ]; then
    if grep -q "root /usr/share/nginx/html" nginx.conf; then
        echo -e "${GREEN}✅ nginx.conf com root correto${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Verificar root no nginx.conf${NC}"
        ((WARNINGS++))
    fi
    
    if grep -q "try_files \$uri \$uri/ /index.html" nginx.conf; then
        echo -e "${GREEN}✅ SPA routing configurado${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ SPA routing não configurado!${NC}"
        ((ERRORS++))
    fi
fi

echo ""

# ========================================
# RESUMO FINAL
# ========================================
echo -e "${CYAN}========================================"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "========================================${NC}\n"

echo -e "${GREEN}✅ Sucesso: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Erros: $ERRORS${NC}\n"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}╔════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ NÃO PRONTO PARA DEPLOY        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════╝${NC}\n"
    echo -e "${YELLOW}Corrija os erros acima antes de fazer deploy.${NC}\n"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  PRONTO COM WARNINGS          ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════╝${NC}\n"
    echo -e "${CYAN}Você pode fazer deploy, mas revise os warnings.${NC}\n"
    exit 0
else
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ PRONTO PARA DEPLOY! 🚀        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}\n"
    echo -e "${CYAN}Próximos passos:${NC}"
    echo "1. Configure variáveis de ambiente no Coolify"
    echo "2. Push para GitHub"
    echo "3. Deploy automático! 🎉\n"
    exit 0
fi
