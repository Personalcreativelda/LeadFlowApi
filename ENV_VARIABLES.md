# Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

## Variáveis Obrigatórias

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Variáveis Opcionais (Recomendadas)

```env
# Stripe (Pagamentos)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Evolution API (WhatsApp)
VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY=sua-api-key

# Meta Pixel (Tracking)
VITE_META_PIXEL_ID=1234567890

# App Config
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

## Como Obter as Credenciais

### Supabase
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a URL e a chave `anon` `public`

### Stripe
1. Acesse https://dashboard.stripe.com
2. Vá em Developers > API keys
3. Copie a chave pública (começa com `pk_`)

### Evolution API
Configure sua instância da Evolution API e obtenha a URL e API Key.

### Meta Pixel
1. Acesse https://business.facebook.com
2. Vá em Events Manager
3. Selecione seu Pixel
4. Copie o ID do Pixel

