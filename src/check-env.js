#!/usr/bin/env node

/**
 * ========================================
 * ENVIRONMENT VARIABLES CHECKER
 * ========================================
 * Script para verificar se todas as variáveis
 * de ambiente necessárias estão configuradas
 * ========================================
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
config();

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Variáveis obrigatórias
const REQUIRED_VARS = [
  {
    name: 'VITE_SUPABASE_URL',
    description: 'URL do projeto Supabase',
    example: 'https://seu-projeto.supabase.co'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    description: 'Chave anon/public do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
];

// Variáveis opcionais (mas recomendadas)
const OPTIONAL_VARS = [
  {
    name: 'VITE_STRIPE_PUBLIC_KEY',
    description: 'Chave pública do Stripe (pagamentos)',
    example: 'pk_test_...'
  },
  {
    name: 'VITE_EVOLUTION_API_URL',
    description: 'URL da Evolution API (WhatsApp)',
    example: 'https://sua-evolution-api.com'
  },
  {
    name: 'VITE_EVOLUTION_API_KEY',
    description: 'API Key da Evolution API',
    example: 'sua-api-key'
  },
  {
    name: 'VITE_META_PIXEL_ID',
    description: 'ID do Meta Pixel (Facebook tracking)',
    example: '1234567890'
  },
];

console.log(`\n${colors.cyan}========================================`);
console.log('🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE');
console.log(`========================================${colors.reset}\n`);

// Verificar se arquivo .env existe
if (!existsSync(join(__dirname, '.env'))) {
  console.log(`${colors.red}❌ Arquivo .env não encontrado!${colors.reset}`);
  console.log(`${colors.yellow}💡 Execute: cp .env.example .env${colors.reset}\n`);
  process.exit(1);
}

let allRequired = true;
let missingOptional = [];

// Verificar variáveis obrigatórias
console.log(`${colors.blue}📋 Variáveis Obrigatórias:${colors.reset}\n`);

REQUIRED_VARS.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value || value.trim() === '') {
    console.log(`${colors.red}❌ ${variable.name}${colors.reset}`);
    console.log(`   ${colors.yellow}Descrição: ${variable.description}${colors.reset}`);
    console.log(`   ${colors.yellow}Exemplo: ${variable.example}${colors.reset}\n`);
    allRequired = false;
  } else {
    // Mascarar valor sensível
    const maskedValue = value.substring(0, 20) + '...';
    console.log(`${colors.green}✅ ${variable.name}${colors.reset}`);
    console.log(`   Valor: ${maskedValue}\n`);
  }
});

// Verificar variáveis opcionais
console.log(`${colors.blue}📋 Variáveis Opcionais (Recomendadas):${colors.reset}\n`);

OPTIONAL_VARS.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value || value.trim() === '') {
    console.log(`${colors.yellow}⚠️  ${variable.name}${colors.reset}`);
    console.log(`   ${colors.yellow}Descrição: ${variable.description}${colors.reset}`);
    console.log(`   ${colors.yellow}Exemplo: ${variable.example}${colors.reset}\n`);
    missingOptional.push(variable.name);
  } else {
    const maskedValue = value.substring(0, 20) + '...';
    console.log(`${colors.green}✅ ${variable.name}${colors.reset}`);
    console.log(`   Valor: ${maskedValue}\n`);
  }
});

// Resumo final
console.log(`${colors.cyan}========================================`);
console.log('📊 RESUMO');
console.log(`========================================${colors.reset}\n`);

if (allRequired) {
  console.log(`${colors.green}✅ Todas as variáveis obrigatórias configuradas!${colors.reset}\n`);
  
  if (missingOptional.length > 0) {
    console.log(`${colors.yellow}⚠️  ${missingOptional.length} variável(is) opcional(is) não configurada(s):${colors.reset}`);
    missingOptional.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log(`\n${colors.yellow}💡 Estas variáveis são opcionais, mas recomendadas para funcionalidade completa.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✅ Todas as variáveis opcionais também configuradas!${colors.reset}\n`);
  }
  
  console.log(`${colors.green}🚀 Você pode executar o projeto!${colors.reset}`);
  console.log(`${colors.cyan}   npm run dev${colors.reset}\n`);
  
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Variáveis obrigatórias faltando!${colors.reset}\n`);
  console.log(`${colors.yellow}💡 Configure as variáveis no arquivo .env e tente novamente.${colors.reset}`);
  console.log(`${colors.yellow}📖 Consulte o arquivo .env.example para referência.${colors.reset}\n`);
  
  process.exit(1);
}
