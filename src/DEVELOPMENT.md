# 🔧 Guia de Desenvolvimento - LeadsFlow API

Documentação completa para desenvolvedores que desejam contribuir ou customizar o LeadsFlow API.

---

## 📋 Índice

- [Setup do Ambiente](#-setup-do-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Padrões de Código](#-padrões-de-código)
- [Componentes](#-componentes)
- [API e Estado](#-api-e-estado)
- [Testes](#-testes)
- [Build e Deploy](#-build-e-deploy)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Setup do Ambiente

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ (vem com Node.js)
- **Git** ([Download](https://git-scm.com))
- **VS Code** (recomendado) com extensões:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/leadsflow-api.git
cd leadsflow-api

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Execute em modo desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

---

## 📁 Estrutura do Projeto

```
leadsflow-api/
├── public/                 # Arquivos estáticos
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── components/         # Componentes React
│   │   ├── dashboard/      # Dashboard específicos
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── ChartsSection.tsx
│   │   │   ├── RecentLeadsSection.tsx
│   │   │   ├── PlanoWidget.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── MainStatsCards.tsx
│   │   │
│   │   ├── modals/         # Componentes de modal
│   │   │   ├── NovoLeadModal.tsx
│   │   │   ├── EditarLeadModal.tsx
│   │   │   ├── ChatModal.tsx
│   │   │   ├── MassMessageModal.tsx
│   │   │   ├── ImportarLeadsModal.tsx
│   │   │   ├── EmailMarketingModalV2.tsx
│   │   │   ├── EnviarEmailModal.tsx
│   │   │   ├── UpgradeModal.tsx
│   │   │   └── BackendStatusModal.tsx
│   │   │
│   │   ├── navigation/     # Navegação
│   │   │   ├── NavigationSidebar.tsx
│   │   │   └── RefactoredHeader.tsx
│   │   │
│   │   ├── settings/       # Páginas de configurações
│   │   │   ├── AccountSettingsPage.tsx
│   │   │   ├── IntegrationSettings.tsx
│   │   │   ├── PlanPage.tsx
│   │   │   ├── SecurityPage.tsx
│   │   │   └── CampaignsPage.tsx
│   │   │
│   │   ├── ui/             # Componentes UI (ShadCN)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (40+ componentes)
│   │   │
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── Landing.tsx     # Landing page
│   │   ├── Login.tsx       # Página de login
│   │   └── SendMessageModal.tsx
│   │
│   ├── hooks/              # Custom React Hooks
│   │   └── useLeadsAutoRefresh.ts
│   │
│   ├── utils/              # Utilitários
│   │   ├── api.ts          # Cliente API
│   │   ├── planUtils.ts    # Lógica de planos
│   │   └── supabase/       # Configuração Supabase
│   │       ├── client.ts
│   │       └── info.ts
│   │
│   ├── styles/             # Estilos globais
│   │   └── globals.css     # Tailwind + custom CSS
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx             # Componente raiz
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite types
│
├── .env.example            # Template de variáveis
├── .gitignore
├── index.html              # HTML template
├── package.json            # Dependências
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind config
├── vite.config.ts          # Vite config
├── nginx.conf              # Nginx config (produção)
├── Dockerfile              # Docker config
├── docker-compose.yml      # Docker Compose
└── README.md               # Documentação
```

---

## 📐 Padrões de Código

### TypeScript

**Sempre use tipos explícitos:**

```typescript
// ❌ Evitar
const user = getCurrentUser();

// ✅ Preferir
const user: User = getCurrentUser();
```

**Interfaces para props:**

```typescript
interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => Promise<void>;
}
```

### Componentes React

**Estrutura padrão:**

```typescript
import { useState } from 'react';
import type { Lead } from '../../types';

interface MyComponentProps {
  // Props aqui
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. Hooks de estado
  const [state, setState] = useState();

  // 2. Hooks de efeito
  useEffect(() => {
    // ...
  }, []);

  // 3. Funções handlers
  const handleClick = () => {
    // ...
  };

  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Naming Conventions

```typescript
// Componentes: PascalCase
function LeadCard() {}

// Funções: camelCase
function handleSubmit() {}

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = '...';

// Interfaces: PascalCase com I (opcional)
interface User {}
interface IUserProfile {}

// Types: PascalCase
type LeadStatus = 'novo' | 'qualificado' | 'convertido';
```

### Tailwind CSS

**Ordem das classes:**

1. Layout (flex, grid, etc.)
2. Sizing (w-, h-, etc.)
3. Spacing (p-, m-, etc.)
4. Typography (text-, font-, etc.)
5. Colors (bg-, text-, border-)
6. Effects (shadow-, opacity-, etc.)
7. States (hover:, focus:, dark:)

```tsx
<button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
  Click me
</button>
```

---

## 🧩 Componentes

### Criando Novo Componente

```bash
# 1. Criar arquivo
touch src/components/MinhaFeature.tsx

# 2. Template básico
import { useState } from 'react';

interface MinhaFeatureProps {
  // props
}

export default function MinhaFeature(props: MinhaFeatureProps) {
  return (
    <div className="p-4">
      {/* conteúdo */}
    </div>
  );
}

# 3. Importar no Dashboard ou outra página
import MinhaFeature from './components/MinhaFeature';
```

### Componentes ShadCN

Já temos 40+ componentes ShadCN instalados em `/components/ui/`.

**Usar componente existente:**

```tsx
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Dialog } from './components/ui/dialog';

<Button variant="default" size="lg">
  Click me
</Button>
```

**Não crie versões customizadas dos componentes UI.** Use os existentes e customize via props e classes Tailwind.

---

## 🔌 API e Estado

### Cliente API

Todas as chamadas API são centralizadas em `src/utils/api.ts`:

```typescript
import { leadsApi } from '../utils/api';

// GET all leads
const { success, leads } = await leadsApi.getAll();

// CREATE lead
const { success, lead } = await leadsApi.create({
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '+5511999999999'
});

// UPDATE lead
const { success, lead } = await leadsApi.update(leadId, {
  status: 'convertido'
});

// DELETE lead
const { success } = await leadsApi.delete(leadId);
```

### Estado Global

O estado é gerenciado via props drilling (não usamos Redux/Context).

**Fluxo de dados:**

```
App.tsx (user state)
  ↓
Dashboard.tsx (leads state)
  ↓
LeadsTable.tsx (exibe leads)
```

**Atualizar estado do usuário:**

```typescript
// No Dashboard.tsx
const handleUpdateUser = (updatedUser: User) => {
  onUserUpdate(updatedUser); // Propaga para App.tsx
};
```

### localStorage

Usado para persistir dados locais:

```typescript
// Salvar
localStorage.setItem('n8n_webhook_url', url);

// Recuperar
const url = localStorage.getItem('n8n_webhook_url');

// Remover
localStorage.removeItem('n8n_webhook_url');
```

**Keys usadas:**

- `leadflow_access_token` - Token JWT
- `leadflow_refresh_token` - Refresh token
- `crm_tema` - Tema (dark/light)
- `n8n_webhook_url` - Webhook N8N
- `evolution_api_url` - URL Evolution API
- `evolution_api_key` - Key Evolution API

---

## 🧪 Testes

### Setup de Testes (Opcional)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LeadCard from './LeadCard';

describe('LeadCard', () => {
  it('should render lead name', () => {
    const lead = { nome: 'João', email: 'joao@email.com' };
    render(<LeadCard lead={lead} />);
    expect(screen.getByText('João')).toBeInTheDocument();
  });
});
```

---

## 🏗️ Build e Deploy

### Build Local

```bash
# Build para produção
npm run build

# Verificar tamanho do bundle
ls -lh dist/

# Preview
npm run preview
```

### Otimizações

**Lazy loading:**

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**Code splitting:**

Vite faz automaticamente, mas você pode otimizar:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['./src/components/ui'],
        }
      }
    }
  }
})
```

---

## 🐛 Troubleshooting

### Erro: "Module not found"

```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Erro: Build falha

```bash
# Verificar erros TypeScript
npm run type-check

# Build com logs detalhados
npm run build -- --debug
```

### Hot Reload não funciona

```bash
# Reiniciar servidor de dev
# Ctrl+C
npm run dev
```

### Variáveis de ambiente não funcionam

- ✅ Certifique-se de que começam com `VITE_`
- ✅ Reinicie o servidor após alterar `.env`
- ✅ No build, as variáveis são injetadas estaticamente

---

## 📚 Recursos Úteis

### Documentação

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs)

### Ferramentas

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)

---

## 🤝 Contribuindo

### Fluxo de Trabalho

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie uma branch:** `git checkout -b feature/minha-feature`
4. **Faça suas alterações**
5. **Commit:** `git commit -m "feat: adicionar nova funcionalidade"`
6. **Push:** `git push origin feature/minha-feature`
7. **Abra um Pull Request**

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar importação de leads via CSV
fix: corrigir erro ao deletar lead
docs: atualizar README
style: formatar código
refactor: refatorar componente LeadsTable
test: adicionar testes para LeadCard
chore: atualizar dependências
```

---

## 📞 Suporte

Dúvidas sobre desenvolvimento?

- 📧 Email: dev@personalcreativelda.com
- 💬 Discord: [Link do Discord]
- 📖 Wiki: [GitHub Wiki]

---

<div align="center">

**Happy Coding! 🚀**

[⬆ Voltar ao topo](#-guia-de-desenvolvimento---leadsflow-api)

</div>
