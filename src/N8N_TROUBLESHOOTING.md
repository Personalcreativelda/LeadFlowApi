# 🔧 Troubleshooting N8N - LeadsFlow API

## ❌ Erro: "Invalid JSON response from webhook" ou "Empty response from webhook"

Este erro ocorre quando o webhook N8N não está retornando dados no formato correto.

### 🎯 Causas Comuns

#### 1. **Falta o node "Respond to Webhook"**
   - **Problema**: Seu workflow N8N não tem um node para responder ao webhook
   - **Solução**: Adicione um node "Respond to Webhook" no final do seu workflow
   
   ```
   Webhook → Google Sheets → [Processamento] → Respond to Webhook
   ```

#### 2. **Workflow retorna resposta vazia**
   - **Problema**: O node "Respond to Webhook" não está configurado para retornar dados
   - **Solução**: Configure o node para retornar os dados:
     - Vá em "Respond to Webhook"
     - Em "Response Body", selecione os dados que você quer retornar
     - Certifique-se de que está retornando um array de objetos

#### 3. **Formato de resposta incorreto**
   - **Problema**: O webhook está retornando dados em formato não-JSON ou HTML
   - **Solução**: 
     - Abra o console do navegador (F12)
     - Clique em "Atualizar" na tabela de leads
     - Veja o log `[N8N Sync] Raw response preview:` para ver o que está sendo retornado
     - O N8N deve retornar JSON, não HTML ou texto puro

#### 4. **Workflow não está ativo**
   - **Problema**: O workflow no N8N está desativado
   - **Solução**: 
     - Abra o N8N
     - Ative o workflow (toggle no canto superior direito)
     - Teste novamente

### 🔍 Como Debugar

1. **Verificar logs do navegador (F12)**:
   ```javascript
   // Você verá logs assim:
   [N8N Sync] Response Content-Type: application/json
   [N8N Sync] Raw response length: 0  // ⚠️ Se for 0, está vazio!
   [N8N Sync] Raw response preview: ...
   ```

2. **Testar o webhook manualmente**:
   ```bash
   # GET request
   curl -X GET "https://seu-n8n.com/webhook/seu-webhook"
   
   # POST request
   curl -X POST "https://seu-n8n.com/webhook/seu-webhook" \
     -H "Content-Type: application/json" \
     -d '{"action": "list_all"}'
   ```

3. **Verificar logs do N8N**:
   - Abra o N8N
   - Vá em "Executions" para ver as execuções do workflow
   - Veja se há erros ou se o workflow está executando corretamente

### ✅ Configuração Correta do N8N

Seu workflow N8N deve seguir este padrão:

```
1. Webhook (Trigger)
   └─ Method: GET e/ou POST
   └─ Path: /webhook/seu-nome
   
2. Google Sheets (Ler dados)
   └─ Operation: Read
   └─ Sheet: Sua planilha
   
3. [Opcional] Processamento de dados
   └─ Code, Set, etc.
   
4. Respond to Webhook (Obrigatório!)
   └─ Response Mode: Using Fields Below
   └─ Response Body: {{ $json }}
   └─ Content-Type: application/json
```

### 📊 Formato de Resposta Esperado

O webhook N8N deve retornar um array de objetos JSON:

```json
[
  {
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "+5511999999999",
    "interesse": "Produto A",
    "origem": "Google Sheets"
  },
  {
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "telefone": "+5511888888888",
    "interesse": "Produto B",
    "origem": "Google Sheets"
  }
]
```

Ou um objeto com propriedade `leads`, `rows`, `data` ou `items`:

```json
{
  "leads": [
    { "nome": "João", "email": "joao@example.com" }
  ]
}
```

### 🆘 Ainda com Problemas?

1. **Verifique a URL do webhook**:
   - A URL deve começar com `https://`
   - A URL deve estar correta (copie diretamente do N8N)
   - Teste a URL no navegador ou com `curl`

2. **Verifique permissões**:
   - O webhook do N8N está público?
   - Há algum firewall ou VPN bloqueando?

3. **Verifique o Content-Type**:
   - O N8N deve retornar `Content-Type: application/json`
   - Se retornar `text/html`, há algo errado na configuração

4. **Logs detalhados**:
   - Abra o console (F12)
   - Filtre por "N8N Sync"
   - Veja todos os logs detalhados da requisição

### 💡 Dicas Importantes

- ✅ Sempre use o node "Respond to Webhook"
- ✅ Retorne dados em formato JSON
- ✅ Teste o webhook manualmente antes de integrar
- ✅ Mantenha o workflow ativo no N8N
- ✅ Verifique os logs do N8N para erros

### 📞 Suporte

Se ainda estiver com problemas:
1. Verifique os logs completos no console (F12)
2. Copie o erro completo
3. Verifique o formato da resposta do webhook
4. Entre em contato com o suporte técnico com essas informações

---

**Última atualização**: 2024
**LeadsFlow API** - Sistema de Gestão de Leads
