# 🚀 Guia Completo de Deploy - LeadsFlow API

## Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Ambientes de Deploy](#ambientes-de-deploy)
- [Deploy em Railway](#deploy-em-railway)
- [Deploy em Vercel](#deploy-em-vercel)
- [Deploy em Netlify](#deploy-em-netlify)
- [Deploy Self-Hosted VPS](#deploy-self-hosted-vps)
- [Deploy Self-Hosted Docker](#deploy-self-hosted-docker)
- [Configuração do Supabase](#configuração-do-supabase)
- [Configuração do Stripe](#configuração-do-stripe)
- [Configuração da Evolution API](#configuração-da-evolution-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [DNS e Domínio](#dns-e-domínio)
- [SSL/HTTPS](#sslhttps)
- [Monitoramento](#monitoramento)
- [Backup e Restore](#backup-e-restore)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

LeadsFlow API pode ser deployado em múltiplos ambientes:

| Ambiente | Dificuldade | Custo | Escalabilidade | Recomendado para |
|----------|-------------|-------|----------------|------------------|
| **Railway** | ⭐️ Fácil | $$ | ⭐️⭐️⭐️⭐️ Alta | Produção rápida |
| **Vercel** | ⭐️ Fácil | $ | ⭐️⭐️⭐️⭐️⭐️ Muito Alta | SaaS global |
| **Netlify** | ⭐️ Fácil | $ | ⭐️⭐️⭐️⭐️ Alta | Projetos pequenos |
| **VPS (Ubuntu)** | ⭐️⭐️⭐️ Médio | $ | ⭐️⭐️⭐️ Média | Controle total |
| **Docker** | ⭐️⭐️⭐️⭐️ Difícil | $$$ | ⭐️⭐️⭐️⭐️⭐️ Muito Alta | Enterprise |

**Recomendação**: Railway ou Vercel para começar, VPS/Docker para escala enterprise.

---

## Pré-requisitos

### Ferramentas Necessárias

```bash
# Node.js 18+ ou 20+
node --version  # v20.x.x

# npm, yarn ou pnpm
npm --version   # 10.x.x

# Git
git --version   # 2.x.x

# Supabase CLI (para backend)
npm install -g supabase

# Docker (opcional, para deploy Docker)
docker --version  # 24.x.x
```

### Contas Necessárias

- ✅ **GitHub**: Para versionamento e deploy automático
- ✅ **Supabase**: Para backend e database (https://supabase.com)
- ✅ **Stripe**: Para pagamentos (https://stripe.com)
- ✅ **Railway/Vercel/Netlify**: Para hosting (escolha um)
- ⚠️ **Evolution API**: Opcional, para WhatsApp (pode ser self-hosted)
- ⚠️ **N8N**: Opcional, para automação (pode ser self-hosted)

---

## Ambientes de Deploy

### 1. Staging (Desenvolvimento)

```bash
# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# ... outras variáveis de teste
```

### 2. Production

```bash
# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
# ... outras variáveis de produção
```

---

## Deploy em Railway

### Passo 1: Preparação

```bash
# 1. Crie conta em https://railway.app
# 2. Conecte com GitHub
# 3. Fork ou importe o repositório
```

### Passo 2: Criar Projeto

1. No Railway Dashboard, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `leadsflow-api`
4. Railway detectará automaticamente Vite

### Passo 3: Configurar Variáveis

```bash
# No Railway Dashboard → Variables

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789
VITE_EVOLUTION_API_URL=https://evolution.com
```

### Passo 4: Deploy

```bash
# Railway faz deploy automático ao detectar push no GitHub

# Para forçar redeploy:
git commit --allow-empty -m "Trigger Railway deploy"
git push origin main
```

### Passo 5: Configurar Domínio

1. No Railway, vá em **Settings** → **Domains**
2. Clique em **"Generate Domain"** (domínio gratuito .railway.app)
3. Ou adicione domínio customizado:
   - Adicione `CNAME` apontando para `xxx.railway.app`
   - Aguarde propagação DNS (5-30 min)

### Custo Estimado

```
Railway Starter: $5/mês
+ $0.000463/GB-hora
+ $0.20/GB transferência

Estimativa para 1000 usuários: $10-20/mês
```

---

## Deploy em Vercel

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Login

```bash
vercel login
```

### Passo 3: Deploy

```bash
# Na raiz do projeto
vercel

# Para produção
vercel --prod
```

### Passo 4: Configurar via Dashboard

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione todas as variáveis:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789
VITE_EVOLUTION_API_URL=https://evolution.com
```

### Passo 5: Configurar Domínio

1. No Vercel Dashboard, vá em **Settings** → **Domains**
2. Adicione domínio customizado
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Passo 6: Deploy Automático

```bash
# Conecte com GitHub
# Todo push em main → deploy automático

# Para preview deployments
git checkout -b feature/nova-feature
git push origin feature/nova-feature
# Vercel cria preview automaticamente
```

### Custo Estimado

```
Vercel Hobby: $0 (para projetos pessoais)
Vercel Pro: $20/mês (para comercial)

Limites Hobby:
- 100GB bandwidth/mês
- Unlimited requests
- 100 deployments/day

Para 1000 usuários: Hobby funciona
Para 10.000+ usuários: Pro recomendado
```

---

## Deploy em Netlify

### Passo 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Login

```bash
netlify login
```

### Passo 3: Inicializar

```bash
netlify init
```

Siga o wizard:
- Conecte com GitHub
- Configure build command: `npm run build`
- Configure publish directory: `dist`

### Passo 4: Configurar Variáveis

```bash
# Via CLI
netlify env:set VITE_SUPABASE_URL "https://seu-projeto.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "sua-anon-key"
# ... outras variáveis

# Ou via Dashboard
# Settings → Environment → Environment variables
```

### Passo 5: Deploy

```bash
# Deploy de teste
netlify deploy

# Deploy de produção
netlify deploy --prod
```

### Passo 6: Configurar Domínio

1. No Netlify Dashboard, vá em **Domain settings**
2. Clique em **Add custom domain**
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: seu-site.netlify.app
   ```

### Custo Estimado

```
Netlify Starter: $0
Netlify Pro: $19/mês

Limites Starter:
- 100GB bandwidth/mês
- 300 build minutes/mês

Para 1000 usuários: Starter funciona
Para 10.000+ usuários: Pro recomendado
```

---

## Deploy Self-Hosted VPS

### Opções de VPS

| Provider | Custo/mês | RAM | CPU | Storage | Bandwidth |
|----------|-----------|-----|-----|---------|-----------|
| **DigitalOcean** | $6 | 1GB | 1 vCPU | 25GB | 1TB |
| **Linode** | $5 | 1GB | 1 vCPU | 25GB | 1TB |
| **Vultr** | $6 | 1GB | 1 vCPU | 25GB | 1TB |
| **Hetzner** | €4.5 | 2GB | 1 vCPU | 20GB | 20TB |
| **AWS Lightsail** | $5 | 1GB | 1 vCPU | 40GB | 2TB |

**Recomendação**: Hetzner (melhor custo-benefício) ou DigitalOcean (simplicidade)

### Passo 1: Criar VPS Ubuntu

```bash
# Criar VPS com Ubuntu 22.04 LTS

# SSH no servidor
ssh root@seu-ip
```

### Passo 2: Configuração Inicial

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y nginx certbot python3-certbot-nginx nodejs npm git

# Configurar firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Passo 3: Instalar Node.js 20

```bash
# Remover Node antigo
apt remove nodejs npm -y

# Instalar Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar
node --version  # v20.x.x
npm --version   # 10.x.x
```

### Passo 4: Clone e Build

```bash
# Criar usuário para app (segurança)
adduser --disabled-password --gecos "" leadsflow
su - leadsflow

# Clone do repositório
cd /home/leadsflow
git clone https://github.com/seu-usuario/leadsflow-api.git
cd leadsflow-api

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

```bash
# Conteúdo do .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789
VITE_EVOLUTION_API_URL=https://evolution.com
```

```bash
# Build para produção
npm run build

# Sair do usuário leadsflow
exit
```

### Passo 5: Configurar Nginx

```bash
# Editar configuração Nginx
nano /etc/nginx/sites-available/leadsflow
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    root /home/leadsflow/leadsflow-api/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

```bash
# Criar symlink
ln -s /etc/nginx/sites-available/leadsflow /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### Passo 6: Configurar SSL com Let's Encrypt

```bash
# Gerar certificado SSL (certbot automático)
certbot --nginx -d seudominio.com -d www.seudominio.com

# Responda as perguntas:
# - Email: seu@email.com
# - Aceitar termos: A
# - Compartilhar email: N
# - Redirect HTTP to HTTPS: 2 (sim)

# Testar auto-renewal
certbot renew --dry-run
```

### Passo 7: Script de Deploy

```bash
# Criar script de deploy
nano /home/leadsflow/deploy.sh
```

```bash
#!/bin/bash
cd /home/leadsflow/leadsflow-api

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run build

echo "✅ Deploy completed!"
```

```bash
# Dar permissão
chmod +x /home/leadsflow/deploy.sh

# Para fazer deploy
sudo -u leadsflow /home/leadsflow/deploy.sh
```

### Passo 8: Monitoramento com PM2 (Opcional)

```bash
# Instalar PM2
npm install -g pm2

# Criar servidor estático
pm2 serve /home/leadsflow/leadsflow-api/dist 80 --name leadsflow --spa

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
# Execute o comando que PM2 mostrar
```

### Custo Total VPS

```
VPS (Hetzner): €4.50/mês
Domínio: $12/ano (~$1/mês)
SSL: Grátis (Let's Encrypt)

Total: ~€5.50/mês (~$6/mês)
```

---

## Deploy Self-Hosted Docker

### Passo 1: Dockerfile (já incluído)

```dockerfile
# /Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Passo 2: Docker Compose

```yaml
# docker-compose.yml (já incluído)

version: '3.8'

services:
  leadsflow:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # Se usar SSL
    restart: unless-stopped
    networks:
      - leadsflow-network

networks:
  leadsflow-network:
    driver: bridge
```

### Passo 3: Build Local

```bash
# Build da imagem
docker build -t leadsflow-api:latest .

# Testar localmente
docker run -p 80:80 leadsflow-api:latest

# Acesse http://localhost
```

### Passo 4: Deploy em Servidor

```bash
# No servidor VPS
git clone https://github.com/seu-usuario/leadsflow-api.git
cd leadsflow-api

# Build
docker-compose build

# Start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

### Passo 5: Docker Hub (Opcional)

```bash
# Login no Docker Hub
docker login

# Tag da imagem
docker tag leadsflow-api:latest seuusuario/leadsflow-api:latest

# Push
docker push seuusuario/leadsflow-api:latest

# Pull em outro servidor
docker pull seuusuario/leadsflow-api:latest
docker run -p 80:80 seuusuario/leadsflow-api:latest
```

### Passo 6: Kubernetes (Advanced)

```yaml
# k8s-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: leadsflow-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: leadsflow
  template:
    metadata:
      labels:
        app: leadsflow
    spec:
      containers:
      - name: leadsflow
        image: seuusuario/leadsflow-api:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: leadsflow-service
spec:
  type: LoadBalancer
  selector:
    app: leadsflow
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

```bash
# Deploy no Kubernetes
kubectl apply -f k8s-deployment.yaml

# Verificar status
kubectl get pods
kubectl get services
```

---

## Configuração do Supabase

### Passo 1: Criar Projeto

1. Acesse https://supabase.com
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: LeadsFlow Production
   - **Database Password**: senha-forte-aqui
   - **Region**: escolha mais próxima dos usuários
4. Aguarde ~2 minutos (criação do projeto)

### Passo 2: Executar Schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `/SUPABASE_SCHEMA.sql`
4. Clique em **Run** (Ctrl+Enter)

```sql
-- SUPABASE_SCHEMA.sql já está incluído no projeto
-- Cria a tabela kv_store_4be966ab
-- Cria indexes para performance
```

### Passo 3: Configurar Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular projeto
supabase link --project-ref seu-project-ref
# Encontre o project-ref na URL: https://supabase.com/dashboard/project/SEU-PROJECT-REF

# Deploy da Edge Function
supabase functions deploy make-server-4be966ab

# Verificar logs
supabase functions logs make-server-4be966ab
```

### Passo 4: Configurar Secrets na Edge Function

```bash
# Via CLI
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set EVOLUTION_API_KEY=sua-evolution-key
supabase secrets set EVOLUTION_API_URL=https://evolution.com
supabase secrets set STRIPE_PROFESSIONAL_PRICE_ID=price_...
supabase secrets set STRIPE_UNLIMITED_PRICE_ID=price_...

# Ou via Dashboard
# Settings → Edge Functions → Environment Variables
```

### Passo 5: Configurar CORS

```bash
# No Supabase Dashboard
# Settings → API → CORS Settings

# Adicionar origens permitidas:
https://seudominio.com
https://www.seudominio.com
http://localhost:5173  # Apenas para dev
```

### Passo 6: Obter Credenciais

```bash
# No Supabase Dashboard → Settings → API

# Copie:
Project URL: https://xxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NUNCA exponha no frontend!)

# Use no .env:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Configuração do Stripe

### Passo 1: Criar Conta

1. Acesse https://stripe.com
2. Crie conta ou faça login
3. Complete verificação da conta

### Passo 2: Criar Produtos

```bash
# No Stripe Dashboard → Products → Add Product

# Produto 1: Business
Name: LeadsFlow Business
Pricing: $20/mês (recorrente)
Billing period: Monthly

# Salve e copie o Price ID: price_1ABC...business

# Produto 2: Business Anual
Name: LeadsFlow Business (Anual)
Pricing: $100/ano (recorrente)
Billing period: Yearly

# Produto 3: Enterprise
Name: LeadsFlow Enterprise
Pricing: $59/mês (recorrente)
Billing period: Monthly

# Produto 4: Enterprise Anual
Name: LeadsFlow Enterprise (Anual)
Pricing: $200/ano (recorrente)
Billing period: Yearly
```

### Passo 3: Configurar Webhook

```bash
# Stripe Dashboard → Developers → Webhooks → Add Endpoint

# Endpoint URL:
https://seu-projeto.supabase.co/functions/v1/make-server-4be966ab/stripe/webhook

# Eventos para escutar:
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed

# Clique em "Add endpoint"
# Copie o Webhook Secret: whsec_...
```

### Passo 4: Obter API Keys

```bash
# Stripe Dashboard → Developers → API Keys

# Publishable key (frontend):
pk_live_...

# Secret key (backend - NUNCA exponha!):
sk_live_...

# Webhook signing secret:
whsec_...
```

### Passo 5: Testar Webhook Localmente

```bash
# Instalar Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Login
stripe login

# Forward webhooks para local
stripe listen --forward-to http://localhost:54321/functions/v1/make-server-4be966ab/stripe/webhook

# Trigger teste
stripe trigger checkout.session.completed
```

---

## Configuração da Evolution API

### Opção 1: Self-Hosted (Recomendado)

```bash
# VPS separado para Evolution API

# Clone
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configure .env
cp .env.example .env
nano .env
```

```env
# Evolution API .env
SERVER_URL=https://evolution.seudominio.com
AUTHENTICATION_API_KEY=sua-chave-secreta-aqui

DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://user:pass@host:5432/evolution

RABBITMQ_ENABLED=false
WEBSOCKET_ENABLED=false
```

```bash
# Docker Compose
docker-compose up -d

# Verificar
curl https://evolution.seudominio.com/manager/status
```

### Opção 2: Serviço Gerenciado

```bash
# Alternativas:
- Z-API: https://z-api.io (pago)
- Baileys Cloud: https://baileys.cloud (pago)
- WPPConnect: https://wppconnect.io (self-host)
```

### Passo 3: Configurar no LeadsFlow

```bash
# .env
VITE_EVOLUTION_API_URL=https://evolution.seudominio.com
EVOLUTION_API_KEY=sua-chave-secreta-aqui

# No Supabase Edge Function secrets
supabase secrets set EVOLUTION_API_URL=https://evolution.seudominio.com
supabase secrets set EVOLUTION_API_KEY=sua-chave-secreta-aqui
```

---

## Variáveis de Ambiente

### Frontend (.env)

```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Stripe (obrigatório para pagamentos)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (opcional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789

# Evolution API (opcional)
VITE_EVOLUTION_API_URL=https://evolution.com
```

### Backend (Supabase Edge Function Secrets)

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (NUNCA exponha!)

# Stripe
STRIPE_SECRET_KEY=sk_live_... (NUNCA exponha!)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...

# Evolution API
EVOLUTION_API_KEY=sua-chave (NUNCA exponha!)
EVOLUTION_API_URL=https://evolution.com
```

---

## DNS e Domínio

### Registradores Recomendados

- **Namecheap**: Barato, simples
- **Cloudflare Registrar**: Preço de custo + proteção DDoS grátis
- **Google Domains**: Confiável (agora Squarespace)

### Configuração DNS

```bash
# Para Vercel/Netlify
Type: A
Name: @
Value: (IP fornecido pela plataforma)

Type: CNAME
Name: www
Value: cname.vercel-dns.com (ou netlify)

# Para VPS próprio
Type: A
Name: @
Value: SEU.IP.VPS.AQUI

Type: A
Name: www
Value: SEU.IP.VPS.AQUI

# Subdomínio Evolution API
Type: A
Name: evolution
Value: IP.DO.VPS.EVOLUTION
```

### Cloudflare (Recomendado)

```bash
# Vantagens:
✅ SSL automático
✅ CDN global grátis
✅ Proteção DDoS
✅ Cache automático
✅ Analytics

# Setup:
1. Criar conta em https://cloudflare.com
2. Adicionar domínio
3. Mudar nameservers no registrador:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
4. Aguardar propagação (até 24h)
5. Configurar DNS records como acima
6. Ativar SSL/TLS → Full (strict)
7. Ativar Auto Minify (JS, CSS, HTML)
```

---

## SSL/HTTPS

### Opção 1: Let's Encrypt (VPS)

```bash
# Certbot (já mostrado acima)
certbot --nginx -d seudominio.com -d www.seudominio.com

# Auto-renewal está configurado automaticamente
# Testar:
certbot renew --dry-run
```

### Opção 2: Cloudflare (Recomendado)

```bash
# Cloudflare fornece SSL automático
# Não precisa configurar nada

# Apenas ative:
SSL/TLS → Overview → Full (strict)
```

### Opção 3: Vercel/Netlify

```bash
# SSL automático ao adicionar domínio customizado
# Nada a fazer, funciona out-of-the-box
```

---

## Monitoramento

### 1. Supabase Built-in

```bash
# Supabase Dashboard → Database → Reports
- Query performance
- Connection pooling
- Storage usage

# Edge Functions → Logs
- Invocations
- Errors
- Response times
```

### 2. Sentry (Error Tracking)

```bash
# Instalar
npm install @sentry/react

# Configurar
# src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 3. Google Analytics

```bash
# Já configurado via MetaPixel.tsx e Analytics.tsx
# Apenas configure VITE_GA_MEASUREMENT_ID no .env
```

### 4. Uptime Monitoring

```bash
# Opções gratuitas:
- UptimeRobot: https://uptimerobot.com
- StatusCake: https://statuscake.com
- Pingdom: https://pingdom.com (pago)

# Configure:
- URL: https://seudominio.com
- Interval: 5 minutos
- Alertas: Email + SMS
```

---

## Backup e Restore

### Backup do Supabase

```bash
# Backup automático está ativado por padrão no Supabase
# Retenção: 7 dias (Free), 30 dias (Pro)

# Backup manual
supabase db dump -f backup.sql

# Restaurar
supabase db reset
psql postgresql://user:pass@db.xxx.supabase.co:5432/postgres < backup.sql
```

### Backup de Código

```bash
# GitHub já é o backup
# Tags de versão para rollback fácil

git tag v1.0.0
git push origin v1.0.0

# Rollback
git checkout v1.0.0
```

---

## Troubleshooting

### Problema: Build falha no deploy

```bash
# Solução 1: Verificar versão Node
node --version  # Deve ser 18+ ou 20+

# Solução 2: Limpar cache
rm -rf node_modules package-lock.json
npm install

# Solução 3: Verificar variáveis de ambiente
# Certifique-se que todas estão configuradas
```

### Problema: Edge Function retorna 404

```bash
# Solução: Redeploy da função
supabase functions deploy make-server-4be966ab

# Verificar logs
supabase functions logs make-server-4be966ab
```

### Problema: Stripe webhook não funciona

```bash
# Verificar:
1. URL do webhook está correta?
2. Webhook secret está configurado?
3. Eventos corretos selecionados?
4. Edge Function está online?

# Testar localmente
stripe listen --forward-to localhost:54321/functions/v1/make-server-4be966ab/stripe/webhook
stripe trigger checkout.session.completed
```

### Problema: WhatsApp não conecta

```bash
# Verificar:
1. Evolution API está online?
2. API Key está correta?
3. Instance foi criada corretamente?

# Logs da Evolution API
docker logs evolution-api

# Testar API
curl -H "apikey: sua-chave" https://evolution.com/manager/status
```

---

## Checklist Final de Deploy

- [ ] **Frontend deployado** (Railway/Vercel/Netlify/VPS)
- [ ] **Domínio configurado** e DNS propagado
- [ ] **SSL ativado** (HTTPS funcionando)
- [ ] **Supabase configurado** (projeto criado, schema executado)
- [ ] **Edge Function deployada** (make-server-4be966ab online)
- [ ] **Secrets configurados** no Supabase Edge Function
- [ ] **Stripe configurado** (produtos criados, webhook ativo)
- [ ] **Evolution API configurada** (se usar WhatsApp)
- [ ] **Analytics configurado** (GA + Meta Pixel)
- [ ] **Monitoramento ativo** (Uptime Robot + Sentry)
- [ ] **Backup configurado** (Supabase auto-backup)
- [ ] **Teste de signup** (criar conta funciona?)
- [ ] **Teste de login** (login funciona?)
- [ ] **Teste de lead** (criar/editar/deletar funciona?)
- [ ] **Teste de pagamento** (checkout funciona?)
- [ ] **Teste de WhatsApp** (QR code funciona? Envio funciona?)

---

## 🎉 Parabéns!

Seu LeadsFlow API está no ar! 🚀

Para suporte:
- **Documentação**: Ver README.md, API.md, ARCHITECTURE.md
- **Issues**: GitHub Issues
- **Email**: suporte@leadsflow.com

**Próximos passos**:
1. Monitore logs e erros nos primeiros dias
2. Configure alertas de uptime
3. Faça testes de carga
4. Otimize performance baseado em métricas reais
5. Implemente features do roadmap

Boa sorte! 🍀
