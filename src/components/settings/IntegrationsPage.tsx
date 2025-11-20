import { useState, useEffect } from 'react';
import { Webhook, Mail, MessageSquare, ChevronDown, ChevronUp, Copy, Check, Sheet, BarChart3, Eye, Crown, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { WhatsAppConnection } from '../WhatsAppConnection';

interface IntegrationsPageProps {
  user: any;
}

type IntegrationType = 'webhook' | 'smtp' | 'whatsapp' | 'n8n' | 'meta-pixel' | 'google-analytics' | null;

export default function IntegrationsPage({ user }: IntegrationsPageProps) {
  const [expandedSection, setExpandedSection] = useState<IntegrationType>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [isN8nConfigured, setIsN8nConfigured] = useState(false);
  
  // Meta Pixel & Google Analytics states
  const [metaPixelId, setMetaPixelId] = useState('');
  const [isMetaPixelConfigured, setIsMetaPixelConfigured] = useState(false);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [isGoogleAnalyticsConfigured, setIsGoogleAnalyticsConfigured] = useState(false);
  
  // Chat Webhook state
  const [chatWebhookUrl, setChatWebhookUrl] = useState('');
  const [isChatConfigured, setIsChatConfigured] = useState(false);
  const [chatType, setChatType] = useState<'n8n' | 'typebot'>('n8n');
  
  // Carregar configurações do localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('evolution_api_key');
    if (savedApiKey) {
      setEvolutionApiKey(savedApiKey);
    }
    
    const savedN8nUrl = localStorage.getItem('n8n_webhook_url');
    if (savedN8nUrl) {
      setN8nWebhookUrl(savedN8nUrl);
      setIsN8nConfigured(true);
    }
    
    const savedMetaPixelId = localStorage.getItem('meta_pixel_id');
    if (savedMetaPixelId) {
      setMetaPixelId(savedMetaPixelId);
      setIsMetaPixelConfigured(true);
    }
    
    const savedGoogleAnalyticsId = localStorage.getItem('google_analytics_id');
    if (savedGoogleAnalyticsId) {
      setGoogleAnalyticsId(savedGoogleAnalyticsId);
      setIsGoogleAnalyticsConfigured(true);
    }
    
    const savedChatUrl = localStorage.getItem('chat_webhook_url');
    if (savedChatUrl) {
      setChatWebhookUrl(savedChatUrl);
      setIsChatConfigured(true);
    }
  }, []);
  
  // Verificar se o usuário tem plano Business ou Enterprise
  const userPlan = user?.plan || user?.subscription_plan || 'free';
  const hasHttpAccess = true; // Habilitado para todos os planos
  const hasTrackingAccess = userPlan === 'business' || userPlan === 'enterprise'; // Meta Pixel e Google Analytics apenas Business+
  
  // Debug log
  console.log('IntegrationsPage - User Plan:', userPlan);
  console.log('IntegrationsPage - Has HTTP Access:', hasHttpAccess);
  console.log('IntegrationsPage - Has Tracking Access:', hasTrackingAccess);
  
  // Gerar URL do webhook de entrada para receber leads
  const incomingWebhookUrl = user?.id 
    ? `${window.location.origin}/api/webhook/leads/${user.id}` 
    : '';
    
  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(incomingWebhookUrl);
      setCopiedWebhook(true);
      toast.success('URL copiada para a área de transferência!');
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar URL');
    }
  };

  const handleToggleSection = (section: IntegrationType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSaveWebhook = () => {
    toast.success('Webhook configurado com sucesso!');
  };

  const handleSaveSmtp = () => {
    toast.success('SMTP configurado com sucesso!');
  };

  const handleSaveWhatsApp = () => {
    toast.success('WhatsApp API configurado com sucesso!');
  };

  const handleSaveN8nWebhook = () => {
    if (!n8nWebhookUrl) {
      toast.error('Por favor, insira a URL do webhook N8N');
      return;
    }
    
    // Validar URL
    try {
      new URL(n8nWebhookUrl);
    } catch (e) {
      toast.error('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('n8n_webhook_url', n8nWebhookUrl);
    setIsN8nConfigured(true);
    toast.success('✅ Webhook N8N configurado com sucesso!');
    
    console.log('[N8N Save] URL salva:', n8nWebhookUrl);
  };
  
  const handleClearN8nWebhook = () => {
    localStorage.removeItem('n8n_webhook_url');
    setN8nWebhookUrl('');
    setIsN8nConfigured(false);
    toast.success('🗑️ Configuração do webhook N8N removida');
    console.log('[N8N] Configuration cleared');
  };

  const handleTestN8nWebhook = async () => {
    if (!n8nWebhookUrl) {
      toast.error('Configure o webhook N8N primeiro');
      return;
    }

    toast.info('🔍 Testando conexão com webhook N8N...');
    
    try {
      console.log('[N8N Test] Testing URL:', n8nWebhookUrl);
      
      // Tentar GET primeiro (para listar leads)
      let response = await fetch(n8nWebhookUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('[N8N Test] GET Response status:', response.status);

      // Se GET retornar 404 ou 405, tentar POST
      if (response.status === 404 || response.status === 405) {
        console.log('[N8N Test] GET not supported, trying POST...');
        toast.info('⚠️ Endpoint não suporta GET. Testando com POST...');
        
        // Fazer teste com POST
        response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            test: true,
            action: 'list_all',
            message: 'Teste de conexão LeadsFlow API'
          }),
        });
        
        console.log('[N8N Test] POST Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[N8N Test] POST error:', errorText);
          toast.error(`❌ POST retornou erro: ${response.status} ${response.statusText}`);
          return;
        }
        
        // POST funcionou
        toast.success('✅ Conexão OK! Webhook responde a requisições POST.');
        
        // Tentar parsear a resposta
        try {
          const data = await response.json();
          console.log('[N8N Test] POST response:', data);
          
          // Verificar se há leads na resposta
          const leadsArray = Array.isArray(data) ? data : (data.leads || data.rows || data.data || data.items || []);
          if (Array.isArray(leadsArray) && leadsArray.length > 0) {
            toast.success(`✅ Encontrados ${leadsArray.length} lead(s) na resposta!`);
          }
        } catch (e) {
          console.log('[N8N Test] POST response is not JSON (OK)');
        }
        
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[N8N Test] GET error:', errorText);
        toast.error(`❌ Webhook retornou erro: ${response.status} ${response.statusText}`);
        return;
      }

      // Se GET funcionou, tentar parsear a resposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast.success('✅ Conexão OK! Webhook está respondendo.');
        console.log('[N8N Test] Webhook responding but not JSON');
        return;
      }

      const data = await response.json();
      const leadsArray = Array.isArray(data) ? data : (data.leads || data.rows || data.data || data.items || []);
      
      if (!Array.isArray(leadsArray)) {
        toast.warning('⚠️ Webhook está funcionando, mas formato de resposta não reconhecido.');
        console.log('[N8N Test] Response data:', data);
        return;
      }

      if (leadsArray.length === 0) {
        toast.success('✅ Conexão OK! Webhook está funcionando (nenhum lead encontrado).');
      } else {
        toast.success(`✅ Conexão OK! Encontrados ${leadsArray.length} lead(s) na planilha.`);
      }
      
      console.log('[N8N Test] Sample lead:', leadsArray[0]);
    } catch (error: any) {
      console.error('[N8N Test] Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error('❌ Erro de conexão. Verifique:\n• URL está correta?\n• Workflow está ativo no N8N?\n• CORS está configurado?');
      } else {
        toast.error(`❌ Erro ao conectar: ${error.message}`);
      }
    }
  };

  const handleSaveMetaPixel = () => {
    if (!metaPixelId) {
      toast.error('Por favor, insira o ID do Meta Pixel');
      return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('meta_pixel_id', metaPixelId);
    setIsMetaPixelConfigured(true);
    toast.success('Meta Pixel configurado com sucesso!');
  };

  const handleSaveGoogleAnalytics = () => {
    if (!googleAnalyticsId) {
      toast.error('Por favor, insira o ID do Google Analytics');
      return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('google_analytics_id', googleAnalyticsId);
    setIsGoogleAnalyticsConfigured(true);
    toast.success('Google Analytics configurado com sucesso!');
  };

  const handleSaveChatWebhook = () => {
    if (!chatWebhookUrl) {
      toast.error('Por favor, insira a URL do webhook de chat');
      return;
    }
    
    // Validar URL
    try {
      new URL(chatWebhookUrl);
    } catch (e) {
      toast.error('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('chat_webhook_url', chatWebhookUrl);
    setIsChatConfigured(true);
    toast.success('✅ Webhook de chat configurado com sucesso!');
    
    console.log('[Chat Save] URL salva:', chatWebhookUrl);
  };
  
  const handleClearChatWebhook = () => {
    localStorage.removeItem('chat_webhook_url');
    setChatWebhookUrl('');
    setIsChatConfigured(false);
    toast.success('🗑️ Configuração do webhook de chat removida');
    console.log('[Chat] Configuration cleared');
  };

  const handleTestChatWebhook = async () => {
    if (!chatWebhookUrl) {
      toast.error('Configure o webhook de chat primeiro');
      return;
    }

    toast.info('🔍 Testando conexão com webhook de chat...');
    
    try {
      console.log('[Chat Test] Testing URL:', chatWebhookUrl);
      
      // Tentar GET primeiro (para listar leads)
      let response = await fetch(chatWebhookUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('[Chat Test] GET Response status:', response.status);

      // Se GET retornar 404 ou 405, tentar POST
      if (response.status === 404 || response.status === 405) {
        console.log('[Chat Test] GET not supported, trying POST...');
        toast.info('⚠️ Endpoint não suporta GET. Testando com POST...');
        
        // Fazer teste com POST
        response = await fetch(chatWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            test: true,
            action: 'list_all',
            message: 'Teste de conexão LeadsFlow API'
          }),
        });
        
        console.log('[Chat Test] POST Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('[Chat Test] POST error:', errorText);
          toast.error(`❌ POST retornou erro: ${response.status} ${response.statusText}`);
          return;
        }
        
        // POST funcionou
        toast.success('✅ Conexão OK! Webhook responde a requisições POST.');
        
        // Tentar parsear a resposta
        try {
          const data = await response.json();
          console.log('[Chat Test] POST response:', data);
          
          // Verificar se há leads na resposta
          const leadsArray = Array.isArray(data) ? data : (data.leads || data.rows || data.data || data.items || []);
          if (Array.isArray(leadsArray) && leadsArray.length > 0) {
            toast.success(`✅ Encontrados ${leadsArray.length} lead(s) na resposta!`);
          }
        } catch (e) {
          console.log('[Chat Test] POST response is not JSON (OK)');
        }
        
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[Chat Test] GET error:', errorText);
        toast.error(`❌ Webhook retornou erro: ${response.status} ${response.statusText}`);
        return;
      }

      // Se GET funcionou, tentar parsear a resposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        toast.success('✅ Conexão OK! Webhook está respondendo.');
        console.log('[Chat Test] Webhook responding but not JSON');
        return;
      }

      const data = await response.json();
      const leadsArray = Array.isArray(data) ? data : (data.leads || data.rows || data.data || data.items || []);
      
      if (!Array.isArray(leadsArray)) {
        toast.warning('⚠️ Webhook está funcionando, mas formato de resposta não reconhecido.');
        console.log('[Chat Test] Response data:', data);
        return;
      }

      if (leadsArray.length === 0) {
        toast.success('✅ Conexão OK! Webhook está funcionando (nenhum lead encontrado).');
      } else {
        toast.success(`✅ Conexão OK! Encontrados ${leadsArray.length} lead(s) na planilha.`);
      }
      
      console.log('[Chat Test] Sample lead:', leadsArray[0]);
    } catch (error: any) {
      console.error('[Chat Test] Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error('❌ Erro de conexão. Verifique:\n• URL está correta?\n• Workflow está ativo no N8N?\n• CORS está configurado?');
      } else {
        toast.error(`❌ Erro ao conectar: ${error.message}`);
      }
    }
  };

  const integrations = [
    {
      id: 'n8n' as IntegrationType,
      name: 'Webhooks N8N',
      description: 'Integração com planilha Google Sheets em tempo real',
      icon: Sheet,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      badge: isN8nConfigured ? '✓ Configurado' : null,
    },
    {
      id: 'webhook' as IntegrationType,
      name: 'Webhooks',
      description: 'Receba notificações em tempo real',
      icon: Webhook,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      id: 'smtp' as IntegrationType,
      name: 'SMTP',
      description: 'Configure seu servidor de email',
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      id: 'whatsapp' as IntegrationType,
      name: 'WhatsApp API',
      description: 'Integração com Evolution API',
      icon: MessageSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      id: 'meta-pixel' as IntegrationType,
      name: 'Meta Pixel (Facebook)',
      description: 'Rastreie eventos de conversão de leads no Meta Ads',
      icon: BarChart3,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      badge: isMetaPixelConfigured ? '✓ Configurado' : null,
    },
    {
      id: 'google-analytics' as IntegrationType,
      name: 'Google Analytics',
      description: 'Envie eventos de conversão para o Google Analytics',
      icon: Eye,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      badge: isGoogleAnalyticsConfigured ? '✓ Configurado' : null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Integrações
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure suas integrações e serviços externos
        </p>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isExpanded = expandedSection === integration.id;

          return (
            <div
              key={integration.id}
              className={`bg-white dark:bg-gray-900 rounded-xl border-2 transition-all ${
                isExpanded 
                  ? integration.borderColor 
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {/* Card Header - Clickable */}
              <button
                onClick={() => handleToggleSection(integration.id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-xl"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 ${integration.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${integration.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      {'badge' in integration && integration.badge && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {integration.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-800 pt-6 relative">
                  {/* OVERLAY DE BLOQUEIO para Meta Pixel e Google Analytics no plano FREE */}
                  {!hasTrackingAccess && (integration.id === 'meta-pixel' || integration.id === 'google-analytics') && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-b-xl">
                      <div className="max-w-md mx-auto p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Recurso Premium
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {integration.name} está disponível apenas nos planos <span className="font-semibold text-blue-600 dark:text-blue-400">Business</span> e <span className="font-semibold text-purple-600 dark:text-purple-400">Enterprise</span>.
                        </p>
                        
                        <Button
                          onClick={() => {
                            const event = new CustomEvent('open-upgrade-modal');
                            window.dispatchEvent(event);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Fazer Upgrade
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-2">
                            <p className="font-semibold text-blue-900 dark:text-blue-100">Business</p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold">$20/mês</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded p-2">
                            <p className="font-semibold text-purple-900 dark:text-purple-100">Enterprise</p>
                            <p className="text-purple-600 dark:text-purple-400 font-bold">$59/mês</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook Content */}
                  {integration.id === 'webhook' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-url" className="text-sm">URL do Webhook</Label>
                        <Input
                          id="webhook-url"
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://seu-dominio.com/webhook"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Cole a URL onde deseja receber as notificações via webhook
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSaveWebhook}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Salvar Webhook
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SMTP Content */}
                  {integration.id === 'smtp' && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtp-host" className="text-sm">Host SMTP</Label>
                          <Input
                            id="smtp-host"
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            placeholder="smtp.gmail.com"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-port" className="text-sm">Porta</Label>
                          <Input
                            id="smtp-port"
                            type="text"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(e.target.value)}
                            placeholder="587"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-user" className="text-sm">Usuário</Label>
                          <Input
                            id="smtp-user"
                            type="email"
                            value={smtpUser}
                            onChange={(e) => setSmtpUser(e.target.value)}
                            placeholder="seu@email.com"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-password" className="text-sm">Senha</Label>
                          <Input
                            id="smtp-password"
                            type="password"
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSaveSmtp}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Salvar SMTP
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Content */}
                  {integration.id === 'whatsapp' && (
                    <WhatsAppConnection />
                  )}

                  {/* Meta Pixel Content */}
                  {integration.id === 'meta-pixel' && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                          📊 Rastreie Conversões no Meta Ads
                        </h4>
                        <p className="text-xs text-indigo-800 dark:text-indigo-200 mb-2">
                          Configure o Meta Pixel (Facebook Pixel) para rastrear eventos de conversão quando um lead for marcado como "Convertido" na sua CRM.
                        </p>
                        <p className="text-xs text-indigo-800 dark:text-indigo-200">
                          Evento disparado automaticamente: <code className="bg-white dark:bg-gray-950 px-1.5 py-0.5 rounded text-indigo-900 dark:text-indigo-100 font-semibold">Lead</code>
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="meta-pixel-id" className="text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          Meta Pixel ID
                        </Label>
                        <Input
                          id="meta-pixel-id"
                          type="text"
                          value={metaPixelId}
                          onChange={(e) => setMetaPixelId(e.target.value)}
                          placeholder="123456789012345"
                          className="mt-1.5 font-mono"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Encontre seu Pixel ID no Gerenciador de Eventos do Meta Business Suite
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          ℹ️ Como funciona
                        </h4>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5">
                          <li>• Quando você marcar um lead como "Convertido", o pixel dispara automaticamente</li>
                          <li>• O evento "Lead" é enviado para o Meta com os dados do lead</li>
                          <li>• Você pode ver as conversões no Gerenciador de Anúncios</li>
                          <li>• Otimize suas campanhas com base em conversões reais</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSaveMetaPixel}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Salvar Meta Pixel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Google Analytics Content */}
                  {integration.id === 'google-analytics' && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
                          📈 Rastreie Conversões no Google Analytics
                        </h4>
                        <p className="text-xs text-orange-800 dark:text-orange-200 mb-2">
                          Configure o Google Analytics 4 (GA4) para rastrear eventos de conversão quando um lead for marcado como "Convertido" na sua CRM.
                        </p>
                        <p className="text-xs text-orange-800 dark:text-orange-200">
                          Evento disparado automaticamente: <code className="bg-white dark:bg-gray-950 px-1.5 py-0.5 rounded text-orange-900 dark:text-orange-100 font-semibold">generate_lead</code>
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="google-analytics-id" className="text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          Google Analytics Measurement ID
                        </Label>
                        <Input
                          id="google-analytics-id"
                          type="text"
                          value={googleAnalyticsId}
                          onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="mt-1.5 font-mono"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Encontre seu Measurement ID no Google Analytics (Admin → Data Streams)
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          ℹ️ Como funciona
                        </h4>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5">
                          <li>• Quando você marcar um lead como "Convertido", o evento é disparado automaticamente</li>
                          <li>• O evento "generate_lead" é enviado para o GA4 com os dados do lead</li>
                          <li>• Você pode ver as conversões em Relatórios → Eventos no GA4</li>
                          <li>• Configure o evento como conversão no GA4 para otimizar suas campanhas</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSaveGoogleAnalytics}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Salvar Google Analytics
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* N8N Content */}
                  {integration.id === 'n8n' && (
                    <div className="space-y-4">
                      {/* Info Box */}
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mb-2 flex items-center gap-2">
                          <Sheet className="w-4 h-4" />
                          Configure as URLs dos webhooks do N8N para integração com sua planilha Google Sheets.
                        </h4>
                        <p className="text-xs text-cyan-800 dark:text-cyan-200">
                          As URLs devem ter o formato: <code className="bg-white dark:bg-gray-950 px-1.5 py-0.5 rounded text-cyan-900 dark:text-cyan-100">https://seu-n8n.com/webhook/nome</code>
                        </p>
                      </div>

                      {/* Webhook - Cadastrar Novo Lead */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label htmlFor="n8n-webhook-url" className="text-sm flex items-center gap-2">
                            <Webhook className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            Webhook - Cadastrar Novo Lead
                          </Label>
                          {isN8nConfigured && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              ✓ Configurado
                            </span>
                          )}
                        </div>
                        
                        {/* Mostrar URL salva se houver */}
                        {isN8nConfigured && n8nWebhookUrl && (
                          <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                            <p className="text-xs text-green-800 dark:text-green-200 break-all">
                              <strong>URL atual:</strong> {n8nWebhookUrl}
                            </p>
                          </div>
                        )}
                        
                        <Input
                          id="n8n-webhook-url"
                          type="url"
                          value={n8nWebhookUrl}
                          onChange={(e) => setN8nWebhookUrl(e.target.value)}
                          placeholder="https://seu-n8n.com/webhook/listar-leads"
                          className="mt-1.5 font-mono text-xs"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Endpoint GET/POST para listar ou criar leads na planilha
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={handleSaveN8nWebhook}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          💾 Salvar
                        </Button>
                        {isN8nConfigured && (
                          <Button
                            onClick={handleClearN8nWebhook}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            🗑️ Limpar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}