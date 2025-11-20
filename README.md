# LeadsFlow API - Sistema de Gestão de Leads

Sistema completo de gestão de leads com WhatsApp, Email Marketing e automação.

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos e visualizações

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🛠️ Instalação

1. Clone o repositório
```bash
git clone <repository-url>
cd LeadsFlowAPI
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📜 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run build:prod` - Build otimizado para produção
- `npm run preview` - Preview do build de produção
- `npm run check` - Verifica erros TypeScript
- `npm run check:env` - Verifica variáveis de ambiente
- `npm run lint` - Executa o linter

## 📁 Estrutura do Projeto

```
LeadsFlowAPI/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/          # Componentes UI (shadcn)
│   │   ├── auth/        # Autenticação
│   │   ├── dashboard/   # Dashboard
│   │   ├── modals/      # Modais
│   │   └── ...
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilitários
│   ├── types/           # Tipos TypeScript
│   ├── styles/          # Estilos globais
│   └── supabase/        # Funções Supabase
├── index.html           # HTML principal
├── vite.config.ts       # Configuração Vite
├── tsconfig.json        # Configuração TypeScript
└── package.json         # Dependências
```

## 🔐 Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis necessárias.

**Obrigatórias:**
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave pública do Supabase

**Opcionais:**
- `VITE_STRIPE_PUBLIC_KEY` - Chave pública do Stripe
- `VITE_EVOLUTION_API_URL` - URL da Evolution API (WhatsApp)
- `VITE_EVOLUTION_API_KEY` - Chave da Evolution API
- `VITE_META_PIXEL_ID` - ID do Meta Pixel

## 📚 Documentação

Consulte a pasta `src/` para documentação detalhada:
- `QUICKSTART.md` - Guia rápido
- `DEVELOPMENT.md` - Guia de desenvolvimento
- `DEPLOYMENT_GUIDE.md` - Guia de deploy
- `PROJECT_STRUCTURE.md` - Estrutura do projeto

## 🚢 Deploy

```bash
npm run build:prod
```

O build será gerado na pasta `dist/` e pode ser deployado em qualquer serviço de hospedagem estática (Vercel, Netlify, etc.)

## 📄 Licença

MIT
