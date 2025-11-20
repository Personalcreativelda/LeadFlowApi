# 📁 ESTRUTURA PARA DEPLOY - LeadsFlow API

## ✅ Estrutura Atual do Projeto

```
leadsflow-saas/
├── 📦 FRONTEND (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── hooks/              # React Hooks customizados
│   │   ├── utils/              # Utilitários e helpers
│   │   ├── styles/             # Estilos globais
│   │   ├── types/              # Definições TypeScript
│   │   ├── App.tsx             # Componente principal
│   │   └── main.tsx            # Entry point
│   │
│   ├── public/                 # Assets estáticos
│   │   └── index.html          # HTML base
│   │
│   ├── dist/                   # 🎯 BUILD OUTPUT (gerado após npm run build)
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── js/             # JavaScript bundles
│   │   │   ├── css/            # Stylesheets
│   │   │   └── images/         # Imagens otimizadas
│   │   └── ...
│   │
│   └── node_modules/           # Dependências npm
│
├── 🐳 DOCKER & DEPLOYMENT
│   ├── Dockerfile              # ✅ Multi-stage build com Nginx
│   ├── docker-compose.yml      # ✅ Orquestração Docker
│   ├── nginx.conf              # ✅ Configuração Nginx completa
│   └── nixpacks.toml           # ✅ Config para Coolify/Nixpacks
│
├── 📄 CONFIGURAÇÃO
│   ├── package.json            # ✅ Dependências (com xlsx)
│   ├── tsconfig.json           # ✅ TypeScript config
│   ├── vite.config.ts          # ✅ Vite config (build -> dist)
│   ├── .env.example            # ✅ Template variáveis ambiente
│   ├── .gitignore              # ✅ Arquivos ignorados
│   └── setup.sh                # ✅ Script setup automático
│
├── 🗄️ DATABASE
│   └── SUPABASE_SCHEMA.sql     # ✅ Schema completo do banco
│
└── 📚 DOCUMENTAÇÃO
    ├── README.md               # ✅ Documentação principal
    ├── QUICKSTART.md           # ✅ Início rápido
    ├── DEPLOY.md               # ✅ Guia de deploy
    ├── DEVELOPMENT.md          # ✅ Guia para devs
    ├── API.md                  # ✅ Documentação API
    ├── CHANGELOG.md            # ✅ Histórico de mudanças
    └── CONTRIBUTING.md         # ✅ Guia de contribuição
```

---

## 🎯 PROCESSO DE BUILD

### 1. Desenvolvimento Local
```bash
npm install              # Instalar dependências
npm run dev             # Iniciar dev server (port 5173)
```

### 2. Build para Produção
```bash
npm run build           # Build otimizado -> ./dist
```

**O que acontece:**
- TypeScript compila e valida tipos
- Vite faz bundle otimizado
- Assets são minificados
- Code splitting automático
- Gera pasta `dist/` com:
  - `index.html` (entry point)
  - `assets/js/` (bundles JavaScript)
  - `assets/css/` (stylesheets)
  - `assets/images/` (imagens otimizadas)

### 3. Preview do Build
```bash
npm run preview         # Testar build local (port 4173)
```

---

## 🚀 DEPLOY - COOLIFY (Nixpacks)

### Configuração no Coolify

1. **Conectar Repositório GitHub**
   - Adicionar projeto no Coolify
   - Conectar com repo GitHub

2. **Configuração Automática**
   - Coolify detecta `nixpacks.toml`
   - Usa Node.js 18 + npm 9
   - Build command: `npm run build`
   - Start command: `npx serve -s dist -l $PORT`

3. **Variáveis de Ambiente** (configurar no painel)
   ```
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=...
   VITE_STRIPE_PUBLIC_KEY=pk_...
   VITE_EVOLUTION_API_URL=https://...
   VITE_EVOLUTION_API_KEY=...
   VITE_META_PIXEL_ID=...
   ```

4. **Deploy**
   - Push para GitHub
   - Coolify faz build automático
   - Serve pasta `dist/` na porta configurada

---

## 🐳 DEPLOY - DOCKER

### Build da Imagem
```bash
# Build
docker build -t leadsflow-api .

# Run
docker run -d \
  -p 80:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  --name leadsflow \
  leadsflow-api
```

### Docker Compose
```bash
# Criar .env com variáveis
cp .env.example .env

# Iniciar
docker-compose up -d

# Logs
docker-compose logs -f

# Parar
docker-compose down
```

**O que acontece:**
- Stage 1: Build da aplicação (Node.js)
  - Instala dependências
  - Roda `npm run build`
  - Gera pasta `dist/`
- Stage 2: Produção (Nginx Alpine)
  - Copia `dist/` para `/usr/share/nginx/html`
  - Configura Nginx
  - Expõe porta 80
  - Imagem final: ~50MB

---

## 🌐 NGINX - Servidor Web

### Configuração
- **Root:** `/usr/share/nginx/html` (onde está `dist/`)
- **SPA Routing:** Todas rotas → `index.html`
- **Caching:** Assets estáticos (1 ano)
- **Gzip:** Compressão ativada
- **Security Headers:** X-Frame-Options, CSP, etc.
- **Health Check:** `/health` endpoint

### Teste Local
```bash
# Buildar
npm run build

# Servir com nginx (Docker)
docker run -d -p 8080:80 \
  -v $(pwd)/dist:/usr/share/nginx/html:ro \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine

# Acessar: http://localhost:8080
```

---

## ✅ CHECKLIST PRÉ-DEPLOY

### 1. Código
- [ ] `npm install` sem erros
- [ ] `npm run build` gera `dist/` corretamente
- [ ] `npm run preview` funciona
- [ ] Sem erros TypeScript (`npm run check`)

### 2. Configuração
- [ ] `.env.example` atualizado
- [ ] Todas variáveis VITE_* configuradas
- [ ] `package.json` com todas dependências (incluindo xlsx)
- [ ] `vite.config.ts` com outDir: 'dist'

### 3. Docker (se usar)
- [ ] `Dockerfile` testado localmente
- [ ] `nginx.conf` configurado
- [ ] `docker-compose.yml` funcional

### 4. Database
- [ ] Schema Supabase aplicado
- [ ] RLS policies configuradas
- [ ] Storage buckets criados

### 5. Integrações
- [ ] Stripe webhooks configurados
- [ ] Evolution API conectada
- [ ] Meta Pixel funcionando

---

## 🔍 TROUBLESHOOTING

### Build Falha
```bash
# Limpar cache e rebuildar
npm run clean
npm install
npm run build
```

### Erro 404 em Rotas
- ✅ Verificar `nginx.conf` tem `try_files $uri $uri/ /index.html;`
- ✅ Verificar SPA routing está configurado

### Variáveis de Ambiente Não Carregam
- ✅ Verificar prefixo `VITE_` em todas variáveis
- ✅ Rebuild após alterar variáveis
- ✅ No Coolify: configurar no painel, não em arquivo

### Docker: Nginx Não Inicia
- ✅ Verificar permissões: `chown -R nginx:nginx /usr/share/nginx/html`
- ✅ Verificar `nginx.conf` sintaxe: `nginx -t`

### Assets Não Carregam
- ✅ Verificar paths relativos no código
- ✅ Verificar `vite.config.ts` base path
- ✅ Verificar nginx serve pasta correta

---

## 📊 VERIFICAÇÃO FINAL

### Comandos de Verificação
```bash
# 1. Instalar dependências
npm install

# 2. Verificar TypeScript
npm run check

# 3. Verificar variáveis ambiente
npm run check:env

# 4. Build produção
npm run build

# 5. Verificar tamanho
npm run size

# 6. Testar localmente
npm run preview
```

### Estrutura dist/ Esperada
```
dist/
├── index.html                 # Entry point
├── assets/
│   ├── js/
│   │   ├── index-[hash].js   # Main bundle
│   │   ├── vendor-react-[hash].js
│   │   ├── vendor-ui-[hash].js
│   │   └── vendor-charts-[hash].js
│   ├── css/
│   │   └── index-[hash].css
│   └── images/
│       └── ...
└── ...
```

---

## 🎉 DEPLOY PRONTO!

Seu projeto está configurado corretamente para:
- ✅ **Coolify/Nixpacks** (self-hosted)
- ✅ **Docker + Nginx** (VPS/Cloud)
- ✅ **Build otimizado** (dist/)
- ✅ **Todas dependências** incluídas
- ✅ **Configuração completa** e testada

**Next Steps:**
1. Configure variáveis de ambiente no Coolify
2. Push para GitHub
3. Coolify faz deploy automático
4. Acesse sua aplicação! 🚀
