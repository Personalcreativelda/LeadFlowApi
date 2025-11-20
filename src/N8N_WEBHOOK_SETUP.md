# 🔗 Guia de Configuração do Webhook N8N - LeadsFlow API

## 📋 Visão Geral

Este documento explica como configurar e debugar o webhook N8N para sincronização automática de leads do Google Sheets para o LeadsFlow API.

## ✅ Pré-requisitos

1. Conta ativa no N8N (cloud ou self-hosted)
2. Workflow N8N criado com:
   - Webhook de entrada (GET)
   - Integração com Google Sheets
   - Formatação de dados
   - Resposta JSON

## 🛠️ Configuração Passo a Passo

### 1. Criar o Workflow no N8N

#### Estrutura do Workflow:
```
Webhook (GET) → Ler Google Sheets → Formatar Dados → Preparar Resposta → Retornar JSON
```

#### Configuração do Webhook:
- **Método HTTP**: GET
- **Autenticação**: Nenhuma (ou configure conforme necessidade)
- **Path**: `/webhook-listar-leads` (ou qualquer nome único)

### 2. Configurar o Google Sheets

#### Estrutura Esperada da Planilha:
```
| Nome     | Email              | Telefone       | Interesse | Status | Origem        |
|----------|-------------------|----------------|-----------|--------|---------------|
| João     | joao@email.com    | (11) 98765-4321| Produto A | novo   | Google Sheets |
| Maria    | maria@email.com   | (21) 91234-5678| Produto B | novo   | Facebook      |
```

**Colunas obrigatórias:**
- `nome` ou `Nome` ou `name` (OBRIGATÓRIO)
- `email` ou `Email`
- `telefone` ou `Telefone` ou `phone`
- `interesse`
- `status` ou `Status` (padrão: "novo")
- `origem` ou `Origem` ou `source` (padrão: "Google Sheets")

### 3. Formatar a Resposta JSON

O webhook N8N deve retornar um JSON no seguinte formato:

#### Opção 1: Array direto
```json
[
  {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 98765-4321",
    "interesse": "Produto A",
    "status": "novo",
    "origem": "Google Sheets"
  },
  {
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "(21) 91234-5678",
    "interesse": "Produto B",
    "status": "novo",
    "origem": "Facebook"
  }
]
```

#### Opção 2: Objeto com chave "leads"
```json
{
  "leads": [
    {
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "(11) 98765-4321"
    }
  ]
}
```

#### Opção 3: Objeto com chave "data" ou "rows"
```json
{
  "data": [
    { "nome": "João", "email": "joao@email.com" }
  ]
}
```

### 4. Ativar o Workflow

**IMPORTANTE:** O workflow deve estar **ATIVO** e em modo **PRODUCTION** no N8N.

1. Clique em "Activate" no topo do workflow
2. Verifique se o status mostra "Active"
3. Copie a URL do webhook gerada pelo N8N

### 5. Configurar no LeadsFlow API

1. Faça login no LeadsFlow API
2. Vá para **Integrações** no menu lateral
3. Na seção **N8N - Google Sheets**:
   - Cole a URL completa do webhook N8N
   - Clique em "Salvar"
4. A URL será algo como:
   ```
   https://seu-n8n.app.n8n.cloud/webhook/webhook-listar-leads
   ```

### 6. Testar a Sincronização

1. Vá para a página de **Leads** ou **Dashboard**
2. Clique no botão **"Atualizar"** (ícone de refresh)
3. Observe as notificações:
   - 🔄 "Sincronizando leads do N8N..." - Requisição iniciada
   - ✅ "X lead(s) importado(s) do Google Sheets!" - Sucesso
   - ℹ️ "Nenhum lead novo encontrado" - Planilha vazia ou leads já importados

## 🔍 Debugging e Resolução de Problemas

### 1. Verificar Logs do Frontend

Abra o console do navegador (F12) e procure por logs começando com `[N8N Sync]`:

```javascript
[N8N Sync] ====== STARTING SYNC ======
[N8N Sync] Webhook URL: https://...
[N8N Sync] Sending request to backend proxy...
[N8N Sync] Response status: 200 OK
[N8N Sync] Response data: {...}
[N8N Sync] Leads added: 5 Errors: 0
[N8N Sync] ====== SYNC COMPLETED ======
```

### 2. Verificar Logs do Backend

Os logs do backend Supabase mostrarão:

```
[N8N Sync] ====== STARTING N8N SYNC ======
[N8N Sync] User ID: abc-123
[N8N Sync] Webhook URL received: https://...
[N8N Sync] Sending GET request to webhook...
[N8N Sync] ✅ Webhook responded with status: 200
[N8N Sync] Raw response: [{"nome":"João",...}]
[N8N Sync] ✅ JSON parsed successfully
[N8N Sync] Extracted leads count: 5
[N8N Sync] Processing 5 leads...
[N8N Sync] ✅ Lead 1 created: João Silva
```

### 3. Erros Comuns e Soluções

#### ❌ Erro: "Webhook não respondeu em 30 segundos"
**Causa:** Timeout - O webhook N8N está muito lento ou não está respondendo

**Solução:**
- Verifique se o workflow está ATIVO no N8N
- Teste a URL do webhook diretamente no navegador
- Reduza o número de linhas na planilha para teste
- Verifique a conexão com a internet

#### ❌ Erro: "Erro ao conectar com o webhook N8N"
**Causa:** URL incorreta ou workflow inativo

**Solução:**
- Confirme que copiou a URL completa do webhook
- Verifique se o workflow está ativo e em modo production
- Teste a URL no navegador - deve retornar JSON
- Verifique se não há erros no workflow N8N

#### ❌ Erro: "URL do webhook N8N inválida"
**Causa:** URL malformada

**Solução:**
- A URL deve começar com `http://` ou `https://`
- Exemplo correto: `https://n8n.example.com/webhook/listar-leads`
- Exemplo incorreto: `n8n.example.com/webhook/listar-leads`

#### ❌ Erro: "Invalid JSON response from webhook"
**Causa:** O webhook não está retornando JSON válido

**Solução:**
- Adicione um node "Respond to Webhook" no final do workflow
- Configure o Response Mode como "Using 'Respond to Webhook' Node"
- Configure o Response Data como "First Entry JSON"

#### ⚠️ Aviso: "Nenhum lead novo encontrado na planilha"
**Causa:** Planilha vazia ou todos os leads já foram importados

**Solução:**
- Adicione novos leads na planilha do Google Sheets
- Os leads são importados uma única vez (não há duplicação)
- Para reimportar, delete os leads existentes no CRM primeiro

#### ⚠️ Aviso: "Limite de leads atingido"
**Causa:** Você atingiu o limite do seu plano

**Solução:**
- Plano Gratuito: 100 leads máximo
- Plano Business: 1.000 leads máximo  
- Plano Enterprise: Ilimitado
- Faça upgrade do plano para importar mais leads

#### ❌ Erro: "Lead without name, skipping"
**Causa:** Lead na planilha sem nome

**Solução:**
- O campo "nome" é OBRIGATÓRIO
- Verifique se todas as linhas têm nome preenchido
- Leads sem nome são automaticamente ignorados

## 🧪 Testando o Webhook Manualmente

### Teste 1: Verificar se o webhook está ativo

Abra a URL do webhook no navegador:
```
https://seu-n8n.app.n8n.cloud/webhook/webhook-listar-leads
```

**Resposta esperada:**
- Código HTTP: 200 OK
- Conteúdo: JSON com array de leads

### Teste 2: Verificar formato da resposta

Use o curl ou Postman:
```bash
curl -X GET "https://seu-n8n.app.n8n.cloud/webhook/webhook-listar-leads" \
  -H "Accept: application/json"
```

**Verifique:**
- ✅ Resposta é um JSON válido
- ✅ Contém array de leads
- ✅ Cada lead tem pelo menos o campo "nome"

### Teste 3: Verificar no N8N

1. Vá para **Executions** no N8N
2. Verifique as últimas execuções do workflow
3. Clique em uma execução para ver detalhes
4. Verifique se há erros em algum node

## 📊 Exemplo de Workflow N8N Completo

### Node 1: Webhook
- **Name**: Webhook - Listar Leads
- **HTTP Method**: GET
- **Path**: webhook-listar-leads
- **Respond**: Using 'Respond to Webhook' Node

### Node 2: Google Sheets
- **Name**: Ler Todos os Leads
- **Operation**: Read
- **Document**: Selecione sua planilha
- **Sheet**: Selecione a aba com os leads
- **Options**: Header Row = 1, Read All Data = true

### Node 3: Code (Formatação)
```javascript
const items = $input.all();

return items.map(item => ({
  json: {
    nome: item.json.Nome || item.json.nome || '',
    email: item.json.Email || item.json.email || '',
    telefone: item.json.Telefone || item.json.telefone || '',
    interesse: item.json.Interesse || item.json.interesse || '',
    status: item.json.Status || item.json.status || 'novo',
    origem: item.json.Origem || item.json.origem || 'Google Sheets'
  }
}));
```

### Node 4: Respond to Webhook
- **Name**: Resposta - Sucesso
- **Respond With**: JSON
- **Response Data**: All Entries

## 🚀 Dicas de Performance

1. **Limite de Linhas**: Para melhor performance, mantenha a planilha com no máximo 1000 linhas
2. **Cache**: O N8N pode fazer cache das requisições. Desative se necessário
3. **Timeout**: Se sua planilha for muito grande, aumente o timeout no N8N
4. **Webhook Test**: Use a função "Test Workflow" no N8N antes de ativar

## 📞 Suporte

Se você continuar tendo problemas:

1. **Verifique o Console (F12)**: Procure por erros JavaScript
2. **Logs do Backend**: Verifique os logs do Supabase Edge Functions
3. **Logs do N8N**: Veja as execuções no painel do N8N
4. **Teste Manual**: Use curl ou Postman para testar a URL diretamente

## 🔐 Segurança

**Recomendações:**
- Use HTTPS para o webhook N8N
- Considere adicionar autenticação ao webhook
- Não exponha dados sensíveis na URL do webhook
- Use variáveis de ambiente para credenciais

## 📝 Checklist de Configuração

Antes de abrir um ticket de suporte, verifique:

- [ ] Workflow N8N está ATIVO
- [ ] Workflow está em modo PRODUCTION
- [ ] URL do webhook está correta no LeadsFlow
- [ ] Planilha Google Sheets tem dados
- [ ] Coluna "nome" está preenchida em todos os leads
- [ ] Webhook retorna JSON quando acessado no navegador
- [ ] Não há erros nas execuções do N8N
- [ ] Token de acesso está válido no LeadsFlow
- [ ] Não atingiu o limite de leads do plano

---

**Última atualização**: Novembro 2024  
**Versão**: 2.0
