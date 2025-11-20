# 🏗️ Arquitetura Técnica - LeadsFlow API

## Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura de Sistema](#arquitetura-de-sistema)
- [Camada de Frontend](#camada-de-frontend)
- [Camada de Backend](#camada-de-backend)
- [Banco de Dados](#banco-de-dados)
- [Integrações](#integrações)
- [Fluxos de Dados](#fluxos-de-dados)
- [Segurança](#segurança)
- [Performance](#performance)
- [Escalabilidade](#escalabilidade)
- [Monitoramento](#monitoramento)

---

## Visão Geral

LeadsFlow API é uma aplicação SaaS multi-tenant construída com arquitetura moderna serverless, utilizando:

- **Frontend**: React + TypeScript + Vite (SPA)
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **WhatsApp**: Evolution API
- **Automação**: N8N Webhooks

### Princípios de Design

1. **Serverless First**: Sem gerenciamento de servidores
2. **Multi-tenancy**: Isolamento completo de dados por usuário
3. **API-First**: Backend totalmente desacoplado
4. **Real-time**: Atualizações em tempo real onde necessário
5. **Escalável**: Horizontal scaling automático
6. **Seguro**: Autenticação, autorização e criptografia em todas camadas

---

## Stack Tecnológica

### Frontend Stack

```typescript
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.5.3",
  "build": "Vite 5.4.2",
  "styling": "TailwindCSS 4.0",
  "ui": "Shadcn/UI",
  "routing": "React Router 6.26.1",
  "state": "React Hooks + Context",
  "forms": "React Hook Form 7.55.0",
  "charts": "Recharts 2.12.7",
  "http": "Fetch API",
  "notifications": "Sonner 2.0.3"
}
```

### Backend Stack

```typescript
{
  "runtime": "Deno (Supabase Edge Functions)",
  "framework": "Hono",
  "database": "PostgreSQL 15+",
  "auth": "Supabase Auth (JWT)",
  "storage": "Supabase Storage",
  "orm": "SQL direto via kv_store"
}
```

### Infraestrutura

```yaml
Hosting: Railway / Vercel / Netlify / Self-hosted
CDN: Cloudflare (recomendado)
Database: Supabase (PostgreSQL gerenciado)
Edge Functions: Supabase (Deno Deploy)
Monitoring: Supabase Dashboard + Sentry (opcional)
Analytics: Google Analytics 4 + Meta Pixel
```

---

## Arquitetura de Sistema

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │   Browser    │   │    Mobile    │   │   Desktop    │        │
│  │  (Desktop)   │   │   (Future)   │   │  (Future)    │        │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│                     (Static Site - CDN)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             React SPA (Vite Build)                       │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │   │
│  │  │ Pages  │  │ Comps  │  │ Hooks  │  │ Utils  │        │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ REST API + Auth Headers
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                (Supabase Edge Functions)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Hono Web Framework (Deno)                   │   │
│  │                                                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │  Auth   │  │  Leads  │  │WhatsApp │  │ Payment │   │   │
│  │  │ Routes  │  │ Routes  │  │ Routes  │  │ Routes  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  │                                                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │  Email  │  │ Webhook │  │  Admin  │  │ Storage │   │   │
│  │  │ Routes  │  │ Routes  │  │ Routes  │  │ Routes  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ SQL + RPC
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       DATA LAYER                                 │
│                   (Supabase Services)                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │          │
│  │              │  │              │  │              │          │
│  │ kv_store_... │  │  JWT Tokens  │  │   Avatars    │          │
│  │   (KV DB)    │  │   Sessions   │  │   Images     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
│                   (External Services)                            │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Stripe  │  │Evolution │  │   N8N    │  │   SMTP   │        │
│  │   API    │  │   API    │  │ Webhooks │  │  Server  │        │
│  │          │  │          │  │          │  │          │        │
│  │ Payments │  │ WhatsApp │  │Automation│  │  Emails  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Google   │  │   Meta   │                                     │
│  │Analytics │  │  Pixel   │                                     │
│  │          │  │          │                                     │
│  │ Tracking │  │ Tracking │                                     │
│  └──────────┘  └──────────┘                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Camada de Frontend

### Estrutura de Componentes

```
src/
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
│
├── components/
│   ├── auth/                  # Authentication pages
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ResetPasswordPage.tsx
│   │
│   ├── dashboard/             # Dashboard components
│   │   ├── ChartsSection.tsx
│   │   ├── FilterBar.tsx
│   │   ├── LeadsTable.tsx
│   │   ├── MainStatsCards.tsx
│   │   └── ...
│   │
│   ├── modals/                # Modal dialogs
│   │   ├── NovoLeadModal.tsx
│   │   ├── EditarLeadModal.tsx
│   │   ├── MassMessageModal.tsx
│   │   └── ...
│   │
│   ├── navigation/            # Navigation components
│   │   ├── NavigationSidebar.tsx
│   │   ├── AvatarPopover.tsx
│   │   └── RefactoredHeader.tsx
│   │
│   ├── settings/              # Settings pages
│   │   ├── AccountSettingsPage.tsx
│   │   ├── IntegrationsPage.tsx
│   │   ├── PlanPage.tsx
│   │   └── ...
│   │
│   └── ui/                    # Shadcn UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       └── ...
│
├── hooks/                     # Custom React hooks
│   ├── useLeads.ts
│   ├── useLeadsAutoRefresh.ts
│   ├── usePlanValidation.ts
│   └── usePlanoLimites.ts
│
├── utils/                     # Utilities
│   ├── api.ts                 # API client
│   ├── planUtils.ts           # Plan utilities
│   └── supabase/
│       ├── client.ts          # Supabase client
│       └── info.tsx           # Project info
│
└── types/                     # TypeScript types
    ├── types.ts
    └── index.ts
```

### Roteamento

```typescript
// App.tsx routing structure
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    
    {/* Protected routes */}
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
    <Route path="/settings/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
    <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
    <Route path="/settings/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
    <Route path="/settings/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
  </Routes>
</BrowserRouter>
```

### State Management

```typescript
// Context API + Hooks pattern

// 1. Authentication Context
const AuthContext = React.createContext<AuthContextType | null>(null);

// 2. User Data via Hooks
const { leads, loading, error, refetch } = useLeads();

// 3. Plan Limits via Hooks
const { canAddLead, canSendMessage, limites } = usePlanoLimites();

// 4. Auto-refresh Hook
useLeadsAutoRefresh(refetch, intervalMs);
```

### API Communication

```typescript
// utils/api.ts

// Base configuration
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab`;

// API client
export const api = {
  // Auth
  signup: (data) => POST('/auth/signup', data),
  login: (data) => POST('/auth/login', data),
  
  // Leads
  getLeads: () => GET('/leads'),
  createLead: (data) => POST('/leads', data),
  updateLead: (id, data) => PATCH(`/leads/${id}`, data),
  deleteLead: (id) => DELETE(`/leads/${id}`),
  
  // WhatsApp
  connectWhatsApp: () => POST('/whatsapp/connect'),
  sendWhatsApp: (data) => POST('/whatsapp/send', data),
  
  // Payments
  createCheckout: (priceId) => POST('/payments/checkout', { priceId }),
};
```

---

## Camada de Backend

### Edge Functions Structure

```
supabase/functions/server/
├── index.tsx              # Main server entry
├── admin.tsx              # Admin routes
├── paypal.tsx             # PayPal integration
└── kv_store.tsx           # KV database utility (PROTECTED)
```

### Server Setup (index.tsx)

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['https://your-domain.com', 'http://localhost:5173'],
  credentials: true,
}));

app.use('*', logger(console.log));

// Routes
app.get('/make-server-4be966ab/health', (c) => c.json({ status: 'ok' }));

// Auth routes
app.post('/make-server-4be966ab/auth/signup', handleSignup);
app.post('/make-server-4be966ab/auth/login', handleLogin);

// Protected routes (require auth)
app.use('/make-server-4be966ab/leads/*', authMiddleware);
app.get('/make-server-4be966ab/leads', getLeads);
app.post('/make-server-4be966ab/leads', createLead);

// WhatsApp routes
app.post('/make-server-4be966ab/whatsapp/connect', connectWhatsApp);
app.post('/make-server-4be966ab/whatsapp/send', sendWhatsApp);

// Payment routes
app.post('/make-server-4be966ab/payments/checkout', createCheckout);
app.post('/make-server-4be966ab/stripe/webhook', stripeWebhook);

// Start server
Deno.serve(app.fetch);
```

### Authentication Middleware

```typescript
async function authMiddleware(c, next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY')
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  c.set('userId', user.id);
  c.set('user', user);
  
  await next();
}
```

### Route Handlers Pattern

```typescript
// Example: Create Lead
async function createLead(c) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    // Validate plan limits
    const userPlan = await getUserPlan(userId);
    const currentLeadsCount = await getLeadsCount(userId);
    
    if (currentLeadsCount >= userPlan.maxLeads) {
      return c.json({ 
        error: 'Limite de leads atingido',
        currentPlan: userPlan.name,
        limit: userPlan.maxLeads
      }, 403);
    }
    
    // Create lead
    const lead = {
      id: crypto.randomUUID(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`lead:${userId}:${lead.id}`, lead);
    
    // Trigger N8N webhook
    await triggerWebhook(userId, 'novo_lead', lead);
    
    return c.json(lead, 201);
    
  } catch (error) {
    console.error('Error creating lead:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
```

---

## Banco de Dados

### PostgreSQL Schema

```sql
-- KV Store table (key-value pattern)
CREATE TABLE kv_store_4be966ab (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_kv_store_key_prefix ON kv_store_4be966ab(key text_pattern_ops);
CREATE INDEX idx_kv_store_value_gin ON kv_store_4be966ab USING GIN(value);
```

### Data Model (Key Patterns)

```typescript
// Key patterns used in kv_store

// User data
`user:${userId}` → { id, email, name, avatarUrl, plan, createdAt, ... }

// User plan
`plan:${userId}` → { planType, stripeCustomerId, subscriptionId, ... }

// User limits
`limits:${userId}` → { leads: 45, whatsappMessages: 12, massMessages: 2, ... }

// Leads
`lead:${userId}:${leadId}` → { id, name, email, phone, status, tags, ... }

// WhatsApp instance
`whatsapp:${userId}` → { instance, status, qrCode, connectedAt, ... }

// Webhooks config
`webhooks:${userId}` → { n8nUrl, events: ['novo_lead', ...], ... }

// SMTP config
`smtp:${userId}` → { host, port, user, password, ... }

// Notifications
`notification:${userId}:${notificationId}` → { title, message, read, ... }

// Activity log
`activity:${userId}:${activityId}` → { action, timestamp, details, ... }
```

### KV Store Operations

```typescript
// utils/supabase/kv_store.tsx

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// Get single value
export async function get(key: string) {
  const { data } = await supabase
    .from('kv_store_4be966ab')
    .select('value')
    .eq('key', key)
    .single();
  
  return data?.value;
}

// Set value
export async function set(key: string, value: any) {
  await supabase
    .from('kv_store_4be966ab')
    .upsert({ key, value });
}

// Delete value
export async function del(key: string) {
  await supabase
    .from('kv_store_4be966ab')
    .delete()
    .eq('key', key);
}

// Get by prefix (list pattern)
export async function getByPrefix(prefix: string) {
  const { data } = await supabase
    .from('kv_store_4be966ab')
    .select('key, value')
    .like('key', `${prefix}%`);
  
  return data || [];
}

// Multiple get
export async function mget(keys: string[]) {
  const { data } = await supabase
    .from('kv_store_4be966ab')
    .select('value')
    .in('key', keys);
  
  return data?.map(d => d.value) || [];
}

// Multiple set
export async function mset(entries: [string, any][]) {
  const rows = entries.map(([key, value]) => ({ key, value }));
  await supabase.from('kv_store_4be966ab').upsert(rows);
}

// Multiple delete
export async function mdel(keys: string[]) {
  await supabase
    .from('kv_store_4be966ab')
    .delete()
    .in('key', keys);
}
```

---

## Integrações

### Stripe Integration

```typescript
// Checkout flow
async function createCheckoutSession(userId, priceId) {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: 'https://app.com/success',
    cancel_url: 'https://app.com/cancel',
    metadata: {
      userId,
    },
  });
  
  return session.url;
}

// Webhook handler
async function handleStripeWebhook(c) {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancel(event.data.object);
      break;
  }
  
  return c.json({ received: true });
}
```

### Evolution API (WhatsApp)

```typescript
// Connect WhatsApp
async function connectWhatsApp(userId) {
  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
  const apiKey = Deno.env.get('EVOLUTION_API_KEY');
  
  const instanceName = `user_${userId}`;
  
  // Create instance
  const response = await fetch(`${evolutionUrl}/instance/create`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instanceName,
      qrcode: true,
    }),
  });
  
  const data = await response.json();
  
  // Store instance info
  await kv.set(`whatsapp:${userId}`, {
    instance: instanceName,
    status: 'pending',
    qrCode: data.qrcode.base64,
    createdAt: new Date().toISOString(),
  });
  
  return data.qrcode.base64;
}

// Send WhatsApp message
async function sendWhatsAppMessage(userId, phone, message) {
  const whatsappData = await kv.get(`whatsapp:${userId}`);
  
  if (!whatsappData || whatsappData.status !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  
  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
  const apiKey = Deno.env.get('EVOLUTION_API_KEY');
  
  await fetch(`${evolutionUrl}/message/sendText/${whatsappData.instance}`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: phone,
      text: message,
    }),
  });
}
```

### N8N Webhooks

```typescript
// Trigger webhook
async function triggerWebhook(userId, event, data) {
  const webhooksConfig = await kv.get(`webhooks:${userId}`);
  
  if (!webhooksConfig || !webhooksConfig.n8nUrl) {
    return; // No webhook configured
  }
  
  if (!webhooksConfig.events.includes(event)) {
    return; // Event not subscribed
  }
  
  try {
    await fetch(webhooksConfig.n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        userId,
        timestamp: new Date().toISOString(),
        data,
      }),
    });
  } catch (error) {
    console.error('Webhook trigger failed:', error);
  }
}
```

---

## Fluxos de Dados

### 1. Signup Flow

```
User → Frontend → Backend → Supabase Auth → KV Store → Frontend
```

1. User preenche formulário de signup
2. Frontend envia `POST /auth/signup`
3. Backend cria usuário no Supabase Auth
4. Backend cria registro de plano gratuito no KV Store
5. Backend retorna access_token
6. Frontend armazena token e redireciona para dashboard

### 2. Create Lead Flow

```
User → Frontend → Backend → Validate Limits → KV Store → N8N Webhook
```

1. User preenche formulário de novo lead
2. Frontend envia `POST /leads` com token
3. Backend valida autenticação
4. Backend verifica limites do plano
5. Backend salva lead no KV Store
6. Backend dispara webhook N8N (se configurado)
7. Frontend recebe lead criado e atualiza UI

### 3. WhatsApp Message Flow

```
User → Frontend → Backend → Validate Limits → Evolution API → KV Store
```

1. User seleciona lead e digita mensagem
2. Frontend envia `POST /whatsapp/send`
3. Backend valida limites de mensagens
4. Backend chama Evolution API
5. Backend atualiza contador de mensagens
6. Backend registra atividade
7. Frontend mostra confirmação

### 4. Payment Flow

```
User → Stripe Checkout → Stripe → Webhook → Backend → KV Store → Frontend
```

1. User clica em "Upgrade"
2. Frontend chama `POST /payments/checkout`
3. Backend cria Stripe Checkout Session
4. Frontend redireciona para Stripe
5. User completa pagamento
6. Stripe dispara webhook `checkout.session.completed`
7. Backend atualiza plano do usuário
8. Backend atualiza limites
9. Frontend detecta mudança (polling ou realtime)
10. UI atualiza com novo plano

---

## Segurança

### Authentication & Authorization

```typescript
// JWT-based authentication via Supabase Auth

// 1. User signup
const { data: { user, session } } = await supabase.auth.signUp({
  email,
  password,
});

// 2. User login
const { data: { session } } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// 3. Get access token
const accessToken = session.access_token;

// 4. Include in requests
fetch('/api/leads', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// 5. Backend validates token
const { data: { user } } = await supabase.auth.getUser(accessToken);
```

### Row Level Security (RLS)

```sql
-- All KV store data is isolated by key pattern
-- Keys always start with user-specific prefix: `lead:${userId}:...`

-- This ensures:
-- - User A cannot access User B's data
-- - Even if leaked, keys are user-scoped
-- - Database queries are inherently multi-tenant
```

### Input Validation

```typescript
// Example: Validate lead data
function validateLeadData(data) {
  const schema = {
    name: { type: 'string', required: true, maxLength: 100 },
    email: { type: 'email', required: false },
    phone: { type: 'phone', required: false },
    status: { type: 'enum', values: ['novo', 'contatado', 'qualificado', 'perdido'] },
  };
  
  // Validate and sanitize
  const validated = validate(data, schema);
  
  // Sanitize HTML
  validated.name = sanitizeHtml(validated.name);
  
  return validated;
}
```

### Rate Limiting

```typescript
// Simple rate limiting with KV store
async function checkRateLimit(userId, action, maxPerMinute) {
  const key = `ratelimit:${userId}:${action}:${Date.now() / 60000 | 0}`;
  
  const current = await kv.get(key) || 0;
  
  if (current >= maxPerMinute) {
    throw new Error('Rate limit exceeded');
  }
  
  await kv.set(key, current + 1);
  // TTL of 2 minutes
}
```

### CORS Configuration

```typescript
app.use('*', cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:5173', // Dev only
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Performance

### Frontend Optimizations

```typescript
// 1. Code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));

// 2. Memoization
const MemoizedLeadsTable = memo(LeadsTable);

// 3. Debouncing
const debouncedSearch = useMemo(
  () => debounce((query) => performSearch(query), 300),
  []
);

// 4. Virtualization (for large lists)
import { useVirtualizer } from '@tanstack/react-virtual';

// 5. Image optimization
<ImageWithFallback src={url} loading="lazy" />
```

### Backend Optimizations

```typescript
// 1. Batch queries
const leads = await kv.getByPrefix(`lead:${userId}:`);

// 2. Caching
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheKey = `cache:plans`;
let cached = await kv.get(cacheKey);

if (!cached) {
  cached = await fetchPlans();
  await kv.set(cacheKey, cached);
}

// 3. Parallel requests
const [user, plan, limits] = await Promise.all([
  kv.get(`user:${userId}`),
  kv.get(`plan:${userId}`),
  kv.get(`limits:${userId}`),
]);

// 4. Early returns
if (!userId) return c.json({ error: 'Unauthorized' }, 401);
```

### Database Optimizations

```sql
-- Indexes for fast queries
CREATE INDEX idx_kv_store_key_prefix ON kv_store_4be966ab(key text_pattern_ops);
CREATE INDEX idx_kv_store_value_gin ON kv_store_4be966ab USING GIN(value);

-- Query optimization
SELECT value FROM kv_store_4be966ab 
WHERE key LIKE 'lead:user123:%' 
LIMIT 100;
```

---

## Escalabilidade

### Horizontal Scaling

```yaml
# Supabase Edge Functions escalam automaticamente
# Sem configuração necessária

# Frontend (Static):
- CDN distribuído globalmente
- Edge caching
- Auto-scaling de CDN

# Database (Supabase):
- Connection pooling automático
- Read replicas (plano pago)
- Point-in-time recovery
```

### Capacity Planning

```typescript
// Estimativas de capacidade

// Free Plan:
- 100 leads × 1KB = 100KB por usuário
- 1000 usuários = 100MB
- Negligível em PostgreSQL

// Business Plan:
- 1000 leads × 1KB = 1MB por usuário
- 10.000 usuários = 10GB
- Fácil para PostgreSQL

// Enterprise Plan:
- 10.000 leads × 1KB = 10MB por usuário
- 100.000 usuários = 1TB
- Requer otimização e sharding
```

### Monitoring & Alerts

```typescript
// 1. Error tracking (Sentry)
Sentry.init({
  dsn: SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
});

// 2. Performance monitoring
console.time('create-lead');
await createLead(data);
console.timeEnd('create-lead');

// 3. Custom metrics
await track('lead_created', { userId, planType });

// 4. Supabase built-in monitoring
// - Function invocations
// - Error rates
// - Response times
// - Database queries
```

---

## Conclusão

Esta arquitetura foi desenhada para:

✅ **Escalabilidade**: Serverless com auto-scaling  
✅ **Performance**: Otimizações em todas as camadas  
✅ **Segurança**: Auth, isolamento, validação  
✅ **Manutenibilidade**: Código limpo e organizado  
✅ **Custo-efetivo**: Pay-as-you-go sem over-provisioning  

Para deploy e operação, ver:
- **DEPLOY.md**: Guia de deployment
- **API.md**: Documentação completa da API
- **DEVELOPMENT.md**: Guia de desenvolvimento
