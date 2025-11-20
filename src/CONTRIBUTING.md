# 🤝 Guia de Contribuição - LeadsFlow API

Obrigado por considerar contribuir com o LeadsFlow API! Este documento fornece diretrizes para contribuições.

---

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

---

## 🚀 Como Contribuir

### Reportar Bugs

1. **Verifique** se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/leadsflow-api/issues)
2. **Abra uma nova issue** com:
   - Título claro e descritivo
   - Passos para reproduzir o bug
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (SO, navegador, versão Node)

### Sugerir Funcionalidades

1. **Verifique** se a sugestão já existe
2. **Abra uma issue** com:
   - Descrição clara da funcionalidade
   - Por que seria útil
   - Exemplos de uso
   - Mockups ou sketches (opcional)

### Contribuir com Código

1. **Fork** o repositório
2. **Clone** seu fork:
   ```bash
   git clone https://github.com/seu-usuario/leadsflow-api.git
   cd leadsflow-api
   ```

3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

4. **Faça suas alterações**

5. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adicionar nova funcionalidade"
   ```

6. **Push** para sua branch:
   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request**

---

## 📝 Padrões de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar importação de leads via CSV
fix: corrigir erro ao deletar lead
docs: atualizar README com instruções de deploy
style: formatar código com Prettier
refactor: refatorar componente LeadsTable
test: adicionar testes para API
chore: atualizar dependências
perf: melhorar performance do dashboard
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção
- `perf`: Melhorias de performance

---

## 🎨 Padrões de Código

### TypeScript

- Use tipos explícitos
- Evite `any`
- Prefira interfaces para objetos

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
}

const user: User = { id: '1', name: 'João' };

// ❌ Evitar
const user: any = { id: '1', name: 'João' };
```

### React

- Componentes funcionais com hooks
- Props com TypeScript interfaces
- Naming: PascalCase para componentes

```typescript
interface MyComponentProps {
  title: string;
  onClose: () => void;
}

export default function MyComponent({ title, onClose }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### Tailwind CSS

- Ordem consistente das classes
- Use componentes UI do ShadCN quando possível
- Evite CSS customizado

```tsx
// ✅ Bom
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  Click me
</button>

// ❌ Evitar
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  Click me
</button>
```

---

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes > 70%
- Use nomes descritivos

```typescript
describe('LeadCard', () => {
  it('should render lead name correctly', () => {
    // test implementation
  });
});
```

---

## 📚 Documentação

- Atualize o README.md se necessário
- Documente funções complexas
- Use comentários JSDoc

```typescript
/**
 * Cria um novo lead no sistema
 * @param lead - Dados do lead
 * @returns Promise com o lead criado
 */
async function createLead(lead: Lead): Promise<Lead> {
  // implementation
}
```

---

## 🔍 Code Review

Seu PR será revisado considerando:

- ✅ Código limpo e legível
- ✅ Testes passando
- ✅ Documentação atualizada
- ✅ Sem erros de lint
- ✅ Commits bem formatados
- ✅ Sem conflitos com main

---

## 🎯 Prioridades

Contribuições são bem-vindas em:

### Alta Prioridade
- Correções de bugs críticos
- Melhorias de performance
- Segurança
- Acessibilidade

### Média Prioridade
- Novas funcionalidades
- Melhorias de UX
- Testes
- Documentação

### Baixa Prioridade
- Refatorações
- Otimizações
- Melhorias estéticas

---

## 💬 Comunicação

- **Issues:** Para bugs e sugestões
- **Discussions:** Para perguntas e ideias
- **Email:** contato@personalcreativelda.com

---

## 🏆 Reconhecimento

Contribuidores serão listados no README.md e CHANGELOG.md.

Obrigado por contribuir! 🎉

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

<div align="center">

**Desenvolvido com ❤️ pela comunidade**

[⬆ Voltar ao topo](#-guia-de-contribuição---leadsflow-api)

</div>
