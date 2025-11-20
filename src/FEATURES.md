# 📋 Funcionalidades Completas - LeadsFlow API CRM

## Índice

- [Visão Geral](#visão-geral)
- [Gestão de Leads](#gestão-de-leads)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Sistema de Planos e Limites](#sistema-de-planos-e-limites)
- [WhatsApp Business](#whatsapp-business)
- [Email Marketing](#email-marketing)
- [Automação e Webhooks](#automação-e-webhooks)
- [Dashboard e Analytics](#dashboard-e-analytics)
- [Perfil e Configurações](#perfil-e-configurações)
- [Integrações](#integrações)
- [Sistema de Notificações](#sistema-de-notificações)
- [Segurança e Privacidade](#segurança-e-privacidade)
- [Interface e UX](#interface-e-ux)

---

## Visão Geral

LeadsFlow API é um **CRM completo** focado em:

✅ Captação e gestão de leads  
✅ Comunicação multi-canal (WhatsApp + Email)  
✅ Automação de processos via N8N  
✅ Sistema de assinaturas com Stripe  
✅ Analytics e tracking avançado  
✅ Multi-tenancy seguro  

---

## Gestão de Leads

### ✨ Cadastro de Leads

#### Cadastro Manual

- **Interface**: Modal "Novo Lead" no dashboard
- **Campos obrigatórios**: Nome
- **Campos opcionais**: 
  - Email (validação automática)
  - Telefone (formatação automática)
  - Empresa
  - Status (novo, contatado, qualificado, negociação, convertido, perdido)
  - Tags (múltiplas tags para organização)
  - Observações (campo de texto livre)
- **Validações**:
  - Email válido (regex)
  - Telefone no formato internacional (+55...)
  - Nome com mínimo 2 caracteres
  - Campos sanitizados contra XSS
- **Limites**: Respeita limite do plano (100/1000/10000)

#### Importação em Massa

- **Formato suportado**: CSV, Excel (.xlsx)
- **Colunas reconhecidas**:
  - nome, email, telefone, empresa, status, tags, observações
- **Features**:
  - Preview antes de importar
  - Validação linha por linha
  - Skip de linhas inválidas
  - Relatório de importação (X importados, Y com erro)
  - Preserva tags existentes
- **Limite**: Importações contam para limite total de leads

#### API de Leads

```typescript
// Endpoint: POST /leads
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "phone": "+5511999999999",
  "company": "Empresa XYZ",
  "status": "novo",
  "tags": ["interessado", "quente"],
  "notes": "Lead veio do Google Ads"
}
```

### 📊 Visualização de Leads

#### Tabela de Leads

- **Colunas exibidas**:
  - Nome
  - Email
  - Telefone
  - Empresa
  - Status (badge colorido)
  - Tags (badges)
  - Data de criação
  - Ações (editar, WhatsApp, email, deletar)
- **Features**:
  - Ordenação por coluna (crescente/decrescente)
  - Paginação (10/25/50/100 por página)
  - Seleção múltipla (checkbox)
  - Ações em massa (enviar WhatsApp, deletar)
  - Responsivo (mobile friendly)

#### Filtros Avançados

- **Busca textual**: Nome, email, telefone, empresa
- **Filtro por status**: Todos, Novo, Contatado, Qualificado, etc.
- **Filtro por tags**: Seleção múltipla de tags
- **Filtro por data**: Hoje, Última semana, Último mês, Customizado
- **Filtro por origem**: UTM source, UTM campaign
- **Combinação de filtros**: Todos os filtros funcionam juntos

#### Cards de Leads Recentes

- Exibe últimos 5 leads criados
- Mini card com nome, email, data
- Quick action para WhatsApp
- Link para abrir lead completo

### ✏️ Edição de Leads

- **Interface**: Modal "Editar Lead"
- **Todos os campos editáveis**
- **Histórico de mudanças**: Tracking de quem editou e quando
- **Validações**: Mesmas do cadastro
- **Salvamento otimista**: UI atualiza antes da resposta do servidor

### 🗑️ Exclusão de Leads

- **Confirmação obrigatória**: Dialog de confirmação
- **Exclusão única**: Botão de ação individual
- **Exclusão em massa**: Seleciona múltiplos leads → Deletar
- **Soft delete**: Dados ficam por 30 dias antes de exclusão definitiva (roadmap)

### 📈 Exportação de Leads

- **Formato**: CSV com todas as colunas
- **Filtros aplicados**: Exporta apenas leads filtrados
- **Seleção**: Exporta apenas leads selecionados
- **Encoding**: UTF-8 com BOM para Excel

---

## Sistema de Autenticação

### 🔐 Signup (Cadastro)

- **Campos obrigatórios**:
  - Nome completo
  - Email
  - Senha (mínimo 6 caracteres)
- **Validações**:
  - Email único (não permite duplicados)
  - Senha forte (mínimo 6 chars, recomendado 8+)
  - Nome com mínimo 2 caracteres
- **Processo**:
  1. Usuário preenche formulário
  2. Backend valida e cria conta no Supabase Auth
  3. Backend cria registro de usuário no KV Store
  4. Backend atribui plano GRATUITO automaticamente
  5. Backend retorna access_token e refresh_token
  6. Frontend armazena tokens no localStorage
  7. Frontend redireciona para dashboard
- **Email de confirmação**: Opcional (pode ser desabilitado em dev)

### 🔑 Login

- **Campos**: Email + Senha
- **Features**:
  - "Lembrar-me" (sessão persistente)
  - Validação de credenciais via Supabase Auth
  - Tokens JWT seguros
  - Refresh automático de token
- **Erros tratados**:
  - Email não cadastrado
  - Senha incorreta
  - Conta desativada
  - Muitas tentativas (rate limit)

### 🔄 Reset de Senha

- **Processo**:
  1. Usuário clica em "Esqueci minha senha"
  2. Informa email cadastrado
  3. Backend envia email com link de reset (Supabase Auth)
  4. Usuário clica no link
  5. Informa nova senha
  6. Senha atualizada com sucesso
- **Segurança**:
  - Link expira em 1 hora
  - Link de uso único
  - Senha antiga invalida após reset

### 🚪 Logout

- **Processo**:
  1. Usuário clica em "Sair"
  2. Frontend remove tokens do localStorage
  3. Frontend invalida sessão no Supabase
  4. Frontend redireciona para landing page

### 🔒 Proteção de Rotas

- **Rotas públicas**: `/`, `/login`, `/signup`, `/reset-password`
- **Rotas protegidas**: `/dashboard`, `/settings/*`
- **Middleware**: Verifica token antes de renderizar
- **Redirecionamento**: Se não autenticado → `/login`

---

## Sistema de Planos e Limites

### 💎 Planos Disponíveis

#### 🆓 Gratuito (Free)

**Preço**: $0/mês

**Limites**:
- 100 leads máximo
- 50 mensagens WhatsApp/mês
- 5 envios em massa/mês
- 100 MB armazenamento

**Features incluídas**:
- ✅ Gestão de leads
- ✅ Dashboard com analytics
- ✅ Importação de leads (CSV)
- ✅ Exportação de leads
- ✅ Email marketing
- ✅ Webhooks N8N
- ✅ Meta Pixel e Google Analytics
- ✅ Suporte por email

**Restrições**:
- ❌ Envio limitado de WhatsApp
- ❌ Campanhas em massa limitadas
- ❌ Sem suporte prioritário

---

#### 💼 Business

**Preços**:
- **Mensal**: $20/mês
- **Anual**: $100/ano ($8.33/mês - economia de 58%)

**Limites**:
- 1.000 leads máximo
- 500 mensagens WhatsApp/mês
- 50 envios em massa/mês
- 1 GB armazenamento

**Features incluídas**:
- ✅ Todas as features do Free
- ✅ Suporte prioritário (email)
- ✅ 10x mais leads que Free
- ✅ 10x mais mensagens WhatsApp
- ✅ Relatórios avançados (roadmap)

---

#### 🚀 Enterprise

**Preços**:
- **Mensal**: $59/mês
- **Anual**: $200/ano ($16.67/mês - economia de 72%)

**Limites**:
- 10.000 leads máximo
- 2.000 mensagens WhatsApp/mês
- **Ilimitado** envios em massa
- 10 GB armazenamento

**Features incluídas**:
- ✅ Todas as features do Business
- ✅ Suporte 24/7 (email + chat)
- ✅ 100x mais leads que Free
- ✅ 40x mais mensagens WhatsApp
- ✅ Envios em massa ilimitados
- ✅ API dedicada com rate limits maiores
- ✅ White label (roadmap)
- ✅ Relatórios customizados (roadmap)

---

### 📊 Controle de Limites

#### Verificação Automática

Antes de cada ação, o sistema verifica:

```typescript
// Exemplo: Criar lead
if (currentLeads >= planLimits.maxLeads) {
  showUpgradeModal("Você atingiu o limite de leads do plano Gratuito");
  return;
}

// Exemplo: Enviar WhatsApp
if (monthlyWhatsAppMessages >= planLimits.maxWhatsAppMessages) {
  showUpgradeModal("Você atingiu o limite de mensagens WhatsApp deste mês");
  return;
}
```

#### Widget de Plano

- **Localização**: Sidebar do dashboard
- **Informações exibidas**:
  - Nome do plano atual
  - Leads: X / limite (barra de progresso)
  - Mensagens WhatsApp: X / limite (barra de progresso)
  - Envios em massa: X / limite
- **Cores**:
  - Verde: < 70% do limite
  - Amarelo: 70% - 90% do limite
  - Vermelho: > 90% do limite
- **Ação**: Botão "Upgrade" visível quando próximo do limite

#### Reset Mensal de Limites

- **Data de reset**: Todo dia 1º do mês às 00:00 UTC
- **Limites resetados**:
  - Mensagens WhatsApp
  - Envios em massa
- **Limites que NÃO resetam**:
  - Total de leads (acumulativo)
  - Armazenamento usado

#### Notificações de Limite

- **80% do limite**: Toast amarelo "Você usou 80% do seu limite de leads"
- **95% do limite**: Toast laranja "Quase no limite! Considere fazer upgrade"
- **100% do limite**: Modal "Limite atingido! Faça upgrade para continuar"

---

### 💳 Upgrade de Plano

#### Fluxo de Upgrade

1. **Usuário clica em "Upgrade"** (widget ou modal de limite)
2. **Modal de planos abre** com comparativo Free vs Business vs Enterprise
3. **Usuário seleciona plano** (Business ou Enterprise)
4. **Usuário seleciona ciclo** (Mensal ou Anual)
5. **Redirecionamento para Stripe Checkout**
6. **Usuário preenche dados do cartão**
7. **Pagamento processado**
8. **Webhook Stripe notifica backend**
9. **Backend atualiza plano do usuário**
10. **Frontend detecta mudança** (polling ou realtime)
11. **UI atualiza limites instantaneamente**
12. **Toast de sucesso**: "Bem-vindo ao plano Business! 🎉"

#### Stripe Checkout

- **Modo**: Subscription (recorrência)
- **Campos coletados**:
  - Nome no cartão
  - Número do cartão
  - Validade
  - CVV
  - País de cobrança
- **Métodos aceitos**:
  - Cartão de crédito
  - Cartão de débito
  - PIX (se configurado)
  - Boleto (se configurado)
- **Segurança**: PCI compliant (Stripe gerencia)

#### Webhook Stripe

Backend escuta eventos:

- `checkout.session.completed`: Pagamento inicial confirmado
- `customer.subscription.updated`: Plano alterado
- `customer.subscription.deleted`: Assinatura cancelada
- `invoice.payment_succeeded`: Pagamento recorrente bem-sucedido
- `invoice.payment_failed`: Pagamento falhou

Ações automáticas:
- Atualizar plano do usuário
- Atualizar limites
- Enviar email de confirmação
- Registrar log de transação

---

### 📉 Downgrade e Cancelamento

#### Cancelamento

- **Interface**: Settings → Plano → Cancelar assinatura
- **Confirmação**: Dialog "Tem certeza? Você perderá acesso a X, Y, Z"
- **Processo**:
  1. Usuário confirma cancelamento
  2. Backend cancela subscription no Stripe
  3. Stripe envia webhook `customer.subscription.deleted`
  4. Backend marca plano como "cancelado"
  5. Plano permanece ativo até fim do período pago
  6. Após expiração, usuário volta para plano Free
  7. Dados não são deletados, apenas bloqueados se exceder limites do Free

#### Downgrade Automático

- **Cenário**: Usuário tinha Enterprise, cancelou, período expirou
- **Consequências**:
  - Se tinha 5.000 leads, agora está bloqueado para criar novos (limite Free: 100)
  - Pode ver todos os leads, mas não pode criar/importar novos
  - Mensagens WhatsApp bloqueadas se exceder 50/mês
  - Modal aparece: "Você tem 5.000 leads mas está no plano Free (limite 100). Faça upgrade para continuar usando."

---

## WhatsApp Business

### 🟢 Conexão WhatsApp

#### Evolution API Integration

- **Arquitetura**: Backend se conecta à Evolution API
- **Autenticação**: API Key configurada nas env vars
- **Endpoint**: `POST /whatsapp/connect`

#### Processo de Conexão

1. **Usuário acessa**: Settings → Integrações → WhatsApp
2. **Clica em "Conectar WhatsApp"**
3. **Backend cria instância** no Evolution API
   ```typescript
   POST https://evolution-api.com/instance/create
   {
     "instanceName": "user_${userId}",
     "qrcode": true
   }
   ```
4. **Evolution retorna QR Code** (base64)
5. **Frontend exibe QR Code** no modal
6. **Usuário escaneia** com WhatsApp mobile
7. **Evolution detecta conexão**
8. **Backend salva status**: `whatsapp:${userId}` → `{ status: 'connected', instance: '...' }`
9. **Frontend mostra**: "WhatsApp conectado com sucesso! ✅"
10. **Badge verde** aparece no header

#### Gerenciamento de Conexão

- **Status possíveis**:
  - `disconnected`: Não conectado
  - `pending`: Aguardando scan do QR Code
  - `connected`: Conectado e pronto
  - `error`: Erro na conexão
- **Ações disponíveis**:
  - **Conectar**: Se disconnected
  - **Reconectar**: Se error
  - **Desconectar**: Se connected
  - **Ver status**: Modal com informações da instância

#### Desconexão

1. Usuário clica em "Desconectar"
2. Backend chama Evolution API para deletar instância
3. Backend limpa dados: `del whatsapp:${userId}`
4. Frontend atualiza UI

---

### 💬 Envio de Mensagens WhatsApp

#### Envio Individual

**Interface**: Tabela de leads → Ícone WhatsApp na linha

**Modal de envio**:
- Campo de mensagem (textarea)
- Variáveis disponíveis: `{nome}`, `{empresa}`
- Preview da mensagem
- Botão "Enviar"

**Processo**:
1. Usuário digita mensagem
2. Clica em "Enviar"
3. Frontend valida conexão WhatsApp
4. Frontend verifica limite de mensagens
5. Frontend chama API: `POST /whatsapp/send`
   ```typescript
   {
     "phone": "+5511999999999",
     "message": "Olá João, tudo bem?"
   }
   ```
6. Backend verifica limite novamente
7. Backend chama Evolution API:
   ```typescript
   POST https://evolution-api.com/message/sendText/${instance}
   {
     "number": "+5511999999999",
     "text": "Olá João, tudo bem?"
   }
   ```
8. Backend incrementa contador: `limits:${userId}.whatsappMessages++`
9. Backend registra log: `activity:${userId}:${activityId}`
10. Frontend mostra toast: "Mensagem enviada com sucesso! ✅"

**Variáveis suportadas**:
- `{nome}` → Nome do lead
- `{email}` → Email do lead
- `{telefone}` → Telefone do lead
- `{empresa}` → Empresa do lead

**Exemplo**:
```
Olá {nome}! 👋

Vi que você trabalha na {empresa} e gostaria de conversar sobre...
```

Se torna:
```
Olá João! 👋

Vi que você trabalha na Empresa XYZ e gostaria de conversar sobre...
```

---

#### Envio em Massa

**Interface**: Dashboard → Selecionar leads (checkbox) → "Enviar WhatsApp em Massa"

**Modal de envio em massa**:
- Lista de leads selecionados (apenas com telefone)
- Campo de mensagem
- Variáveis disponíveis
- Preview com exemplo do primeiro lead
- Contador: "X mensagens serão enviadas"
- Warning se exceder limite
- Botão "Enviar para todos"

**Processo**:
1. Usuário seleciona 50 leads
2. Clica em "Enviar WhatsApp em Massa"
3. Modal abre
4. Usuário digita mensagem com variáveis
5. Clica em "Enviar para todos"
6. Frontend valida:
   - WhatsApp conectado?
   - Limite de envios em massa? (5/50/ilimitado)
   - Limite de mensagens mensais?
7. Frontend chama API: `POST /whatsapp/send-mass`
   ```typescript
   {
     "leadIds": ["lead1", "lead2", ...],
     "message": "Olá {nome}..."
   }
   ```
8. Backend valida limites
9. Backend itera sobre cada lead:
   - Substitui variáveis
   - Envia via Evolution API
   - Aguarda 2 segundos (rate limit do WhatsApp)
   - Incrementa contador
10. Backend retorna: `{ sent: 48, failed: 2, errors: [...] }`
11. Frontend mostra toast: "48 mensagens enviadas, 2 falharam"
12. Registra envio em massa: `limits:${userId}.massMessages++`

**Rate Limiting**:
- Delay de 2 segundos entre cada mensagem
- Máximo 20 mensagens por minuto (WhatsApp limit)
- Se exceder, backend aguarda 1 minuto

**Tratamento de Erros**:
- Lead sem telefone: Skip
- Número inválido: Skip
- Falha no envio: Registra erro mas continua
- Relatório final mostra sucessos e falhas

---

### 📊 Tracking de Mensagens

**Logs de atividade**:
```typescript
activity:${userId}:${activityId} → {
  type: 'whatsapp_sent',
  leadId: 'lead123',
  phone: '+5511999999999',
  message: 'Olá João...',
  timestamp: '2024-01-15T10:30:00Z',
  status: 'sent' | 'failed',
  error: null | 'error message'
}
```

**Histórico no lead**:
- Cada lead mostra quantas mensagens WhatsApp foram enviadas
- Link para ver histórico completo
- Datas e conteúdos das mensagens

---

## Email Marketing

### 📧 Envio de Emails

#### Modal de Email Marketing V2

**Acesso**: Dashboard → Ações Rápidas → Email Marketing

**Interface**:
- **Aba 1: Destinatários**
  - Lista de todos os leads com email
  - Checkbox para seleção
  - Filtros (status, tags)
  - Contador: "X leads selecionados"
- **Aba 2: Mensagem**
  - Campo "Assunto"
  - Dropdown "Escolher template" (opcional)
  - Campo "Mensagem" (textarea grande)
  - Variáveis: `{nome}`, `{email}`, `{telefone}`, `{empresa}`
  - Botão "Preview"
- **Aba 3: Revisão**
  - Preview do email com dados do primeiro lead
  - Resumo: X emails serão enviados
  - Botão "Enviar para todos"

#### Templates Prontos

**Template 1: Boas-vindas**
```
Assunto: Bem-vindo(a) à nossa empresa!

Olá {nome},

É um prazer tê-lo(a) conosco! 

Estamos muito felizes em poder atendê-lo(a). Nossa equipe está à disposição para tirar qualquer dúvida.

Entre em contato conosco pelo telefone {telefone} ou responda este email.

Atenciosamente,
Equipe LeadFlow CRM
```

**Template 2: Promoção**
```
Assunto: Promoção Especial para Você!

Olá {nome},

Temos uma promoção especial pensada em você!

🎉 Aproveite condições exclusivas por tempo limitado.

Entre em contato conosco para saber mais:
📧 Email: {email}
📞 Telefone: {telefone}

Não perca essa oportunidade!
```

**Template 3: Follow-up**
```
Assunto: Continuando nossa conversa...

Olá {nome},

Passando aqui para dar continuidade à nossa última conversa.

Gostaria de saber se você teve a oportunidade de avaliar nossa proposta.

Estou à disposição para esclarecer qualquer dúvida!

Responda este email ou me ligue: {telefone}

Abraços!
```

---

#### Processo de Envio

1. **Usuário seleciona leads** (checkbox ou filtro)
2. **Clica em "Email Marketing"**
3. **Modal abre na aba Destinatários**
4. **Confirma seleção** (pode adicionar/remover)
5. **Vai para aba Mensagem**
6. **Escolhe template** (opcional) ou escreve do zero
7. **Preenche assunto e mensagem**
8. **Variáveis são destacadas** em azul
9. **Clica em "Próximo"**
10. **Aba Revisão** mostra preview
11. **Clica em "Enviar para todos"**
12. **Frontend chama API**: `POST /email/send-mass`
    ```typescript
    {
      "leadIds": ["lead1", "lead2", ...],
      "subject": "Assunto aqui",
      "message": "Mensagem com {nome}..."
    }
    ```
13. **Backend valida** configuração SMTP
14. **Backend itera** sobre cada lead:
    - Substitui variáveis
    - Envia via SMTP configurado
    - Aguarda 1 segundo
15. **Backend retorna**: `{ sent: 98, failed: 2 }`
16. **Frontend mostra toast**: "98 emails enviados! ✅"

---

### ⚙️ Configuração SMTP

**Acesso**: Settings → Integrações → SMTP

**Campos**:
- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: seu@email.com
- **Password**: senha-app
- **From Name**: Sua Empresa
- **From Email**: noreply@empresa.com

**Provedores testados**:
- ✅ Gmail (smtp.gmail.com:587)
- ✅ Outlook (smtp.office365.com:587)
- ✅ SendGrid (smtp.sendgrid.net:587)
- ✅ Mailgun (smtp.mailgun.org:587)
- ✅ Amazon SES (email-smtp.us-east-1.amazonaws.com:587)

**Teste de configuração**:
- Botão "Testar configuração"
- Envia email de teste para o email do usuário
- Mostra sucesso ou erro com detalhes

---

## Automação e Webhooks

### 🔗 N8N Webhooks

#### Configuração

**Acesso**: Settings → Integrações → Webhooks N8N

**Campo**: URL do Webhook
- Exemplo: `https://n8n.seudominio.com/webhook/leads`

**Eventos disponíveis**:
- ✅ `novo_lead`: Quando lead é criado
- ✅ `lead_atualizado`: Quando lead é editado
- ✅ `lead_deletado`: Quando lead é deletado
- ✅ `mensagem_whatsapp`: Quando mensagem WhatsApp é enviada
- ✅ `email_enviado`: Quando email é enviado
- ✅ `upgrade_plano`: Quando usuário faz upgrade

#### Payload Enviado

**Evento: novo_lead**
```json
{
  "event": "novo_lead",
  "userId": "user-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "lead-456",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "+5511999999999",
    "company": "Empresa XYZ",
    "status": "novo",
    "tags": ["interessado", "quente"],
    "source": "google-ads",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Evento: mensagem_whatsapp**
```json
{
  "event": "mensagem_whatsapp",
  "userId": "user-123",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "leadId": "lead-456",
    "phone": "+5511999999999",
    "message": "Olá João, tudo bem?",
    "status": "sent"
  }
}
```

#### Casos de Uso N8N

**Exemplo 1: Notificação Slack**
```
Novo Lead → N8N → Slack
"🎉 Novo lead: João Silva (joao@empresa.com) - Status: Novo"
```

**Exemplo 2: Google Sheets**
```
Novo Lead → N8N → Google Sheets
Adiciona linha com dados do lead
```

**Exemplo 3: Email de boas-vindas automático**
```
Novo Lead → N8N → Gmail
Envia email personalizado de boas-vindas
```

**Exemplo 4: CRM externo**
```
Novo Lead → N8N → Salesforce/HubSpot
Sincroniza lead com CRM principal
```

---

### 🤖 Automações Futuras (Roadmap)

- ✅ Zapier integration
- ✅ Make (Integromat) integration
- ✅ API Pública com autenticação
- ✅ Workflows visuais (no-code)

---

## Dashboard e Analytics

### 📊 Cards de Estatísticas

#### Total de Leads
- Número total de leads no sistema
- Comparação com mês anterior (+15%)
- Ícone: Users

#### Novos Hoje
- Leads criados hoje
- Comparação com ontem (+3)
- Ícone: UserPlus

#### Taxa de Conversão
- Leads convertidos / total (%)
- Comparação com mês anterior (+2.5%)
- Ícone: TrendingUp

#### Leads Ativos
- Leads com status != "perdido"
- Comparação com semana passada
- Ícone: Activity

---

### 📈 Gráficos

#### Gráfico de Leads por Período

**Tipo**: Linha (line chart)

**Dados**: Leads criados nos últimos 30 dias (agrupados por dia)

**Eixos**:
- X: Data (01/Jan, 02/Jan, ...)
- Y: Quantidade de leads

**Interatividade**:
- Hover mostra valor exato
- Tooltip com data e quantidade

**Biblioteca**: Recharts

---

#### Gráfico de Distribuição por Status

**Tipo**: Pizza (pie chart)

**Dados**: Quantidade de leads por status

**Segmentos**:
- Novo (azul)
- Contatado (amarelo)
- Qualificado (verde)
- Negociação (laranja)
- Convertido (verde escuro)
- Perdido (vermelho)

**Interatividade**:
- Hover mostra porcentagem
- Clique filtra tabela por status

---

### 🔔 Sistema de Notificações

#### Central de Notificações

**Acesso**: Ícone de sino no header

**Badge**: Número de notificações não lidas

**Modal**: Lista de notificações

**Tipos de notificação**:
1. **Limite atingido**
   - Título: "Limite de leads atingido"
   - Mensagem: "Você atingiu 100/100 leads. Faça upgrade para continuar."
   - Ação: Botão "Fazer Upgrade"
   - Prioridade: Alta (vermelho)

2. **Novo lead**
   - Título: "Novo lead cadastrado"
   - Mensagem: "João Silva foi adicionado aos seus leads"
   - Ação: Link "Ver lead"
   - Prioridade: Normal (azul)

3. **Pagamento confirmado**
   - Título: "Pagamento confirmado"
   - Mensagem: "Bem-vindo ao plano Business! 🎉"
   - Ação: Link "Ver plano"
   - Prioridade: Alta (verde)

4. **Falha no pagamento**
   - Título: "Falha no pagamento"
   - Mensagem: "Não conseguimos processar seu pagamento. Atualize os dados do cartão."
   - Ação: Botão "Atualizar cartão"
   - Prioridade: Crítica (vermelho)

5. **WhatsApp desconectado**
   - Título: "WhatsApp desconectado"
   - Mensagem: "Sua conexão WhatsApp foi perdida. Reconecte para continuar enviando mensagens."
   - Ação: Botão "Reconectar"
   - Prioridade: Alta (amarelo)

---

#### Configurações de Notificações (Admin)

**Acesso**: Settings → Admin → Notificações

**Opções**:
- ✅ Notificar sobre novos leads
- ✅ Notificar quando atingir limite
- ✅ Notificar sobre pagamentos
- ✅ Notificar sobre falhas
- ⬜ Notificar sobre login de novo dispositivo (roadmap)

**Canais**:
- ✅ In-app (central de notificações)
- ⬜ Email (roadmap)
- ⬜ Push notifications (roadmap)

---

## Perfil e Configurações

### 👤 Gestão de Perfil

#### Avatar Upload

**Interface**: Settings → Conta → Avatar

**Features**:
- Upload de imagem (JPG, PNG, GIF)
- Crop e ajuste de tamanho
- Preview antes de salvar
- Armazenamento no Supabase Storage
- URL pública com signed URL
- Fallback para iniciais (ex: "JS" para João Silva)

**Processo**:
1. Usuário clica em "Alterar foto"
2. Seleciona arquivo do computador
3. Modal de crop abre
4. Usuário ajusta posição/zoom
5. Clica em "Salvar"
6. Frontend faz upload para backend
7. Backend salva no Supabase Storage bucket `avatars`
8. Backend retorna URL pública
9. Backend atualiza `user:${userId}.avatarUrl`
10. Frontend atualiza UI

**Validações**:
- Tamanho máximo: 2MB
- Formatos: JPEG, PNG, GIF
- Dimensões recomendadas: 400x400px

---

#### Edição de Dados

**Acesso**: Settings → Conta

**Campos editáveis**:
- Nome completo
- Email (requer revalidação)
- Telefone
- Empresa
- Cargo
- Bio

**Processo de atualização de email**:
1. Usuário altera email
2. Backend envia email de confirmação para novo email
3. Usuário clica no link
4. Email atualizado
5. Notificação enviada para email antigo (segurança)

---

### 🔐 Segurança

**Acesso**: Settings → Segurança

#### Alterar Senha

**Interface**: Formulário com 3 campos
- Senha atual
- Nova senha
- Confirmar nova senha

**Validações**:
- Senha atual correta
- Nova senha >= 6 caracteres
- Confirmação igual à nova senha
- Nova senha != senha atual

**Processo**:
1. Usuário preenche formulário
2. Clica em "Alterar senha"
3. Backend valida senha atual
4. Backend atualiza senha no Supabase Auth
5. Frontend mostra toast: "Senha alterada com sucesso!"
6. Email de notificação enviado

---

#### Sessões Ativas (Roadmap)

- Lista de dispositivos com sessão ativa
- IP, navegador, localização
- Último acesso
- Botão "Encerrar sessão"

---

#### Autenticação de 2 Fatores (Roadmap)

- Suporte a TOTP (Google Authenticator, Authy)
- QR Code para setup
- Códigos de backup

---

## Integrações

### 🔌 Integrações Disponíveis

#### ✅ Google Analytics 4

**Configuração**: Variável de ambiente `VITE_GA_MEASUREMENT_ID`

**Eventos rastreados**:
- `page_view`: Visualizações de página
- `sign_up`: Cadastros
- `login`: Logins
- `create_lead`: Leads criados
- `send_whatsapp`: Mensagens WhatsApp
- `upgrade`: Upgrades de plano

**Componente**: `Analytics.tsx`

---

#### ✅ Meta Pixel (Facebook)

**Configuração**: Variável de ambiente `VITE_META_PIXEL_ID`

**Eventos rastreados**:
- `PageView`: Páginas visitadas
- `Lead`: Lead criado
- `Purchase`: Upgrade de plano (com valor)
- `CompleteRegistration`: Signup completo

**Componente**: `MetaPixel.tsx`

---

#### ✅ Stripe

**Configuração**: 
- Frontend: `VITE_STRIPE_PUBLISHABLE_KEY`
- Backend: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Funcionalidades**:
- Checkout de assinaturas
- Webhooks de pagamento
- Portal do cliente (gerenciar assinatura)

---

#### ✅ Evolution API (WhatsApp)

**Configuração**:
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`

**Funcionalidades**:
- Conexão via QR Code
- Envio de mensagens
- Status de conexão

---

#### ✅ N8N

**Configuração**: URL do webhook no Settings

**Funcionalidades**:
- Webhooks para eventos
- Automação de workflows

---

#### ⬜ Zapier (Roadmap)

#### ⬜ Make/Integromat (Roadmap)

#### ⬜ Slack (Roadmap)

#### ⬜ Telegram (Roadmap)

---

## Interface e UX

### 🎨 Design System

**Cores**:
- Primary: Blue (#3b82f6)
- Secondary: Gray (#6b7280)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Info: Cyan (#06b6d4)

**Typography**:
- Font Family: Inter (Google Fonts)
- Headings: font-bold
- Body: font-normal
- Small: text-sm

**Spacing**: Sistema de 4px (4, 8, 12, 16, 24, 32, 48, 64)

**Radius**: rounded-lg (8px) para cards, rounded-md (6px) para inputs

---

### 📱 Responsividade

**Breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Comportamentos**:
- Sidebar: Hamburguer menu em mobile
- Tabela: Scroll horizontal em mobile
- Cards: Empilhados em mobile
- Modais: Full screen em mobile

---

### ♿ Acessibilidade

- ✅ ARIA labels em todos os interativos
- ✅ Navegação por teclado (Tab, Enter, Esc)
- ✅ Contraste WCAG AA
- ✅ Focus visível
- ✅ Screen reader friendly

---

### 🌙 Dark Mode (Roadmap)

- Toggle no header
- Persistência no localStorage
- Classes Tailwind: `dark:bg-gray-900`

---

## 🎯 Conclusão

LeadsFlow API é um **CRM completo e moderno** com:

✅ **Gestão robusta de leads**  
✅ **Multi-canal** (WhatsApp + Email)  
✅ **Automação poderosa** (N8N)  
✅ **Pagamentos integrados** (Stripe)  
✅ **Analytics completo** (GA + Meta Pixel)  
✅ **Interface moderna** (React + Tailwind)  
✅ **Segurança enterprise** (JWT + RLS)  
✅ **Escalabilidade** (Serverless + PostgreSQL)  

**Pronto para produção. Pronto para escalar. Pronto para revolucionar a gestão de leads.** 🚀

---

Para mais informações, consulte:
- **README.md**: Visão geral e quickstart
- **ARCHITECTURE.md**: Arquitetura técnica detalhada
- **DEPLOYMENT_GUIDE.md**: Guia completo de deploy
- **DEVELOPMENT.md**: Guia para desenvolvedores
- **API.md**: Documentação da API
