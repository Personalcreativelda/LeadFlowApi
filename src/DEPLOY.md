# 🚀 Guia Completo de Deploy - LeadsFlow API

Este guia contém instruções detalhadas para fazer deploy do LeadsFlow API usando **Coolify**, **VPS manual**, ou **outras plataformas**.

---

## 📋 Índice

- [Preparação](#-preparação)
- [Deploy com Coolify (Recomendado)](#-deploy-com-coolify-recomendado)
- [Deploy Manual em VPS](#-deploy-manual-em-vps)
- [Deploy em Outras Plataformas](#-deploy-em-outras-plataformas)
- [Configuração de DNS](#-configuração-de-dns)
- [SSL/HTTPS](#-sslhttps)
- [Monitoramento](#-monitoramento)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Preparação

### Antes de Começar

Certifique-se de ter:

- ✅ Repositório Git configurado (GitHub, GitLab, etc.)
- ✅ Conta Supabase criada e configurada
- ✅ Projeto buildando localmente sem erros
- ✅ Variáveis de ambiente documentadas
- ✅ Domínio registrado (opcional, mas recomendado)

### Teste Local de Produção

Antes de fazer deploy, teste o build de produção localmente:

```bash
# Build
npm run build

# Preview
npm run preview
```

Acesse `http://localhost:4173` e verifique se tudo funciona.

---

## 🐳 Deploy com Coolify (Recomendado)

Coolify é uma alternativa self-hosted ao Heroku/Vercel. Suporta deploy automático via Git.

### Passo 1: Preparar o Repositório

#### 1.1 Commit e Push

```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

#### 1.2 Criar arquivo `nixpacks.toml` (Opcional)

Crie na raiz do projeto:

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npx serve -s dist -l 3000'
```

### Passo 2: Configurar no Coolify

#### 2.1 Criar Novo Projeto

1. Acesse seu painel Coolify
2. Clique em **New Resource**
3. Selecione **Public Repository**

#### 2.2 Configuração do Repository

```
Repository URL: https://github.com/seu-usuario/leadsflow-api
Branch: main
Build Pack: Nixpacks (ou Dockerfile se tiver)
```

#### 2.3 Build Configuration

```yaml
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l 3000
Port: 3000
```

**Alternativa com nginx:**

```yaml
Build Command: npm install && npm run build
Start Command: nginx -g 'daemon off;'
Port: 80
```

#### 2.4 Environment Variables

Adicione todas as variáveis do `.env`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_EVOLUTION_API_URL=https://...
VITE_EVOLUTION_API_KEY=...
VITE_META_PIXEL_ID=...
# ... todas as outras variáveis
```

⚠️ **IMPORTANTE:** Todas as variáveis devem começar com `VITE_` para serem expostas ao frontend.

#### 2.5 Domain Configuration

1. Configure seu domínio:
   ```
   leadsflow.seudominio.com
   ```

2. Coolify gerará SSL automaticamente (Let's Encrypt)

3. Aguarde a propagação do DNS (pode levar até 24h)

### Passo 3: Deploy

1. Clique em **Deploy**
2. Acompanhe os logs de build
3. Quando concluído, acesse seu domínio!

### Deploy Automático (CI/CD)

Coolify monitora o repositório Git. Quando você fizer push para a branch configurada, o deploy será automático:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
# Deploy automático iniciado!
```

---

## 🖥️ Deploy Manual em VPS

Para deploy em servidor próprio (Ubuntu/Debian).

### Passo 1: Preparar o Servidor

#### 1.1 Conectar ao Servidor

```bash
ssh usuario@seu-servidor.com
```

#### 1.2 Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Instalar Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar instalação
```

#### 1.4 Instalar Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Passo 2: Clonar e Buildar o Projeto

#### 2.1 Clonar Repositório

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/leadsflow-api.git
cd leadsflow-api
```

#### 2.2 Instalar Dependências

```bash
sudo npm install
```

#### 2.3 Configurar Variáveis de Ambiente

```bash
sudo nano .env
```

Cole suas variáveis de ambiente e salve (`Ctrl+X`, `Y`, `Enter`).

#### 2.4 Build

```bash
sudo npm run build
```

A pasta `dist/` será criada com os arquivos estáticos.

### Passo 3: Configurar Nginx

#### 3.1 Criar Arquivo de Configuração

```bash
sudo nano /etc/nginx/sites-available/leadsflow
```

#### 3.2 Adicionar Configuração

```nginx
server {
    listen 80;
    server_name leadsflow.seudominio.com;

    root /var/www/leadsflow-api/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA routing - redirecionar tudo para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Disable access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 3.3 Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/leadsflow /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl reload nginx
```

### Passo 4: Configurar SSL (HTTPS)

#### 4.1 Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 4.2 Obter Certificado SSL

```bash
sudo certbot --nginx -d leadsflow.seudominio.com
```

Siga as instruções interativas.

#### 4.3 Auto-renovação

Certbot configura auto-renovação automaticamente. Teste:

```bash
sudo certbot renew --dry-run
```

### Passo 5: Atualizações Futuras

Para atualizar a aplicação:

```bash
cd /var/www/leadsflow-api
sudo git pull origin main
sudo npm install
sudo npm run build
sudo systemctl reload nginx
```

---

## 🌐 Deploy em Outras Plataformas

### Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configurar variáveis de ambiente** no dashboard Vercel

4. **Problema:** Vercel pode ter limitações com Vite. Teste antes.

### Netlify

1. **Criar `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Git** conectando o repositório

3. **Configurar variáveis** no dashboard Netlify

### Railway

1. **Conectar repositório GitHub**

2. **Configuração automática** (Railway detecta Vite)

3. **Adicionar variáveis de ambiente**

4. **Deploy automático**

### Render

1. **Criar New Static Site**

2. **Configuração:**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Adicionar variáveis de ambiente**

4. **Deploy**

---

## 🌍 Configuração de DNS

### Adicionar Registro DNS

No seu provedor de domínio (GoDaddy, Namecheap, Cloudflare, etc.):

#### Tipo A (IP direto)

```
Tipo: A
Nome: leadsflow (ou @)
Valor: 123.456.789.0 (IP do seu servidor)
TTL: 3600
```

#### Tipo CNAME (subdomínio)

```
Tipo: CNAME
Nome: app
Valor: seu-servidor.com
TTL: 3600
```

### Cloudflare (Recomendado)

Vantagens:
- ✅ SSL grátis
- ✅ CDN global
- ✅ DDoS protection
- ✅ Cache automático

**Configuração:**

1. Adicione seu domínio no Cloudflare
2. Atualize os nameservers no seu registrador
3. Configure DNS apontando para seu servidor
4. Ative "Proxy" (nuvem laranja)
5. Em SSL/TLS, selecione "Full"

---

## 🔒 SSL/HTTPS

### Com Certbot (Let's Encrypt)

```bash
sudo certbot --nginx -d leadsflow.seudominio.com
```

### Com Cloudflare

SSL automático - sem configuração necessária!

### Renovação Automática

Certbot configura cron job automático:

```bash
# Verificar timer
sudo systemctl status certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

---

## 📊 Monitoramento

### Logs do Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitorar Status do Servidor

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Status do Nginx
sudo systemctl status nginx
```

### Uptime Monitoring

Ferramentas recomendadas:
- [UptimeRobot](https://uptimerobot.com) - Grátis
- [Better Uptime](https://betteruptime.com) - Grátis até 10 monitores
- [Pingdom](https://www.pingdom.com)

---

## 🔧 Troubleshooting

### Problema: Build Falha

**Erro:** `npm run build` falha

**Solução:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Página em Branco

**Causa:** SPA routing não configurado

**Solução:** Verifique se o nginx redireciona para `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: Variáveis de Ambiente Não Funcionam

**Causa:** Variáveis sem prefixo `VITE_`

**Solução:**
```bash
# ❌ Errado
API_URL=https://...

# ✅ Correto
VITE_API_URL=https://...
```

Rebuilde após alterar:
```bash
npm run build
```

### Problema: 502 Bad Gateway

**Causa:** Aplicação não está rodando

**Solução:**
```bash
# Verificar se a porta está ouvindo
sudo netstat -tlnp | grep 3000

# Reiniciar serviço
sudo systemctl restart leadsflow
```

### Problema: Assets Não Carregam

**Causa:** Caminho incorreto ou CORS

**Solução:** Verifique o `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/', // Caminho base
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### Problema: SSL Certificate Error

**Solução:**
```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Recarregar nginx
sudo systemctl reload nginx
```

---

## 📝 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Projeto builda sem erros localmente
- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] `.env` não está commitado no Git
- [ ] `.gitignore` contém `.env` e `dist/`
- [ ] Domínio configurado e apontando para o servidor
- [ ] SSL configurado (HTTPS)
- [ ] Nginx configurado para SPA routing
- [ ] Testes básicos funcionando
- [ ] Backup do banco de dados realizado
- [ ] Monitoramento configurado

---

## 🎉 Deploy Concluído!

Após seguir este guia, seu LeadsFlow API estará no ar!

**Próximos passos:**

1. Configure monitoramento de uptime
2. Configure backups automáticos do Supabase
3. Adicione analytics (Google Analytics, Plausible, etc.)
4. Configure notificações de erro (Sentry)
5. Otimize performance (Lighthouse)

---

## 📞 Suporte

Problemas com deploy?

- 📧 Email: contato@personalcreativelda.com
- 📖 Documentação: [README.md](README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/leadsflow-api/issues)

---

<div align="center">

**Feito com ❤️ por PersonalCreativeLda**

[⬆ Voltar ao topo](#-guia-completo-de-deploy---leadsflow-api)

</div>
