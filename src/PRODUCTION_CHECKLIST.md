# ✅ Checklist de Produção - LeadsFlow API

## 📋 Índice

- [Pré-Deploy](#pré-deploy)
- [Configuração](#configuração)
- [Segurança](#segurança)
- [Performance](#performance)
- [Testes](#testes)
- [Monitoramento](#monitoramento)
- [Documentação](#documentação)
- [Deploy](#deploy)
- [Pós-Deploy](#pós-deploy)
- [Manutenção](#manutenção)

---

## Pré-Deploy

### ✅ Código

- [ ] **Sem console.logs desnecessários** (apenas logs de erro são OK)
- [ ] **Sem TODOs ou FIXMEs** pendentes no código
- [ ] **Sem variáveis hardcoded** (senhas, tokens, URLs)
- [ ] **TypeScript sem erros** (`npm run type-check`)
- [ ] **ESLint sem warnings críticos** (`npm run lint`)
- [ ] **Build funciona** (`npm run build`)
- [ ] **Preview funciona** (`npm run preview`)
- [ ] **Sem dependências não utilizadas** no package.json

### ✅ Git

- [ ] **Branch main limpa** (sem commits de teste)
- [ ] **.gitignore configurado** (não commitar .env, node_modules, dist)
- [ ] **README.md atualizado** com instruções corretas
- [ ] **CHANGELOG.md atualizado** com versão e mudanças
- [ ] **Tag de versão criada** (`git tag v1.0.0`)
- [ ] **Backup do código** em repositório remoto seguro

---

## Configuração

### ✅ Variáveis de Ambiente

#### Frontend

- [ ] `VITE_SUPABASE_URL` configurado (produção)
- [ ] `VITE_SUPABASE_ANON_KEY` configurado (produção)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` configurado (pk_live_...)
- [ ] `VITE_GA_MEASUREMENT_ID` configurado (opcional)
- [ ] `VITE_META_PIXEL_ID` configurado (opcional)
- [ ] `VITE_EVOLUTION_API_URL` configurado (se usar WhatsApp)

#### Backend (Supabase Edge Function)

- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado (**NUNCA exponha no frontend!**)
- [ ] `STRIPE_SECRET_KEY` configurado (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` configurado (whsec_...)
- [ ] `STRIPE_PROFESSIONAL_PRICE_ID` configurado
- [ ] `STRIPE_UNLIMITED_PRICE_ID` configurado
- [ ] `EVOLUTION_API_KEY` configurado (se usar WhatsApp)
- [ ] `EVOLUTION_API_URL` configurado (se usar WhatsApp)

### ✅ Supabase

- [ ] **Projeto de produção criado** (separado de dev/staging)
- [ ] **Schema SQL executado** (tabela kv_store_4be966ab criada)
- [ ] **Indexes criados** para performance
- [ ] **Edge Function deployada** (`supabase functions deploy make-server-4be966ab`)
- [ ] **Secrets configurados** na Edge Function
- [ ] **CORS configurado** (apenas domínios de produção)
- [ ] **Rate limiting ativado** (se disponível no plano)
- [ ] **Backups automáticos ativados** (padrão no Supabase)

### ✅ Stripe

- [ ] **Conta verificada** (KYC completo)
- [ ] **Modo live ativado** (não test mode)
- [ ] **Produtos criados** (Business e Enterprise)
- [ ] **Preços configurados** (mensal e anual)
- [ ] **Webhook configurado** apontando para produção
- [ ] **Eventos do webhook selecionados**:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] **Webhook secret copiado** para env vars
- [ ] **Teste de pagamento real feito** (cartão de teste)

### ✅ Evolution API (Opcional)

- [ ] **Evolution API deployada** e acessível
- [ ] **API Key gerada** e configurada
- [ ] **Teste de conexão funcionando**
- [ ] **QR Code sendo gerado corretamente**
- [ ] **Envio de mensagem testado**

---

## Segurança

### ✅ Autenticação

- [ ] **JWT tokens seguros** (Supabase Auth)
- [ ] **Refresh tokens funcionando**
- [ ] **Logout invalida tokens**
- [ ] **Proteção de rotas funcionando**
- [ ] **Redirecionamento de não-autenticados para login**
- [ ] **Senha mínima de 6 caracteres** (recomendado 8+)
- [ ] **Email de confirmação** (opcional, mas recomendado)
- [ ] **Reset de senha funcionando**

### ✅ Autorização

- [ ] **Multi-tenancy funcionando** (usuários veem apenas seus dados)
- [ ] **Isolamento de dados** (chaves KV com prefixo de userId)
- [ ] **Validação de permissões** em todas as rotas backend
- [ ] **Usuário não pode acessar dados de outro usuário**
- [ ] **Testes de autorização feitos** (tentar acessar dados de outro user)

### ✅ Proteção de Dados

- [ ] **HTTPS em produção** (SSL configurado)
- [ ] **Secrets não expostos** no frontend
- [ ] **Service Role Key NUNCA no frontend**
- [ ] **API Keys não commitadas** no Git
- [ ] **.env no .gitignore**
- [ ] **Input sanitization** (contra XSS)
- [ ] **SQL injection protection** (queries parametrizadas)
- [ ] **CORS configurado** (apenas domínios permitidos)

### ✅ Compliance

- [ ] **LGPD**: Termos de uso e política de privacidade (se Brasil)
- [ ] **GDPR**: Se tiver usuários europeus
- [ ] **Cookie consent**: Se usar cookies de terceiros
- [ ] **Opção de deletar conta** (direito ao esquecimento)
- [ ] **Exportação de dados** do usuário (se solicitado)

---

## Performance

### ✅ Frontend

- [ ] **Build otimizado** (`npm run build` sem erros)
- [ ] **Lazy loading** de rotas implementado
- [ ] **Code splitting** funcionando (vendor, chunks)
- [ ] **Imagens otimizadas** (comprimidas, formatos modernos)
- [ ] **Bundle size aceitável** (< 1MB gzipped)
- [ ] **Lighthouse score** > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] **First Contentful Paint** < 2s
- [ ] **Time to Interactive** < 3.5s

### ✅ Backend

- [ ] **Queries otimizadas** (sem N+1, uso de indexes)
- [ ] **Caching implementado** (onde faz sentido)
- [ ] **Rate limiting** para prevenir abuso
- [ ] **Conexões de banco gerenciadas** (connection pooling)
- [ ] **Timeouts configurados** (evitar requests eternos)
- [ ] **Response time** < 500ms (p95)

### ✅ Database

- [ ] **Indexes criados** nas colunas mais consultadas
- [ ] **Queries analisadas** (EXPLAIN no SQL)
- [ ] **Dados desnormalizados** onde necessário
- [ ] **Limpeza de dados antigos** (se aplicável)

---

## Testes

### ✅ Testes Funcionais

#### Autenticação
- [ ] **Signup funciona** (criar conta nova)
- [ ] **Login funciona** (entrar com conta existente)
- [ ] **Logout funciona** (deslogar e limpar sessão)
- [ ] **Reset de senha funciona** (receber email e resetar)
- [ ] **Sessão persiste** (recarregar página mantém login)

#### Leads
- [ ] **Criar lead funciona** (cadastro manual)
- [ ] **Editar lead funciona** (atualizar dados)
- [ ] **Deletar lead funciona** (com confirmação)
- [ ] **Importar leads funciona** (CSV com sucesso)
- [ ] **Exportar leads funciona** (gera CSV correto)
- [ ] **Filtros funcionam** (status, tags, data, busca)
- [ ] **Paginação funciona** (navegação entre páginas)

#### WhatsApp
- [ ] **Conectar WhatsApp funciona** (QR Code gerado)
- [ ] **Escanear QR Code conecta** (status muda para connected)
- [ ] **Enviar mensagem individual funciona**
- [ ] **Enviar mensagem em massa funciona**
- [ ] **Variáveis são substituídas** ({nome}, {empresa})
- [ ] **Limites são respeitados** (não permite exceder)
- [ ] **Desconectar funciona**

#### Email
- [ ] **Configurar SMTP funciona**
- [ ] **Testar SMTP funciona** (recebe email de teste)
- [ ] **Enviar email individual funciona**
- [ ] **Enviar email em massa funciona**
- [ ] **Templates funcionam**
- [ ] **Variáveis são substituídas**

#### Pagamentos
- [ ] **Abrir checkout Stripe funciona**
- [ ] **Fazer pagamento teste funciona** (cartão de teste)
- [ ] **Webhook processa pagamento** (plano atualiza)
- [ ] **Limites aumentam** após upgrade
- [ ] **Cancelar assinatura funciona**
- [ ] **Downgrade automático funciona** (após expiração)

#### Integrações
- [ ] **Webhook N8N funciona** (recebe payload correto)
- [ ] **Google Analytics funciona** (eventos sendo rastreados)
- [ ] **Meta Pixel funciona** (eventos sendo rastreados)

### ✅ Testes de Limite

- [ ] **Limite de leads respeitado** (Free: 100, Business: 1000, Enterprise: 10000)
- [ ] **Limite de mensagens WhatsApp respeitado**
- [ ] **Limite de envios em massa respeitado**
- [ ] **Modal de upgrade aparece** quando atingir limite
- [ ] **Não permite ultrapassar** limite do plano

### ✅ Testes de Erro

- [ ] **Erro 404 tratado** (página não encontrada)
- [ ] **Erro 500 tratado** (erro do servidor)
- [ ] **Erro de rede tratado** (sem internet)
- [ ] **Erro de autenticação tratado** (token expirado)
- [ ] **Erro de validação tratado** (campos inválidos)
- [ ] **Mensagens de erro são claras** (usuário entende o que fazer)

### ✅ Testes de Navegadores

- [ ] **Chrome** (última versão)
- [ ] **Firefox** (última versão)
- [ ] **Safari** (última versão)
- [ ] **Edge** (última versão)
- [ ] **Mobile Chrome** (Android)
- [ ] **Mobile Safari** (iOS)

### ✅ Testes de Responsividade

- [ ] **Desktop** (1920x1080)
- [ ] **Laptop** (1366x768)
- [ ] **Tablet** (768x1024)
- [ ] **Mobile** (375x667)

---

## Monitoramento

### ✅ Logging

- [ ] **Logs de erro** configurados (Sentry ou similar)
- [ ] **Logs de atividade** (criação de leads, envios)
- [ ] **Logs de pagamento** (webhooks Stripe)
- [ ] **Logs estruturados** (JSON com context)

### ✅ Analytics

- [ ] **Google Analytics configurado**
- [ ] **Meta Pixel configurado**
- [ ] **Eventos customizados rastreados**
- [ ] **Dashboards criados** (visualizar métricas)

### ✅ Uptime Monitoring

- [ ] **UptimeRobot configurado** (ou similar)
- [ ] **Alertas configurados** (email/SMS)
- [ ] **Múltiplos checkpoints** (homepage, /login, /dashboard)
- [ ] **Intervalo de 5 minutos**

### ✅ Error Tracking

- [ ] **Sentry configurado** (ou similar)
- [ ] **Source maps uploadados** (para debug)
- [ ] **Alertas de erro configurados**
- [ ] **Testes de erro funcionando** (lançar erro e receber no Sentry)

### ✅ Performance Monitoring

- [ ] **Supabase Dashboard** monitorado
- [ ] **Database queries** analisadas
- [ ] **Edge Function invocations** monitoradas
- [ ] **Alertas de performance** configurados

---

## Documentação

### ✅ Documentação de Código

- [ ] **README.md completo** e atualizado
- [ ] **API.md** com todos os endpoints documentados
- [ ] **ARCHITECTURE.md** com diagrama de arquitetura
- [ ] **DEPLOYMENT_GUIDE.md** com passos de deploy
- [ ] **DEVELOPMENT.md** para desenvolvedores
- [ ] **FEATURES.md** com todas as funcionalidades
- [ ] **CHANGELOG.md** atualizado

### ✅ Documentação de Usuário

- [ ] **Guia de início rápido**
- [ ] **FAQ** atualizado
- [ ] **Tutoriais** em vídeo (opcional)
- [ ] **Base de conhecimento** (se tiver)

### ✅ Documentação Técnica

- [ ] **Diagrama de arquitetura** atualizado
- [ ] **Fluxogramas** de processos críticos
- [ ] **Schema do banco** documentado
- [ ] **Variáveis de ambiente** documentadas

---

## Deploy

### ✅ Pré-Deploy

- [ ] **Branch main estável** (sem commits quebrados)
- [ ] **Tag de versão criada** (`git tag v1.0.0`)
- [ ] **Backup do banco** (Supabase auto-backup OK)
- [ ] **Rollback plan** definido (como voltar versão anterior)

### ✅ Deploy Checklist

- [ ] **Build de produção gerado** (`npm run build`)
- [ ] **Variáveis de ambiente configuradas** (produção)
- [ ] **Edge Function deployada** (Supabase)
- [ ] **Frontend deployado** (Railway/Vercel/Netlify/VPS)
- [ ] **DNS configurado** (domínio apontando)
- [ ] **SSL ativado** (HTTPS funcionando)

### ✅ Smoke Tests Pós-Deploy

- [ ] **Homepage carrega** (200 OK)
- [ ] **Login funciona**
- [ ] **Dashboard carrega** após login
- [ ] **Criar lead funciona**
- [ ] **WhatsApp conecta** (se configurado)
- [ ] **Pagamento Stripe funciona** (checkout abre)
- [ ] **Webhook Stripe funciona** (testar com Stripe CLI)

---

## Pós-Deploy

### ✅ Validação

- [ ] **Teste completo do fluxo de signup**
  1. Criar conta
  2. Confirmar email (se configurado)
  3. Fazer login
  4. Criar lead
  5. Enviar mensagem WhatsApp
  6. Fazer upgrade de plano
  7. Verificar limites atualizados

- [ ] **Teste de pagamento real**
  - [ ] Fazer checkout Business
  - [ ] Confirmar pagamento
  - [ ] Verificar webhook processado
  - [ ] Verificar plano atualizado
  - [ ] Verificar limites aumentados

- [ ] **Teste de diferentes navegadores**
- [ ] **Teste mobile** (iOS e Android)

### ✅ Comunicação

- [ ] **Anunciar lançamento** (redes sociais, email marketing)
- [ ] **Notificar beta testers** (se teve beta)
- [ ] **Preparar suporte** (email, chat)
- [ ] **Status page** (se tiver)

### ✅ Monitoramento Inicial

- [ ] **Monitorar logs** nas primeiras 24h
- [ ] **Monitorar erros** (Sentry)
- [ ] **Monitorar uptime** (UptimeRobot)
- [ ] **Monitorar performance** (Supabase Dashboard)
- [ ] **Responder feedback** de primeiros usuários

---

## Manutenção

### ✅ Diária

- [ ] **Verificar uptime** (status 200 OK)
- [ ] **Verificar erros** (Sentry sem erros críticos)
- [ ] **Responder suporte** (tickets, emails)

### ✅ Semanal

- [ ] **Analisar métricas** (usuários, conversões, receita)
- [ ] **Revisar logs de erro**
- [ ] **Verificar performance** (queries lentas)
- [ ] **Backup manual** (adicional ao automático)
- [ ] **Atualizar dependências** (se tiver patches de segurança)

### ✅ Mensal

- [ ] **Análise de uso** (features mais/menos usadas)
- [ ] **Revisar planos** (ajustar limites se necessário)
- [ ] **Otimizar database** (vacuum, reindex)
- [ ] **Limpar dados obsoletos** (logs antigos)
- [ ] **Atualizar documentação** (se houve mudanças)
- [ ] **Planejar próximas features** (roadmap)

### ✅ Trimestral

- [ ] **Audit de segurança** (vulnerabilidades)
- [ ] **Atualizar dependências** (major versions)
- [ ] **Revisar performance** (otimizações)
- [ ] **Teste de carga** (simular 1000 usuários)
- [ ] **Revisar custos** (Supabase, hosting, Stripe)

---

## 🚨 Emergency Checklist

### Se o site cair:

1. [ ] **Verificar uptime** (está realmente down?)
2. [ ] **Verificar logs** (Supabase, Railway, Vercel)
3. [ ] **Verificar Edge Function** (está online?)
4. [ ] **Verificar database** (está acessível?)
5. [ ] **Rollback** (se deploy recente)
6. [ ] **Comunicar** (status page, Twitter)
7. [ ] **Investigar causa raiz**
8. [ ] **Documentar incidente**
9. [ ] **Plano de ação** (evitar recorrência)

### Se webhook Stripe parar:

1. [ ] **Verificar logs** da Edge Function
2. [ ] **Verificar URL** do webhook no Stripe
3. [ ] **Verificar secret** do webhook
4. [ ] **Testar manualmente** com Stripe CLI
5. [ ] **Reprocessar eventos** perdidos (Stripe Dashboard)

### Se database ficar lento:

1. [ ] **Verificar queries** (slow query log)
2. [ ] **Verificar indexes** (faltando algum?)
3. [ ] **Verificar conexões** (connection pool)
4. [ ] **Limpar cache** (se usar)
5. [ ] **Escalar** (upgrade plano Supabase)

---

## 📊 Métricas de Sucesso

### KPIs Técnicos

- [ ] **Uptime**: > 99.5%
- [ ] **Response time**: < 500ms (p95)
- [ ] **Error rate**: < 0.1%
- [ ] **Build time**: < 2 minutos
- [ ] **Deploy frequency**: 1x/semana (ou mais)

### KPIs de Negócio

- [ ] **Signups/dia**: meta definida
- [ ] **Conversão Free → Paid**: meta definida
- [ ] **Churn rate**: < 5%/mês
- [ ] **NPS**: > 50
- [ ] **Support tickets/dia**: meta definida

---

## ✅ Status Final

Antes de lançar em produção, **TODOS** os itens críticos devem estar marcados:

### Críticos (Bloqueadores)

- [ ] Build funciona sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Supabase Edge Function deployada
- [ ] Stripe webhook configurado
- [ ] HTTPS funcionando
- [ ] Teste de signup/login/dashboard OK
- [ ] Monitoring ativo (Uptime + Errors)

### Importantes (Recomendados)

- [ ] Todos os testes funcionais passando
- [ ] Documentação completa
- [ ] Analytics configurado
- [ ] Backup configurado

### Nice to Have (Opcionais)

- [ ] Testes automatizados (E2E)
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Feature flags

---

## 🎉 Você está pronto!

Se todos os itens críticos estão marcados, **seu LeadsFlow API está pronto para produção!**

**Últimas palavras**:
- 🔍 Monitore nas primeiras 48 horas
- 📧 Prepare suporte para usuários
- 📊 Analise métricas diariamente
- 🐛 Corrija bugs rapidamente
- 🚀 Itere e melhore continuamente

**Boa sorte no lançamento! 🚀**

---

Para suporte técnico:
- **Email**: dev@leadsflow.com
- **Documentação**: Ver todos os arquivos .md do projeto
- **Issues**: GitHub Issues

---

<div align="center">

**Feito com ❤️ para revolucionar a gestão de leads**

[⬆ Voltar ao topo](#-checklist-de-produção---leadsflow-api)

</div>
