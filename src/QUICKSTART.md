# ⚡ Quick Start - LeadsFlow API

Guia rápido para ter o LeadsFlow API rodando em **menos de 10 minutos**!

---

## 🚀 Início Rápido (5 minutos)

### 1️⃣ Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/leadsflow-api.git
cd leadsflow-api

# Instale as dependências
npm install
```

### 2️⃣ Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta grátis
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - `URL` (VITE_SUPABASE_URL)
   - `anon/public key` (VITE_SUPABASE_ANON_KEY)

4. Vá em **SQL Editor** e execute o script:
   ```sql
   -- Cole todo o conteúdo do arquivo SUPABASE_SCHEMA.sql
   ```

### 3️⃣ Configure as Variáveis

```bash
# Copie o template
cp .env.example .env

# Edite o arquivo .env
nano .env
```

**Preencha no mínimo:**
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_STRIPE_PUBLIC_KEY=pk_test_... # (opcional no início)
```

### 4️⃣ Execute!

```bash
npm run dev
```

Acesse: **http://localhost:5173** 🎉

---

## 📝 Primeiro Uso

### Criar Conta

1. Clique em **"Criar Conta"**
2. Preencha:
   - Email
   - Senha
   - Nome completo
3. Clique em **"Registrar"**

Você será automaticamente logado com o plano **Free** (100 leads, 50 mensagens).

### Adicionar Primeiro Lead

1. No Dashboard, clique em **"+ Adicionar Leads"**
2. Preencha:
   - Nome (obrigatório)
   - Email
   - Telefone
   - Origem
3. Clique em **"Salvar"**

✅ Pronto! Seu primeiro lead foi criado.

---

## 🔧 Configurações Opcionais

### WhatsApp (Evolution API)

**1. Configure Evolution API:**
   - Obtenha URL e API Key da sua instância
   - Adicione no `.env`:
     ```bash
     VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
     VITE_EVOLUTION_API_KEY=sua-api-key
     ```

**2. No Dashboard:**
   - Vá em **Configurações > Integrações**
   - Configure WhatsApp
   - Escaneie o QR Code

**3. Enviar Mensagem:**
   - Selecione um lead
   - Clique no ícone WhatsApp
   - Digite e envie!

### Webhooks N8N (Google Sheets)

**1. Crie Workflow N8N:**
   - Adicione um **Webhook** trigger (GET)
   - Conecte com **Google Sheets**
   - Configure para retornar leads em JSON

**2. No Dashboard:**
   - Vá em **Configurações > Integrações > Webhooks N8N**
   - Cole a URL do webhook
   - Clique em **"Salvar"**

**3. Sincronizar:**
   - Na tabela de leads, clique em **"Atualizar"**
   - Leads do Google Sheets serão importados!

### Stripe (Pagamentos)

**1. Crie conta no Stripe:**
   - Acesse [stripe.com](https://stripe.com)
   - Ative modo de teste

**2. Configure:**
   - Vá em **Developers > API Keys**
   - Copie a `Publishable key`
   - Adicione no `.env`:
     ```bash
     VITE_STRIPE_PUBLIC_KEY=pk_test_...
     ```

**3. Testar Upgrade:**
   - No Dashboard, clique em **"Fazer Upgrade"**
   - Use cartão de teste: `4242 4242 4242 4242`

---

## 📦 Funcionalidades Principais

### 📊 Dashboard
- Visualize estatísticas em tempo real
- Gráficos de origens e status
- Leads recentes

### 👤 Leads
- Adicionar, editar, deletar leads
- Importar Excel (.xlsx/.xls)
- Exportar CSV
- Buscar e filtrar

### 💬 WhatsApp
- Envio individual
- Envio em massa
- Templates personalizados

### 📧 Email
- Envio individual
- Campanhas em massa
- Marcar leads para envio

### 🔄 Sincronização
- Auto-sync com Google Sheets (15s)
- Botão manual de sincronização
- Webhooks N8N

### ⚙️ Configurações
- Conta e perfil
- Planos e billing
- Integrações
- Segurança

---

## 🐳 Deploy Rápido (Coolify)

### 1️⃣ Prepare o Repositório

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2️⃣ No Coolify

1. **New Resource** > **Public Repository**
2. **Repository:** `https://github.com/seu-usuario/leadsflow-api`
3. **Branch:** `main`
4. **Build Pack:** Nixpacks
5. **Build Command:** `npm install && npm run build`
6. **Start Command:** `npx serve -s dist -l 3000`
7. **Port:** `3000`

### 3️⃣ Adicione Variáveis

No painel do Coolify, adicione todas as variáveis do `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_STRIPE_PUBLIC_KEY=...
```

### 4️⃣ Deploy!

Clique em **Deploy** e aguarde.

Acesse seu domínio: `https://leadsflow.seudominio.com` 🚀

---

## 📚 Próximos Passos

Agora que você tem o LeadsFlow rodando:

1. **Explore o Dashboard** - Familiarize-se com a interface
2. **Importe Leads** - Use o Excel ou Google Sheets
3. **Configure Integrações** - WhatsApp, N8N, Stripe
4. **Teste Envios** - Mensagens e emails
5. **Faça Deploy** - Coloque em produção
6. **Customize** - Adapte ao seu negócio

---

## 🆘 Problemas Comuns

### ❌ Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Build falha
```bash
npm run check  # Verificar erros TypeScript
```

### ❌ Variáveis não funcionam
- Certifique-se que começam com `VITE_`
- Reinicie o servidor após alterar `.env`

### ❌ Supabase não conecta
- Verifique URL e chave no `.env`
- Execute o schema SQL no Supabase
- Verifique Row Level Security (RLS)

---

## 📖 Documentação Completa

- [README.md](README.md) - Documentação principal
- [DEPLOY.md](DEPLOY.md) - Guia de deploy
- [DEVELOPMENT.md](DEVELOPMENT.md) - Guia para devs
- [API.md](API.md) - Documentação da API
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças

---

## 💬 Suporte

Precisa de ajuda?

- 📧 Email: contato@personalcreativelda.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/leadsflow-api/issues)
- 📖 Docs: [Documentação completa](README.md)

---

## ✅ Checklist de Setup

Marque conforme completar:

- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto Supabase criado
- [ ] Schema SQL executado
- [ ] Arquivo `.env` configurado
- [ ] Projeto rodando localmente (`npm run dev`)
- [ ] Primeira conta criada
- [ ] Primeiro lead adicionado
- [ ] (Opcional) WhatsApp configurado
- [ ] (Opcional) N8N configurado
- [ ] (Opcional) Stripe configurado
- [ ] (Opcional) Deploy realizado

---

<div align="center">

**🎉 Parabéns! Você configurou o LeadsFlow API!**

Agora comece a gerenciar seus leads profissionalmente! 🚀

[⬆ Voltar ao topo](#-quick-start---leadsflow-api)

</div>
