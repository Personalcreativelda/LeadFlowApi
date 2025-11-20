# 📝 Changelog - LeadsFlow API

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2024-01-15

### 🎉 Release Inicial

Lançamento da primeira versão completa do LeadsFlow API.

### ✨ Adicionado

#### Autenticação e Usuários
- Sistema completo de autenticação com Supabase (JWT)
- Registro e login de usuários
- Perfil de usuário com avatar
- Upload de avatar do usuário
- Gerenciamento de sessão e tokens

#### Gestão de Leads
- CRUD completo de leads
- Importação em massa via Excel (.xlsx/.xls) com SheetJS
- Exportação para CSV com limites por plano
- Busca e filtros avançados (nome, email, telefone, status, origem)
- Seleção múltipla de leads
- Deleção em massa de leads
- Campos customizáveis (Nome, Email, Telefone, Empresa, Cargo, Origem, Status, Interesse, Observações)
- Status personalizados (Novo, Qualificado, Em Negociação, Fechado, Perdido)
- Rastreamento de origem dos leads
- Sistema de observações e notas por lead
- Marcação de leads para campanhas de email

#### WhatsApp Integration
- Integração completa com Evolution API
- Conexão via QR Code
- Envio individual de mensagens
- Envio em massa de mensagens
- Templates de mensagem personalizáveis com variáveis {{nome}}
- Preview de mensagens antes de enviar
- Histórico de mensagens enviadas
- Contador de mensagens por plano
- Limite automático de mensagens WhatsApp

#### Email Marketing
- Envio individual de emails
- Envio em massa de emails
- Sistema de marcação de leads para campanhas
- Editor de assunto e mensagem
- Visualização de leads selecionados para envio
- Relatórios de envio (enviados/falhas)
- Contador de emails enviados
- Templates com variáveis personalizáveis

#### Webhooks N8N
- Sincronização em tempo real com Google Sheets
- Webhook para cadastrar novos leads
- Webhook para atualizar leads existentes
- Webhook para deletar leads
- Normalização automática de campos
- Mapeamento flexível de colunas
- Auto-refresh a cada 15 segundos
- Botão manual de sincronização
- Suporte para múltiplos formatos de resposta (array, objeto com leads/rows)

#### Sistema de Planos
- Plano Free (100 leads, 50 mensagens WhatsApp, 5 envios em massa)
- Plano Business ($20/mês ou $100/ano)
- Plano Enterprise ($59/mês ou $200/ano)
- Controle automático de limites por plano
- Widget de visualização de limites e uso
- Upgrade/downgrade de planos
- Integração com Stripe para pagamentos
- Sistema de billing mensal e anual

#### Dashboard e Relatórios
- Cards de estatísticas principais
- Gráficos de pizza (origens, status)
- Gráficos de linha (evolução temporal com Recharts)
- Tabela completa com paginação (10 leads por página)
- Seção de leads recentes com ações rápidas
- Filtros por origem, status e busca
- Indicador de trial/dias restantes
- Visualização de leads marcados para email marketing

#### Integrações
- Supabase (Backend e autenticação)
- Stripe (Pagamentos e assinaturas)
- Evolution API (WhatsApp)
- N8N Webhooks (Automação e Google Sheets)
- Meta Pixel (Tracking de eventos Facebook)
- SheetJS (Importação de Excel)

#### Interface e UX
- Tema Dark/Light mode persistente
- Design responsivo (Mobile, Tablet, Desktop)
- Sidebar de navegação retrátil
- Notificações toast com Sonner
- Animações suaves com Motion/Framer Motion
- Componentes UI com ShadCN (40+ componentes)
- Ícones Lucide React
- Loading states e skeletons
- Estados vazios (empty states)
- Confirmações de ações destrutivas

#### Configurações
- Página de configurações de conta
- Página de segurança (senha, 2FA)
- Página de planos e billing
- Página de integrações
- Configuração de preferências de notificações
- Configuração de tema

#### Performance e Otimização
- Build otimizado com Vite
- Code splitting automático
- Lazy loading de componentes
- Cache de assets estáticos
- Compressão Gzip
- Otimização de imagens

#### DevOps
- Dockerfile para containerização
- Docker Compose para deploy local
- Configuração Nginx para produção
- Nixpacks config para Coolify
- Scripts de build e deploy
- Variáveis de ambiente completas

### 🔒 Segurança
- Row Level Security (RLS) no Supabase
- Autenticação JWT
- Proteção CSRF
- Headers de segurança (X-Frame-Options, CSP, etc.)
- Sanitização de inputs
- Rate limiting
- Proteção contra SQL injection

### 📚 Documentação
- README.md completo com todas as funcionalidades
- DEPLOY.md com guia completo de deploy
- DEVELOPMENT.md para desenvolvedores
- API.md com documentação completa da API
- SUPABASE_SCHEMA.sql com schema do banco
- .env.example com todas as variáveis necessárias
- Comentários inline no código

### 🔧 Configuração
- TypeScript configurado
- TailwindCSS 4.0 configurado
- ESLint e Prettier prontos
- VS Code settings recomendadas
- Git hooks (opcional)

---

## [Unreleased]

### 🚀 Próximas Funcionalidades Planejadas

- [ ] Automação de follow-up
- [ ] Templates de mensagens salvos
- [ ] Tags e categorias para leads
- [ ] Funil de vendas visual
- [ ] Integração com Google Calendar
- [ ] Integração com Zapier
- [ ] API pública para desenvolvedores
- [ ] SDK JavaScript
- [ ] Mobile app (React Native)
- [ ] Relatórios avançados em PDF
- [ ] Dashboard analytics avançado
- [ ] Sistema de permissões (equipes)
- [ ] Multi-tenancy
- [ ] Whitelabel

---

## Versionamento

O projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.X): Correções de bugs

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔄 Modificado` - Mudanças em funcionalidades existentes
- `🗑️ Removido` - Funcionalidades removidas
- `🐛 Corrigido` - Correções de bugs
- `🔒 Segurança` - Vulnerabilidades corrigidas
- `📚 Documentação` - Mudanças na documentação
- `⚡ Performance` - Melhorias de performance

---

<div align="center">

**Desenvolvido por PersonalCreativeLda**

[⬆ Voltar ao topo](#-changelog---leadsflow-api)

</div>
