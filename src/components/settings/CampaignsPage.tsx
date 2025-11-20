import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Zap, Send, Plus, Users, Webhook, CheckCircle, XCircle, Clock, Phone, AtSign, ChevronDown, Sparkles, PlayCircle, Lock, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface CampaignsPageProps {
  onNovoLead?: () => void;
  onEmailMarketing?: () => void;
  onMassMessage?: () => void;
  leads?: any[];
  userPlan?: string;
  user?: any;
  onUserUpdate?: (updatedUser: any) => void;
}

type CampaignType = 'whatsapp' | 'email' | 'automation';

// Templates prontos de mensagens
const messageTemplates = {
  saudacao: `Olá {nome}! 👋

Espero que esteja bem! Somos da LeadsFlow e gostaríamos de conversar com você.`,
  
  promocao: `Olá {nome}! 🎁

Temos uma oferta especial esta semana!

Gostaria de conhecer os detalhes?`,
  
  agradecimento: `Olá {nome}! 🙏

Muito obrigado pelo seu interesse! Estamos à disposição para qualquer dúvida.`,
  
  followup: `Olá {nome}! 📞

Estou entrando em contato novamente para saber se teve a oportunidade de analisar nossa proposta.

Fico no aguardo!`
};

export default function CampaignsPage({ 
  onNovoLead, 
  onEmailMarketing, 
  onMassMessage, 
  leads = [],
  userPlan = 'free',
  user,
  onUserUpdate
}: CampaignsPageProps) {
  const [selectedCampaignType, setSelectedCampaignType] = useState<CampaignType>('whatsapp');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [n8nMessage, setN8nMessage] = useState('');
  const [delay, setDelay] = useState('3000');
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [sendingStats, setSendingStats] = useState({ sent: 0, failed: 0, remaining: 0 });
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0); // Força re-render dos cards de usage
  
  // WhatsApp connection state
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappInstanceName, setWhatsappInstanceName] = useState('');

  // Email campaign states
  const [emailCampaignName, setEmailCampaignName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  // Carregar dados salvos do localStorage e verificar status do WhatsApp
  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('n8n_webhook_url');
    const savedApiKey = localStorage.getItem('evolution_api_key');
    if (savedWebhookUrl) setN8nWebhookUrl(savedWebhookUrl);
    if (savedApiKey) setEvolutionApiKey(savedApiKey);
    
    // Verificar status do WhatsApp conectado
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const token = localStorage.getItem('leadflow_access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[Campaigns WhatsApp Check] Status:', data);
        setWhatsappConnected(data.connected || false);
        setWhatsappInstanceName(data.instanceName || '');
        
        // Salvar instanceName no localStorage para uso posterior
        if (data.instanceName) {
          localStorage.setItem('whatsapp_instance_name', data.instanceName);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status do WhatsApp:', err);
      // Silently fail - user might not have WhatsApp connected yet
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setN8nMessage(messageTemplates[templateKey as keyof typeof messageTemplates] || '');
    setSelectedTemplate(templateKey);
  };

  const handleTestConnection = async () => {
    // Verificar se WhatsApp está conectado
    if (!whatsappConnected || !whatsappInstanceName) {
      toast.error('❌ Conecte seu WhatsApp primeiro!', {
        description: 'Vá para Integrações → WhatsApp API e conecte sua conta via QR Code.',
        duration: 6000,
      });
      return;
    }

    if (!n8nWebhookUrl.trim()) {
      toast.error('Digite a URL do webhook N8N para testar');
      return;
    }

    setIsTestingConnection(true);
    const loadingToast = toast.loading('Testando conexão com N8N...');

    try {
      // Usar o instanceName da instância do WhatsApp conectada
      const instanceName = whatsappInstanceName;

      // Payload de teste simples
      const testPayload: any = {
        test: true,
        message: 'Teste de conexão do LeadsFlow API',
        timestamp: new Date().toISOString(),
        instanceName: instanceName, // Instance name da conexão do WhatsApp
        contatos: [
          {
            nome: 'Lead Teste',
            telefone: '+5511999999999',
            mensagem: 'Esta é uma mensagem de teste para verificar a conexão com N8N'
          }
        ],
        delay: parseInt(delay) || 3000
      };

      // Adicionar apikey se disponível
      if (evolutionApiKey) {
        testPayload.apikey = evolutionApiKey;
      }

      console.log('🧪 Teste de conexão - Enviando para N8N:', testPayload);

      // Enviar requisição de teste
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        mode: 'cors',
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        console.log('✅ Resposta do teste:', result);
        
        toast.success(
          '✅ Conexão testada com sucesso! O webhook está funcionando corretamente.',
          { duration: 5000 }
        );
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error('❌ Erro no teste:', response.status, errorText);
        
        toast.error(
          `❌ Erro ${response.status}: O webhook não respondeu corretamente. Verifique a URL e configuração do N8N.`,
          { duration: 6000 }
        );
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      console.error('❌ Erro ao testar conexão:', error);
      
      // Tratamento específico de erros
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error(
          '🚫 Erro de CORS ou rede: Não foi possível conectar ao webhook. Verifique se a URL está correta e se o CORS está configurado no N8N.',
          { duration: 8000 }
        );
      } else {
        toast.error(
          `❌ Erro ao testar conexão: ${error.message || 'Verifique a URL e sua conexão.'}`,
          { duration: 6000 }
        );
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendN8N = async () => {
    // Verificar se WhatsApp está conectado
    if (!whatsappConnected || !whatsappInstanceName) {
      toast.error('❌ Conecte seu WhatsApp primeiro!', {
        description: 'Vá para Integrações → WhatsApp API e conecte sua conta via QR Code antes de enviar mensagens em massa.',
        duration: 6000,
      });
      return;
    }

    if (!n8nWebhookUrl.trim()) {
      toast.error('Digite a URL do webhook N8N');
      return;
    }

    if (!n8nMessage.trim()) {
      toast.error('Digite ou selecione uma mensagem');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error('Selecione pelo menos um lead');
      return;
    }

    // Verificar se pode enviar mensagens em massa
    if (!canSendMassMessages()) {
      toast.error('Limite de mensagens em massa atingido para seu plano atual.', {
        description: `Você já usou ${currentUsage.massMessages}/${limits.massMessages} envios. Faça upgrade para continuar.`,
        duration: 6000,
      });
      const event = new CustomEvent('open-upgrade-modal');
      window.dispatchEvent(event);
      return;
    }

    // Loading toast
    const loadingToast = toast.loading(`Enviando para ${selectedLeads.length} contatos...`);

    try {
      // Usar o instanceName da instância do WhatsApp conectada
      const instanceName = whatsappInstanceName;

      // Preparar dados para envio
      const payload = selectedLeads.map(lead => ({
        nome: lead.nome || lead.name,
        telefone: lead.telefone || lead.phone,
        mensagem: n8nMessage
          .replace('{nome}', lead.nome || lead.name || '')
          .replace('{email}', lead.email || '')
          .replace('{telefone}', lead.telefone || lead.phone || '')
      }));

      const requestBody: any = {
        instanceName: instanceName, // Instance name da conexão do WhatsApp
        contatos: payload,
        delay: parseInt(delay) || 3000
      };

      // Adicionar apikey se disponível
      if (evolutionApiKey) {
        requestBody.apikey = evolutionApiKey;
      }

      console.log('📤 Enviando para N8N:', requestBody);
      console.log('📱 Instance Name:', instanceName);

      // Enviar para o webhook N8N
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        console.log('✅ Resposta N8N:', result);
        
        // Atualizar usage ANTES de mostrar mensagem de sucesso
        await updateUsage('massMessages');
        
        toast.success(`✅ Mensagens enviadas para ${selectedLeads.length} contatos via N8N!`);
        setSendingStats({
          sent: sendingStats.sent + selectedLeads.length,
          failed: 0,
          remaining: 0
        });
        
        // Limpar seleção após envio
        setSelectedLeads([]);
      } else {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error('❌ Erro HTTP:', response.status, errorText);
        toast.error(`Erro ${response.status}: Verifique seu webhook N8N`);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      console.error('❌ Erro N8N:', error);
      
      // Tratamento específico de erros
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast.error(
          '🚫 Erro de CORS: O webhook N8N bloqueou a requisição. Copie o JSON abaixo e envie manualmente.',
          { duration: 8000 }
        );
        
        // Mostrar JSON para copiar
        const jsonPayload = {
          instanceName: whatsappInstanceName,
          contatos: selectedLeads.map(lead => ({
            nome: lead.nome || lead.name,
            telefone: lead.telefone || lead.phone,
            mensagem: n8nMessage
              .replace('{nome}', lead.nome || lead.name || '')
              .replace('{email}', lead.email || '')
              .replace('{telefone}', lead.telefone || lead.phone || '')
          })),
          delay: parseInt(delay) || 3000
        };
        
        if (evolutionApiKey) {
          (jsonPayload as any).apikey = evolutionApiKey;
        }
        
        console.log('📋 JSON para enviar manualmente:', JSON.stringify(jsonPayload, null, 2));
        
        // Copiar para clipboard
        navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2))
          .then(() => toast.success('📋 JSON copiado! Cole no seu N8N.'))
          .catch(() => toast.info('Veja o JSON no console do navegador (F12)'));
          
      } else {
        toast.error('Erro ao conectar com N8N. Verifique a URL e conexão.');
      }
    }
  };

  const handleSendEmail = () => {
    if (!emailCampaignName.trim()) {
      toast.error('Digite um nome para a campanha');
      return;
    }
    
    if (!emailSubject.trim()) {
      toast.error('Digite o assunto do email');
      return;
    }
    
    if (!emailBody.trim()) {
      toast.error('Digite o conteúdo do email');
      return;
    }
    
    // Calcular quantos emails serão enviados
    const emailRecipients = leads.filter(l => l.email).length;
    
    // Verificar se pode enviar essa quantidade de emails
    if (!canSendMessages(emailRecipients)) {
      toast.error('Limite de mensagens atingido para seu plano atual.', {
        description: `Você tentou enviar ${emailRecipients} emails, mas só tem ${limits.messages - currentUsage.messages} mensagens disponíveis. Faça upgrade para continuar.`,
        duration: 6000,
      });
      const event = new CustomEvent('open-upgrade-modal');
      window.dispatchEvent(event);
      return;
    }
    
    if (onEmailMarketing) {
      onEmailMarketing();
      // Atualizar usage após envio
      updateUsage('messages', emailRecipients);
    } else {
      toast.success('Campanha de Email criada com sucesso!');
      // Atualizar usage após envio
      updateUsage('messages', emailRecipients);
    }
  };

  const campaignTabs = [
    {
      id: 'whatsapp' as CampaignType,
      name: 'Campanhas WhatsApp',
      icon: MessageSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    },
    {
      id: 'email' as CampaignType,
      name: 'Campanhas Email',
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    },
    {
      id: 'automation' as CampaignType,
      name: 'Automação',
      icon: Zap,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
  ];

  const activeTabData = campaignTabs.find((tab) => tab.id === selectedCampaignType);

  // Verificar se o plano é FREE
  const isFree = userPlan === 'free' || user?.subscription_plan === 'free';
  const isBusiness = userPlan === 'business' || user?.subscription_plan === 'business';
  const isEnterprise = userPlan === 'enterprise' || user?.subscription_plan === 'enterprise';

  // Verificar se tem acesso ao envio em massa N8N (apenas Business e Enterprise)
  const hasN8NAccess = isBusiness || isEnterprise;

  // State para controlar o Dialog de upgrade
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Ao tentar clicar em qualquer ação no card, mostrar o popup se for FREE
  useEffect(() => {
    if (!hasN8NAccess && selectedCampaignType === 'whatsapp') {
      setShowUpgradeDialog(true);
    }
  }, [selectedCampaignType, hasN8NAccess]);

  // Limites por plano
  const planLimits = {
    free: { messages: 50, massMessages: 5 },
    business: { messages: 1000, massMessages: 1000 },
    enterprise: { messages: Infinity, massMessages: Infinity }
  };

  // Pegar o plano atual
  const currentPlan = (user?.subscription_plan || userPlan || 'free') as 'free' | 'business' | 'enterprise';
  const limits = planLimits[currentPlan];
  
  // Pegar usage atual
  const currentUsage = user?.usage || { messages: 0, massMessages: 0 };

  // Função para verificar se pode enviar mensagens
  const canSendMessages = (quantity: number) => {
    if (currentPlan === 'enterprise') return true;
    return (currentUsage.messages + quantity) <= limits.messages;
  };

  // Função para verificar se pode fazer envio em massa
  const canSendMassMessages = () => {
    if (currentPlan === 'enterprise') return true;
    return (currentUsage.massMessages + 1) <= limits.massMessages;
  };

  // Função para atualizar usage no backend
  const updateUsage = async (type: 'messages' | 'massMessages', quantity: number = 1): Promise<boolean> => {
    try {
      const token = localStorage.getItem('leadflow_access_token');
      if (!token) {
        console.warn('⚠️ Token não encontrado - não é possível atualizar usage');
        return false;
      }

      console.log(`📊 Atualizando usage - Type: ${type}, Quantity: ${quantity}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/usage/increment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            quantity
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usage atualizado com sucesso:', data);
        
        // Atualizar o user localmente IMEDIATAMENTE
        if (user && data.usage) {
          const updatedUser = { ...user, usage: data.usage };
          
          // Chamar callback para forçar re-render no componente pai
          if (onUserUpdate) {
            onUserUpdate(updatedUser);
          }
          
          // Forçar re-render local dos cards
          setUsageRefreshKey(prev => prev + 1);
          
          console.log('✅ Estado local atualizado:', data.usage);
        }
        
        return true;
      } else {
        console.error('❌ Erro HTTP ao atualizar usage:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usage:', error);
      return false;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Campanhas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas campanhas de marketing e automações
        </p>
      </div>

      {/* Campaign Type Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {campaignTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCampaignType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCampaignType(tab.id)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left group ${
                isActive
                  ? `${tab.borderColor} ${tab.bgColor} shadow-md`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? tab.bgColor : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? tab.color : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                </div>
              </div>
              <h3 className={`font-semibold mb-1 transition-colors ${
                isActive ? tab.color : 'text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200'
              }`}>
                {tab.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tab.id === 'whatsapp' && 'Envie mensagens via WhatsApp'}
                {tab.id === 'email' && 'Campanhas de email marketing'}
                {tab.id === 'automation' && 'Configure automações'}
              </p>
              
              {isActive && (
                <div className={`absolute inset-0 rounded-xl ${tab.bgColor} opacity-20 pointer-events-none`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Campaign Content */}
      {selectedCampaignType === 'whatsapp' && (
        <>
          {/* WhatsApp Connection Alert */}
          {!whatsappConnected && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    📱 Conecte seu WhatsApp primeiro
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                    Para usar o envio em massa via N8N, você precisa conectar sua conta WhatsApp criando uma instância via QR Code.
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-4">
                    A instância criada será usada automaticamente para enviar as mensagens através do N8N.
                  </p>
                  <Button
                    onClick={() => {
                      // Navegar para integrações
                      const event = new CustomEvent('navigate-to-integrations');
                      window.dispatchEvent(event);
                      toast.info('Vá para Integrações → WhatsApp API e escaneie o QR Code');
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ir para Integrações
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Campaign Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
            
            {/* Card Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-100 dark:border-green-800/50 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center border border-green-200 dark:border-green-700">
                  <MessageSquare className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Envio em Massa via N8N
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Conecte com seu workflow N8N para envio automatizado
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-8">
              
              {/* Métricas Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Leads Selecionados */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                    Leads Selecionados
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedLeads.length}
                  </p>
                </div>

                {/* Enviadas */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-green-900 dark:text-green-100 font-medium mb-1">
                    Enviadas
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {sendingStats.sent}
                  </p>
                </div>

                {/* Limite de Envios em Massa */}
                <div key={`mass-messages-${usageRefreshKey}`} className="bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">
                    Envios em Massa
                  </p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {currentPlan === 'enterprise' ? '∞' : `${currentUsage.massMessages}/${limits.massMessages}`}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    {currentPlan === 'free' && 'Plano FREE'}
                    {currentPlan === 'business' && 'Plano Business'}
                    {currentPlan === 'enterprise' && 'Ilimitado'}
                  </p>
                </div>
              </div>

              {/* Webhook URL Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Label htmlFor="n8n-webhook-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL do Webhook N8N
                  </Label>
                </div>
                <Input
                  id="n8n-webhook-url"
                  value={n8nWebhookUrl}
                  onChange={(e) => {
                    setN8nWebhookUrl(e.target.value);
                    localStorage.setItem('n8n_webhook_url', e.target.value);
                  }}
                  placeholder="https://seu-n8n.com/webhook/..."
                  className="h-11"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                  <span>Cole a URL do webhook do seu workflow N8N para integração automática</span>
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Lead Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selecionar Leads
                    </Label>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    {selectedLeads.length} selecionados
                  </span>
                </div>

                {leads.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Nenhum lead cadastrado
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Adicione leads ao CRM para enviar campanhas
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {/* Select All Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          id="select-all"
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads([...leads]);
                              toast.success(`${leads.length} leads selecionados`);
                            } else {
                              setSelectedLeads([]);
                              toast.info('Seleção limpa');
                            }
                          }}
                          className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 transition-all"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          Selecionar Todos ({leads.length})
                        </span>
                      </label>
                    </div>

                    {/* Leads List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="p-3 space-y-2">
                        {leads.map((lead, index) => {
                          const isSelected = selectedLeads.some(
                            (selected) => selected.id === lead.id || 
                            (selected.telefone || selected.phone) === (lead.telefone || lead.phone)
                          );
                          const leadPhone = lead.telefone || lead.phone || 'Sem telefone';
                          const leadName = lead.nome || lead.name || 'Sem nome';
                          const leadEmail = lead.email || '';

                          return (
                            <div
                              key={lead.id || index}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedLeads(selectedLeads.filter(
                                    (selected) => selected.id !== lead.id && 
                                    (selected.telefone || selected.phone) !== (lead.telefone || lead.phone)
                                  ));
                                } else {
                                  setSelectedLeads([...selectedLeads, lead]);
                                }
                              }}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 shadow-sm'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                                  {leadName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{leadPhone}</span>
                                  </div>
                                  {leadEmail && (
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                      <AtSign className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[200px]">{leadEmail}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
                  <span>Clique nos leads para selecioná-los individualmente ou use "Selecionar Todos"</span>
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Message Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mensagem da Campanha
                  </Label>
                </div>

                {/* Templates Dropdown */}
                <div>
                  <Label htmlFor="message-template" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                    Templates Prontos
                  </Label>
                  <Select onValueChange={handleTemplateSelect} value={selectedTemplate}>
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-800">
                      <SelectValue placeholder="🎯 Escolha um template ou crie sua mensagem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saudacao">
                        <div className="flex items-center gap-2">
                          <span>👋</span>
                          <span>Saudação</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="promocao">
                        <div className="flex items-center gap-2">
                          <span>🎁</span>
                          <span>Promoção</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="agradecimento">
                        <div className="flex items-center gap-2">
                          <span>🙏</span>
                          <span>Agradecimento</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="followup">
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span>Follow-up</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Textarea */}
                <div>
                  <Label htmlFor="n8n-message" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                    Texto da Mensagem
                  </Label>
                  <Textarea
                    id="n8n-message"
                    value={n8nMessage}
                    onChange={(e) => setN8nMessage(e.target.value)}
                    placeholder="Digite sua mensagem personalizada aqui..."
                    className="min-h-[180px] resize-none bg-white dark:bg-gray-800"
                  />
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1.5">
                      🔤 Variáveis disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <code className="px-2 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-xs font-mono border border-blue-200 dark:border-blue-700">
                        {'{nome}'}
                      </code>
                      <code className="px-2 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-xs font-mono border border-blue-200 dark:border-blue-700">
                        {'{email}'}
                      </code>
                      <code className="px-2 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-xs font-mono border border-blue-200 dark:border-blue-700">
                        {'{telefone}'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Delay Input */}
                <div>
                  <Label htmlFor="delay" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                    Delay entre Mensagens (ms)
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="delay"
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(e.target.value)}
                      placeholder="3000"
                      className="h-11 pl-10 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1.5">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">⏱️</span>
                    <span>Intervalo recomendado: 3000ms (3 segundos) para evitar bloqueios</span>
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Alerta de Limite Próximo */}
              {currentPlan !== 'enterprise' && currentUsage.massMessages >= limits.massMessages * 0.8 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        {currentUsage.massMessages >= limits.massMessages 
                          ? '⚠️ Limite Atingido!' 
                          : '⚠️ Limite Próximo!'}
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        {currentUsage.massMessages >= limits.massMessages
                          ? 'Você atingiu o limite de envios em massa do seu plano.'
                          : `Você já usou ${currentUsage.massMessages} de ${limits.massMessages} envios em massa disponíveis.`}
                        {' '}Faça upgrade para continuar enviando campanhas.
                      </p>
                      <Button
                        onClick={() => {
                          const event = new CustomEvent('open-upgrade-modal');
                          window.dispatchEvent(event);
                        }}
                        size="sm"
                        className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Fazer Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Send Button */}
                <Button
                  onClick={handleSendN8N}
                  disabled={!n8nWebhookUrl || !n8nMessage || selectedLeads.length === 0}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {selectedLeads.length > 0 
                    ? `Enviar para ${selectedLeads.length} ${selectedLeads.length === 1 ? 'lead' : 'leads'} via N8N`
                    : 'Enviar via N8N'
                  }
                </Button>
                
                {!n8nWebhookUrl && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    ⚠️ Configure a URL do webhook
                  </p>
                )}
                
                {n8nWebhookUrl && (!n8nMessage || selectedLeads.length === 0) && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {!n8nMessage && '⚠️ Digite ou selecione uma mensagem'}
                    {n8nMessage && selectedLeads.length === 0 && '⚠️ Selecione pelo menos um lead'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Email Campaign */}
      {selectedCampaignType === 'email' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-100 dark:border-purple-800/50 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center border border-purple-200 dark:border-purple-700">
                <Mail className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Nova Campanha de Email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Crie e envie campanhas de email marketing
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-purple-900 dark:text-purple-100 font-medium mb-1">
                  Destinatários
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {leads.filter(l => l.email).length}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Com email válido
                </p>
              </div>

              <div key={`messages-${usageRefreshKey}`} className="bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">
                  Mensagens Restantes
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {currentPlan === 'enterprise' ? '∞' : `${limits.messages - currentUsage.messages}`}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {currentPlan === 'free' && `${currentUsage.messages}/${limits.messages} usadas`}
                  {currentPlan === 'business' && `${currentUsage.messages}/${limits.messages} usadas`}
                  {currentPlan === 'enterprise' && 'Ilimitadas'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                    <Webhook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                  SMTP
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Configure nas Integrações
                </p>
              </div>
            </div>

            {/* Campaign Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="email-campaign-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome da Campanha
                </Label>
              </div>
              <Input
                id="email-campaign-name"
                value={emailCampaignName}
                onChange={(e) => setEmailCampaignName(e.target.value)}
                placeholder="Ex: Promoção Black Friday 2024"
                className="h-11 bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
                <span>Nome interno para identificar sua campanha</span>
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Email Subject */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="email-subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assunto do Email
                </Label>
              </div>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Digite o assunto do email..."
                className="h-11 bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
                <span>Use assuntos claros e atrativos para aumentar a taxa de abertura</span>
              </p>
            </div>

            {/* Email Body */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="email-body" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Corpo do Email
                </Label>
              </div>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Digite o conteúdo do email..."
                className="min-h-[250px] resize-none bg-white dark:bg-gray-800"
              />
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-xs text-purple-900 dark:text-purple-100 font-medium mb-1.5">
                  🔤 Variáveis disponíveis:
                </p>
                <div className="flex flex-wrap gap-2">
                  <code className="px-2 py-1 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded text-xs font-mono border border-purple-200 dark:border-purple-700">
                    {'{nome}'}
                  </code>
                  <code className="px-2 py-1 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded text-xs font-mono border border-purple-200 dark:border-purple-700">
                    {'{email}'}
                  </code>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-200 mt-2">
                  ✨ Suporte a HTML para formatação avançada
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Alerta de Limite Próximo - Emails */}
            {currentPlan !== 'enterprise' && currentUsage.messages >= limits.messages * 0.8 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      {currentUsage.messages >= limits.messages 
                        ? '⚠️ Limite Atingido!' 
                        : '⚠️ Limite Próximo!'}
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      {currentUsage.messages >= limits.messages
                        ? 'Você atingiu o limite de mensagens do seu plano.'
                        : `Você já usou ${currentUsage.messages} de ${limits.messages} mensagens disponíveis.`}
                      {' '}Faça upgrade para continuar enviando emails.
                    </p>
                    <Button
                      onClick={() => {
                        const event = new CustomEvent('open-upgrade-modal');
                        window.dispatchEvent(event);
                      }}
                      size="sm"
                      className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div>
              <Button
                onClick={handleSendEmail}
                disabled={!emailCampaignName || !emailSubject || !emailBody}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Campanha de Email
              </Button>
              
              {(!emailCampaignName || !emailSubject || !emailBody) && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                  {!emailCampaignName && '⚠️ Digite o nome da campanha'}
                  {emailCampaignName && !emailSubject && '⚠️ Digite o assunto do email'}
                  {emailCampaignName && emailSubject && !emailBody && '⚠️ Digite o conteúdo do email'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Automation Campaign */}
      {selectedCampaignType === 'automation' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-blue-100 dark:border-blue-800/50 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center border border-blue-200 dark:border-blue-700">
                <Zap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Automações
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Configure fluxos automatizados de comunicação
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Zap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Em Breve
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Estamos desenvolvendo recursos de automação avançados para você criar fluxos inteligentes de nutrição de leads.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>Funcionalidade em desenvolvimento</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info - Show only for WhatsApp */}
      {selectedCampaignType === 'whatsapp' && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Como funciona?
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                O sistema envia os dados dos leads selecionados para seu workflow N8N, incluindo automaticamente o 
                <code className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded mx-1 font-mono">instanceName</code>
                e 
                <code className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded mx-1 font-mono">apikey</code>
                da Evolution API. Configure seu workflow N8N para processar esses dados e enviar as mensagens via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG DE UPGRADE - Aparece quando FREE tenta acessar WhatsApp */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">Recurso Premium</DialogTitle>
            <DialogDescription className="text-center pt-2">
              O envio em massa via N8N está disponível apenas nos planos <span className="font-semibold text-blue-600 dark:text-blue-400">Business</span> e <span className="font-semibold text-purple-600 dark:text-purple-400">Enterprise</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Faça upgrade para desbloquear automações avançadas e envios em massa ilimitados.
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                <p className="font-bold text-blue-900 dark:text-blue-100 mb-1">Business</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">5 envios/mês</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">$20<span className="text-sm">/mês</span></p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                <p className="font-bold text-purple-900 dark:text-purple-100 mb-1">Enterprise</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">Ilimitado</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">$59<span className="text-sm">/mês</span></p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowUpgradeDialog(false);
                const event = new CustomEvent('open-upgrade-modal');
                window.dispatchEvent(event);
              }}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}