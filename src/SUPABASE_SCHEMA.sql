-- ========================================
-- LEADSFLOW API - SUPABASE DATABASE SCHEMA
-- ========================================
-- Este arquivo contém todo o schema necessário
-- para configurar o banco de dados no Supabase
-- ========================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse seu projeto Supabase
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)
--
-- ========================================

-- ========================================
-- 1. ENABLE EXTENSIONS
-- ========================================

-- UUID extension (para IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. CREATE TABLES
-- ========================================

-- ========================================
-- 2.1 Tabela: users_profiles
-- ========================================
-- Perfis de usuários (complementa auth.users)

CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    company TEXT,
    
    -- Plano e assinatura
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'business', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    subscription_id TEXT, -- Stripe subscription ID
    customer_id TEXT, -- Stripe customer ID
    
    -- Trial (removido - agora vai direto para free)
    is_trial BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMPTZ,
    
    -- Limites do plano
    limits JSONB DEFAULT '{
        "leads": 100,
        "messages": 50,
        "massMessages": 5
    }'::jsonb,
    
    -- Uso atual
    usage JSONB DEFAULT '{
        "leads": 0,
        "messages": 0,
        "massMessages": 0
    }'::jsonb,
    
    -- Configurações
    settings JSONB DEFAULT '{
        "notifications": true,
        "emailMarketing": true,
        "theme": "light"
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_users_profiles_email ON public.users_profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_profiles_plan ON public.users_profiles(plan);

-- ========================================
-- 2.2 Tabela: leads
-- ========================================
-- Armazenamento de leads

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    
    -- Informações básicas do lead
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    
    -- Informações de rastreamento
    origem TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'novo',
    interesse TEXT,
    
    -- Dados adicionais
    observacoes TEXT,
    agente_atual TEXT,
    
    -- Flags
    marcado_email BOOLEAN DEFAULT false,
    
    -- Metadata
    data TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON public.leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_data ON public.leads(data DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email) WHERE email IS NOT NULL;

-- ========================================
-- 2.3 Tabela: whatsapp_connections
-- ========================================
-- Conexões WhatsApp via Evolution API

CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    
    -- Dados da conexão
    instance_name TEXT NOT NULL,
    instance_id TEXT,
    qr_code TEXT,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
    
    -- Metadata
    phone_number TEXT,
    last_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, instance_name)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_user_id ON public.whatsapp_connections(user_id);

-- ========================================
-- 2.4 Tabela: message_history
-- ========================================
-- Histórico de mensagens enviadas

CREATE TABLE IF NOT EXISTS public.message_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    
    -- Tipo de mensagem
    type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
    
    -- Dados da mensagem
    recipient TEXT NOT NULL,
    subject TEXT, -- Para emails
    message TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    is_mass_message BOOLEAN DEFAULT false,
    
    -- Metadata
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_message_history_user_id ON public.message_history(user_id);
CREATE INDEX IF NOT EXISTS idx_message_history_lead_id ON public.message_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_message_history_type ON public.message_history(type);
CREATE INDEX IF NOT EXISTS idx_message_history_sent_at ON public.message_history(sent_at DESC);

-- ========================================
-- 2.5 Tabela: activities
-- ========================================
-- Log de atividades do usuário

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    
    -- Tipo de atividade
    activity_type TEXT NOT NULL,
    
    -- Descrição
    description TEXT NOT NULL,
    
    -- Metadata adicional
    metadata JSONB,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- ========================================
-- 2.6 Tabela: integrations
-- ========================================
-- Configurações de integrações

CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    
    -- Tipo de integração
    integration_type TEXT NOT NULL,
    
    -- Configurações (chaves API, webhooks, etc.)
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, integration_type)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);

-- ========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3.1 RLS Policies: users_profiles
-- ========================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON public.users_profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON public.users_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Permitir inserção no signup
CREATE POLICY "Users can insert own profile"
    ON public.users_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ========================================
-- 3.2 RLS Policies: leads
-- ========================================

-- Usuários podem ver apenas seus próprios leads
CREATE POLICY "Users can view own leads"
    ON public.leads FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios leads
CREATE POLICY "Users can insert own leads"
    ON public.leads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios leads
CREATE POLICY "Users can update own leads"
    ON public.leads FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios leads
CREATE POLICY "Users can delete own leads"
    ON public.leads FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- 3.3 RLS Policies: whatsapp_connections
-- ========================================

CREATE POLICY "Users can manage own WhatsApp connections"
    ON public.whatsapp_connections FOR ALL
    USING (auth.uid() = user_id);

-- ========================================
-- 3.4 RLS Policies: message_history
-- ========================================

CREATE POLICY "Users can view own message history"
    ON public.message_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
    ON public.message_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 3.5 RLS Policies: activities
-- ========================================

CREATE POLICY "Users can view own activities"
    ON public.activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
    ON public.activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 3.6 RLS Policies: integrations
-- ========================================

CREATE POLICY "Users can manage own integrations"
    ON public.integrations FOR ALL
    USING (auth.uid() = user_id);

-- ========================================
-- 4. FUNCTIONS
-- ========================================

-- ========================================
-- 4.1 Function: Update updated_at timestamp
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. TRIGGERS
-- ========================================

-- Trigger para users_profiles
DROP TRIGGER IF EXISTS update_users_profiles_updated_at ON public.users_profiles;
CREATE TRIGGER update_users_profiles_updated_at
    BEFORE UPDATE ON public.users_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para leads
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para whatsapp_connections
DROP TRIGGER IF EXISTS update_whatsapp_updated_at ON public.whatsapp_connections;
CREATE TRIGGER update_whatsapp_updated_at
    BEFORE UPDATE ON public.whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para integrations
DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. INITIAL DATA (OPCIONAL)
-- ========================================

-- Você pode inserir dados iniciais aqui se necessário
-- Por exemplo, templates de mensagens, etc.

-- ========================================
-- 7. GRANTS (PERMISSÕES)
-- ========================================

-- Garantir que authenticated users possam acessar as tabelas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================
-- 
-- Próximos passos:
-- 1. Verifique se todas as tabelas foram criadas
-- 2. Teste a criação de um usuário
-- 3. Teste a inserção de leads
-- 4. Configure o Storage para avatars (se necessário)
--
-- ========================================

-- Verificar tabelas criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
