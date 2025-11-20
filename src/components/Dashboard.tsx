import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

// Dashboard components
import StatsCards from './dashboard/StatsCards';
import MainStatsCards from './dashboard/MainStatsCards';
import FilterBar from './dashboard/FilterBar';
import LeadsTable from './dashboard/LeadsTable';
import ChartsSection from './dashboard/ChartsSection';
import PlanoWidget from './dashboard/PlanoWidget';
import RecentLeadsSection from './dashboard/RecentLeadsSection';

// Navigation components
import RefactoredHeader from './navigation/RefactoredHeader';
import NavigationSidebar from './navigation/NavigationSidebar';

// Settings pages
import PlanPage from './settings/PlanPage';
import IntegrationsPage from './settings/IntegrationsPage';
import SecurityPage from './settings/SecurityPage';
import AccountSettingsPage from './settings/AccountSettingsPage';
import AdminPage from './settings/AdminPage';
import CampaignsPage from './settings/CampaignsPage';

// Modal imports
import NovoLeadModal from './modals/NovoLeadModal';
import EditarLeadModal from './modals/EditarLeadModal';
import ChatModal from './modals/ChatModal';
import MassMessageModal from './modals/MassMessageModal';
import UpgradeModal from './modals/UpgradeModal';
import { SendMessageModal } from './SendMessageModal';
import ImportarLeadsModal from './modals/ImportarLeadsModal';
import EmailMarketingModalV2 from './modals/EmailMarketingModalV2';
import EnviarEmailModal from './modals/EnviarEmailModal';

// Onboarding
import ProductTour from './onboarding/ProductTour';

// Chat Flutuante
import { FloatingChat } from './FloatingChat';

// Utils and Hooks
import { projectId } from '../utils/supabase/info';
import { leadsApi } from '../utils/api';
import { useLeadsAutoRefresh } from '../hooks/useLeadsAutoRefresh';

// Types
interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  interesse?: string;
  origem?: string;
  status?: string;
  data?: string;
  agente_atual?: string;
  observacoes?: string;
  marcado_email?: boolean;
}

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onSettings: () => void;
  onAdmin?: () => void;
  onUserUpdate: (user: any) => void;
}

export default function Dashboard({ user, onLogout, onSettings, onAdmin, onUserUpdate }: DashboardProps) {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop: aberto por padrão
  const [isMobile, setIsMobile] = useState(false);
  const [filtros, setFiltros] = useState({ origem: '', status: '', busca: '' });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ origem: '', status: '', busca: '' });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos modais
  const [modalNovoLead, setModalNovoLead] = useState(false);
  const [modalEditarLead, setModalEditarLead] = useState(false);
  const [modalChat, setModalChat] = useState(false);
  const [modalMassMessage, setModalMassMessage] = useState(false);
  const [modalUpgrade, setModalUpgrade] = useState(false);
  const [modalSendMessage, setModalSendMessage] = useState(false);
  const [modalImportarLeads, setModalImportarLeads] = useState(false);
  const [modalEmailMarketing, setModalEmailMarketing] = useState(false);
  const [modalEnviarEmail, setModalEnviarEmail] = useState(false);
  const [selectedLeadsForMessage, setSelectedLeadsForMessage] = useState<string[]>([]);
  
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);

  // Onboarding state
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('leadflow_access_token');
    if (token) {
      carregarLeads();
    }
    // Load theme
    const savedTheme = localStorage.getItem('crm_tema');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Check if user should see onboarding tour
    const tourCompleted = localStorage.getItem('leadsflow_tour_completed');
    if (!tourCompleted && user) {
      // Show tour after 2 seconds
      setTimeout(() => {
        setShowTour(true);
      }, 2000);
    }

    // Detect mobile/desktop
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // No mobile, fechar sidebar por padrão
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listener para evento de atualização de leads (disparado quando sincroniza Google Sheets)
    const handleLeadsUpdated = () => {
      console.log('[Dashboard] Leads updated event received, reloading...');
      carregarLeads();
    };
    window.addEventListener('leads-updated', handleLeadsUpdated);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('leads-updated', handleLeadsUpdated);
    };
  }, []);

  const carregarLeads = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Starting to load leads...');
      const response = await leadsApi.getAll();
      console.log('[Dashboard] Leads API response:', response);
      if (response.success) {
        console.log('[Dashboard] ✅ Loaded', response.leads.length, 'leads successfully');
        setLeads(response.leads);
      } else {
        console.error('[Dashboard] Response not successful:', response);
      }
    } catch (error) {
      console.error('[Dashboard] Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar leads - recarrega do banco e opcionalmente sincroniza com N8N
  const handleAtualizar = async () => {
    try {
      setLoading(true);
      
      // Verificar se há webhook N8N configurado
      const n8nWebhookUrl = localStorage.getItem('n8n_webhook_url');
      
      if (n8nWebhookUrl) {
        // Se tiver webhook, sincronizar com N8N
        toast.info('🔄 Sincronizando leads do N8N...');
        await sincronizarLeadsN8N();
      } else {
        // Se não tiver webhook, apenas recarregar do banco
        toast.info('🔄 Atualizando lista de leads...');
        await carregarLeads();
        toast.success('✅ Lista de leads atualizada!');
      }
    } catch (error) {
      console.error('[Dashboard] Error updating leads:', error);
      toast.error('Erro ao atualizar leads');
    } finally {
      setLoading(false);
    }
  };

  // Função para sincronizar leads do Google Sheets via webhook N8N
  const sincronizarLeadsN8N = async () => {
    try {
      // Verificar se há webhook N8N configurado
      const n8nWebhookUrl = localStorage.getItem('n8n_webhook_url');
      
      if (!n8nWebhookUrl) {
        toast.error('Configure o webhook N8N nas Integrações primeiro');
        return;
      }

      // Validar URL
      try {
        new URL(n8nWebhookUrl);
      } catch (e) {
        toast.error('URL do webhook N8N inválida. Verifique a configuração nas Integrações.');
        console.error('[N8N Sync] Invalid webhook URL:', n8nWebhookUrl);
        return;
      }

      setLoading(true);
      console.log('[N8N Sync] ====== STARTING SYNC ======');
      console.log('[N8N Sync] Webhook URL:', n8nWebhookUrl);
      console.log('[N8N Sync] Sending request to backend proxy...');

      // Usar rota proxy do backend para evitar CORS
      const token = localStorage.getItem('leadflow_access_token');
      const proxyUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/n8n/sync`;
      
      console.log('[N8N Sync] Proxy URL:', proxyUrl);
      console.log('[N8N Sync] Request body:', JSON.stringify({ webhookUrl: n8nWebhookUrl }));
      
      const response = await fetch(
        proxyUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ webhookUrl: n8nWebhookUrl }),
        }
      );

      console.log('[N8N Sync] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[N8N Sync] HTTP error:', response.status, errorData);
        
        if (response.status === 408) {
          toast.error('⏱️ Timeout: O webhook N8N não respondeu em 30 segundos. Verifique se o workflow está ativo.');
        } else if (response.status === 502) {
          // Erro 502 geralmente significa resposta vazia ou JSON inválido
          const errorMessage = errorData.details || errorData.error || 'Erro ao conectar com o webhook N8N';
          
          console.error('[N8N Sync] 502 Error Details:', errorMessage);
          
          if (errorMessage.includes('Empty response')) {
            toast.error(
              '❌ Webhook retornou resposta vazia.\n\n' +
              'Certifique-se de que seu workflow N8N:\n' +
              '• Tem um node "Respond to Webhook"\n' +
              '• Está retornando dados\n' +
              '• Está ativo e funcionando\n\n' +
              'Verifique os logs do N8N para mais detalhes.',
              { duration: 8000 }
            );
          } else if (errorMessage.includes('Invalid JSON')) {
            toast.error(
              '❌ Webhook retornou JSON inválido.\n\n' +
              'Certifique-se de que seu workflow N8N:\n' +
              '• Retorna um array de objetos JSON\n' +
              '• Usa o node "Respond to Webhook"\n' +
              '• Está configurado corretamente\n\n' +
              'Abra o console (F12) para ver a resposta recebida.',
              { duration: 8000 }
            );
          } else {
            toast.error(`❌ Erro 502: ${errorMessage}\n\nVerifique se a URL está correta e o workflow está ativo no N8N.`, { duration: 6000 });
          }
        } else if (response.status === 401) {
          toast.error('❌ Erro de autenticação. Faça login novamente.');
        } else {
          toast.error(`❌ Erro: ${errorData.error || 'Erro ao sincronizar'}. Verifique o console (F12) para mais detalhes.`);
        }
        
        await carregarLeads();
        return;
      }

      const data = await response.json();
      console.log('[N8N Sync] Response data:', data);
      console.log('[N8N Sync] Leads added:', data.added, 'Errors:', data.errors);

      // Recarregar todos os leads
      await carregarLeads();

      // Mostrar resultado da sincronização
      if (data.added > 0) {
        toast.success(`✅ ${data.added} lead(s) importado(s) do Google Sheets!`);
      }
      
      if (data.errors > 0) {
        toast.warning(`⚠️ ${data.errors} lead(s) não puderam ser importados`);
      }

      if (data.limitReached) {
        toast.warning('⚠️ Limite de leads atingido! Alguns leads não foram importados.');
      }

      if (data.added === 0 && data.errors === 0) {
        toast.info('ℹ️ Nenhum lead novo encontrado na planilha');
      }

      console.log('[N8N Sync] ====== SYNC COMPLETED ======');

    } catch (error: any) {
      console.error('[N8N Sync] ====== SYNC FAILED ======');
      console.error('[N8N Sync] Erro ao sincronizar:', error);
      console.error('[N8N Sync] Error stack:', error.stack);
      console.error('[N8N Sync] Error name:', error.name);
      console.error('[N8N Sync] Error message:', error.message);
      
      toast.error('❌ Erro ao sincronizar com Google Sheets. Verifique o console (F12) e confirme se o webhook N8N está ativo.');
      
      // Recarregar leads mesmo com erro
      try {
        await carregarLeads();
      } catch (reloadError) {
        console.error('[N8N Sync] Error reloading leads:', reloadError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh de leads a cada 15 segundos para detectar novos leads do webhook N8N
  useLeadsAutoRefresh({
    onRefresh: carregarLeads,
    enabled: currentPage === 'dashboard' || currentPage === 'leads',
    interval: 15000,
  });

  // Check if user can perform action based on limits
  const podeExecutar = (acao: 'leads' | 'mensagens' | 'envios'): boolean => {
    if (!user) return false;
    
    const limites = user.limits || {};
    const uso = user.usage || {};

    if (acao === 'leads') {
      return limites.leads === -1 || (uso.leads || 0) < limites.leads;
    } else if (acao === 'mensagens') {
      return limites.messages === -1 || (uso.messages || 0) < limites.messages;
    } else if (acao === 'envios') {
      return limites.massMessages === -1 || (uso.massMessages || 0) < limites.massMessages;
    }
    
    return false;
  };

  const handleAdicionarLead = async (novoLead: Omit<Lead, 'id'>) => {
    try {
      console.log('[Dashboard] Creating lead with data:', novoLead);
      const response = await leadsApi.create(novoLead);
      console.log('[Dashboard] Lead creation response:', response);
      
      if (response.success) {
        setLeads([...leads, response.lead]);
        setModalNovoLead(false);
        // Reload user to update usage
        onUserUpdate({ ...user, usage: { ...user.usage, leads: (user.usage?.leads || 0) + 1 } });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('[Dashboard] Error creating lead:', error);
      if (error.message.includes('limit reached') || error.message.includes('Lead limit reached')) {
        alert('⛔ Limite de leads atingido! Faça upgrade do seu plano.');
        setModalUpgrade(true);
      } else {
        alert('❌ Erro ao criar lead: ' + (error.message || 'Erro desconhecido'));
      }
      return false;
    }
  };

  const handleEditarLead = async (leadEditado: Lead) => {
    try {
      if (!leadEditado.id) {
        console.error('Lead ID is missing:', leadEditado);
        alert('Erro: ID do lead não encontrado. Por favor, recarregue a página.');
        return;
      }

      const response = await leadsApi.update(leadEditado.id, leadEditado);
      if (response.success) {
        const novosLeads = [...leads];
        const index = novosLeads.findIndex(l => l.id === leadEditado.id);
        if (index !== -1) {
          novosLeads[index] = response.lead;
          setLeads(novosLeads);
        }
        setModalEditarLead(false);
        setLeadSelecionado(null);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Erro ao atualizar lead. Por favor, tente novamente.');
    }
  };

  const handleDeletarLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja deletar este lead?')) return;

    try {
      const response = await leadsApi.delete(leadId);
      if (response.success) {
        setLeads(leads.filter(l => l.id !== leadId));
        // Update usage
        onUserUpdate({ ...user, usage: { ...user.usage, leads: Math.max(0, (user.usage?.leads || 0) - 1) } });
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleDeleteMultiple = async (indices: number[]) => {
    try {
      console.log('[Dashboard] Deleting multiple leads:', indices);
      
      // Deletar cada lead selecionado
      let deletedCount = 0;
      for (const index of indices) {
        const lead = leads[index];
        if (!lead || !lead.id) {
          console.warn(`[Dashboard] Lead at index ${index} not found or has no ID`);
          continue;
        }
        
        try {
          const response = await leadsApi.delete(lead.id);
          if (response.success) {
            deletedCount++;
          }
        } catch (error) {
          console.error(`[Dashboard] Error deleting lead ${lead.id}:`, error);
        }
      }
      
      // Recarregar leads após deletar
      await carregarLeads();
      
      // Atualizar uso
      const newUsage = Math.max(0, (user.usage?.leads || 0) - deletedCount);
      onUserUpdate({ ...user, usage: { ...user.usage, leads: newUsage } });
      
      toast.success(`${deletedCount} lead(s) deletado(s) com sucesso!`);
    } catch (error) {
      console.error('[Dashboard] Error in handleDeleteMultiple:', error);
      toast.error('Erro ao deletar leads selecionados');
    }
  };

  const handleToggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('crm_tema', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('crm_tema', 'light');
    }
  };

  const handleUpgrade = () => {
    setModalUpgrade(true);
  };

  const handleNovoLead = () => {
    if (!podeExecutar('leads')) {
      alert('⛔ Limite de leads atingido! Faça upgrade para continuar.');
      handleUpgrade();
      return;
    }
    setModalNovoLead(true);
  };

  const handleEnvioMassa = () => {
    // Check if plan allows mass messages
    const allowedPlans = ['business', 'pro', 'enterprise'];
    const currentPlan = user?.plan || 'free';
    
    if (!allowedPlans.includes(currentPlan)) {
      // Show professional alert dialog
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200';
      alertDiv.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="p-6 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Recurso Premium</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              O <strong>Envio em Massa</strong> está disponível apenas nos planos <strong>Pro</strong>, <strong>Business</strong> e <strong>Enterprise</strong>.
            </p>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                ✨ Faça upgrade agora e envie mensagens para centenas de leads simultaneamente!
              </p>
            </div>
            <div class="flex gap-3">
              <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onclick="this.closest('.fixed').remove(); document.querySelector('[data-upgrade-btn]').click()" class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg">
                Fazer Upgrade
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }
    
    if (!podeExecutar('envios')) {
      alert('⛔ Limite de envios atingido! Faça upgrade para continuar.');
      handleUpgrade();
      return;
    }
    setModalMassMessage(true);
  };

  const handleToggleEmailMarketing = async (index: number) => {
    const lead = leads[index];
    if (!lead.id) return;

    try {
      const updatedLead = { ...lead, marcado_email: !lead.marcado_email };
      const response = await leadsApi.update(lead.id, updatedLead);
      
      if (response.success) {
        const novosLeads = [...leads];
        novosLeads[index] = response.lead;
        setLeads(novosLeads);
      }
    } catch (error) {
      console.error('Error toggling email marketing:', error);
    }
  };

  const handleEmailMarketing = () => {
    // Filtrar apenas leads com email disponíveis
    const leadsComEmail = leads.filter(l => l.email && l.email.trim() !== '');
    
    if (leadsComEmail.length === 0) {
      alert('Nenhum lead com email disponível. Adicione emails aos seus leads para usar esta funcionalidade.');
      return;
    }

    if (!podeExecutar('mensagens')) {
      alert('⛔ Limite de mensagens atingido! Faça upgrade para continuar.');
      handleUpgrade();
      return;
    }
    
    setModalEmailMarketing(true);
  };

  const handleEdit = (index: number) => {
    setLeadSelecionado(leads[index]);
    setModalEditarLead(true);
  };

  const handleDelete = async (index: number) => {
    const lead = leads[index];
    await handleDeletarLead(lead.id);
  };

  const handleChat = (index: number) => {
    if (!podeExecutar('mensagens')) {
      alert('⛔ Limite de mensagens atingido! Faça upgrade para continuar.');
      handleUpgrade();
      return;
    }
    const lead = leads[index];
    setSelectedLeadsForMessage([lead.id]);
    setModalSendMessage(true);
  };

  const handleSendEmail = (index: number) => {
    if (!podeExecutar('mensagens')) {
      alert('⛔ Limite de mensagens atingido! Faça upgrade para continuar.');
      handleUpgrade();
      return;
    }
    const lead = leads[index];
    if (!lead.email) {
      alert('❌ Este lead não possui email cadastrado.');
      return;
    }
    setLeadSelecionado(lead);
    setModalEnviarEmail(true);
  };

  const handleSendEmailSubmit = async (assunto: string, mensagem: string) => {
    // Simular envio de email via API
    console.log('Enviando email:', {
      to: leadSelecionado?.email,
      subject: assunto,
      body: mensagem
    });
    // Aqui você pode integrar com sua API de envio de email
  };

  const handleExport = () => {
    // Define export limits by plan
    const exportLimits: Record<string, number> = {
      free: 10,        // Free: 10 leads
      business: 500,   // Business: 500 leads  
      enterprise: -1,  // Enterprise: ilimitado
    };

    const currentPlan = user?.plan || 'free';
    const maxExport = exportLimits[currentPlan] || exportLimits.free;
    
    // Check if plan has export limit
    if (maxExport !== -1 && leads.length > maxExport) {
      const confirmExport = confirm(
        `⚠️ Limite de Exportação\n\n` +
        `Seu plano ${currentPlan.toUpperCase()} permite exportar até ${maxExport} leads.\n` +
        `Você tem ${leads.length} leads no total.\n\n` +
        `Deseja exportar os primeiros ${maxExport} leads?`
      );
      
      if (!confirmExport) {
        // Offer upgrade
        if (confirm('Deseja fazer upgrade para exportar todos os seus leads?')) {
          setModalUpgrade(true);
        }
        return;
      }
    }

    // Limit leads based on plan
    const leadsToExport = maxExport === -1 ? leads : leads.slice(0, maxExport);
    
    const headers = ['Nome', 'Telefone', 'Interesse', 'Origem', 'Status', 'Data', 'Agente', 'Observacoes'];
    
    const rows = leadsToExport.map((lead) =>
      [
        lead.nome || '',
        lead.telefone || '',
        lead.interesse || '',
        lead.origem || '',
        lead.status || '',
        lead.data || '',
        lead.agente_atual || '',
        (lead.observacoes || '').replace(/\n/g, ' '),
      ]
        .map((field) => {
          if (field.includes(',') || field.includes('"')) {
            return '"' + field.replace(/"/g, '""') + '"';
          }
          return field;
        })
        .join(',')
    );

    const csv = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8',
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success message with count
    alert(`✅ Exportação concluída!\n\n${leadsToExport.length} leads exportados com sucesso.`);
  };

  const handleImport = () => {
    // Definir limites de importação por plano
    const importLimits: Record<string, number> = {
      free: 50,          // Free: 50 leads por importação
      business: 250,     // Business: 250 leads por importação
      enterprise: 1000,  // Enterprise: 1000 leads por importação
    };

    const currentPlan = user?.plan || 'free';
    const maxImport = importLimits[currentPlan] || importLimits.free;
    
    // Informar sobre os limites antes de abrir o modal
    const confirmImport = confirm(
      `📥 Importação de Leads\n\n` +
      `Seu plano ${currentPlan.toUpperCase()} permite importar até ${maxImport} leads por vez.\n\n` +
      `O sistema irá importar apenas os primeiros ${maxImport} leads da sua planilha.\n\n` +
      `Deseja continuar?`
    );
    
    if (!confirmImport) {
      return;
    }
    
    setModalImportarLeads(true);
  };

  const handleUpgradeSuccess = (updatedUser: any) => {
    onUserUpdate(updatedUser);
  };

  // Função para aplicar filtros aos cards e gráficos
  const handleAplicarFiltros = (novosFiltros: { origem: string; status: string; busca: string }) => {
    setFiltrosAplicados(novosFiltros);
  };

  // Filtrar leads baseado nos filtros aplicados
  const leadsFiltradosPorFiltros = useMemo(() => {
    return leads.filter((lead) => {
      const matchOrigem = !filtrosAplicados.origem || lead.origem === filtrosAplicados.origem;
      const matchStatus = !filtrosAplicados.status || lead.status === filtrosAplicados.status;
      const matchBusca =
        !filtrosAplicados.busca ||
        lead.nome?.toLowerCase().includes(filtrosAplicados.busca.toLowerCase()) ||
        lead.telefone?.includes(filtrosAplicados.busca) ||
        lead.interesse?.toLowerCase().includes(filtrosAplicados.busca.toLowerCase());

      return matchOrigem && matchStatus && matchBusca;
    });
  }, [leads, filtrosAplicados]);

  // Calcular estatísticas baseadas nos leads filtrados
  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    return {
      total: leadsFiltradosPorFiltros.length,
      novosHoje: leadsFiltradosPorFiltros.filter((l) => l.data === hoje).length,
      convertidos: leadsFiltradosPorFiltros.filter((l) => l.status === 'convertido').length,
    };
  }, [leadsFiltradosPorFiltros]);

  // Extrair origens e status únicos
  const origens = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.origem).filter(Boolean)));
  }, [leads]);

  const statusList = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.status).filter(Boolean)));
  }, [leads]);

  // Calcular limites para o widget
  const limites = {
    leads: user?.limits?.leads || 0,
    mensagens: user?.limits?.messages || 0,
    envios: user?.limits?.massMessages || 0,
    usados: {
      leads: user?.usage?.leads || 0,
      mensagens: user?.usage?.messages || 0,
      envios: user?.usage?.massMessages || 0,
    },
  };

  // Calcular dias restantes do trial
  const calcularDiasRestantes = () => {
    if (!user?.trialEndsAt) return null;
    const agora = new Date();
    const fimTrial = new Date(user.trialEndsAt);
    const diffTime = fimTrial.getTime() - agora.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const diasRestantes = calcularDiasRestantes();

  const handleTourComplete = () => {
    localStorage.setItem('leadsflow_tour_completed', 'true');
    setShowTour(false);
    toast.success('🎉 Tour concluído! Agora você conhece todas as funcionalidades!');
  };

  const handleTourSkip = () => {
    localStorage.setItem('leadsflow_tour_completed', 'true');
    setShowTour(false);
    toast.info('Tour pulado. Você pode reiniciá-lo a qualquer momento.');
  };

  const handleStartTour = () => {
    setCurrentPage('dashboard');
    setTimeout(() => {
      setShowTour(true);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar - Desktop sempre visível, Mobile drawer */}
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isMobile={isMobile}
        user={user}
      />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        !isMobile && isSidebarOpen ? 'md:ml-[260px]' : ''
      }`}>
        {/* Header */}
        <RefactoredHeader
          user={user}
          isDark={isDark}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onToggleTheme={handleToggleTheme}
          onNovoLead={handleNovoLead}
          onEmailMarketing={handleEmailMarketing}
          onMassMessage={handleEnvioMassa}
          onSettings={() => setCurrentPage('account')}
          onLogout={onLogout}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onStartTour={handleStartTour}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            {/* Renderizar conteúdo baseado na página atual */}
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
                {/* Widget de Planos */}
                <PlanoWidget
                  limites={limites}
                  diasRestantes={diasRestantes}
                  onUpgrade={handleUpgrade}
                  userPlan={user?.plan || 'free'}
                  isTrial={user?.isTrial || false}
                />

                {/* Cards Principais de Estatísticas */}
                <MainStatsCards
                  totalLeads={stats.total}
                  leadsNovosHoje={stats.novosHoje}
                  leadsFechados={stats.convertidos}
                />

                {/* Cards Secundários */}
                <StatsCards
                  totalLeads={stats.total}
                  leadsNovosHoje={stats.novosHoje}
                  leadsFechados={stats.convertidos}
                  leads={leadsFiltradosPorFiltros}
                  limites={limites}
                />

                {/* Gráficos de Insights */}
                <ChartsSection 
                  leads={leadsFiltradosPorFiltros}
                  origens={origens}
                  status={statusList}
                  onFilterChange={handleAplicarFiltros}
                />

                {/* Seção de Leads Recentes */}
                <RecentLeadsSection
                  leads={leads}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onChat={handleChat}
                  onSendEmail={handleSendEmail}
                />
                
                {/* Barra de Filtros */}
                <FilterBar
                  origens={origens}
                  status={statusList}
                  onFilterChange={setFiltros}
                />

                {/* Tabela de Leads */}
                <LeadsTable
                  leads={leads}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onChat={handleChat}
                  onRefresh={handleAtualizar}
                  onExport={handleExport}
                  onImport={handleImport}
                  onToggleEmailMarketing={handleToggleEmailMarketing}
                  onSendEmail={handleSendEmail}
                  onNovoLead={handleNovoLead}
                  onCampaigns={() => setCurrentPage('campaigns')}
                  onDeleteMultiple={handleDeleteMultiple}
                  userPlan={user?.plan || 'free'}
                  planExpired={false}
                  loading={loading}
                />
              </div>
            )}

            {currentPage === 'leads' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Leads
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gerencie todos os seus leads
                  </p>
                </div>
                
                {/* Cards Principais de Estatísticas */}
                <MainStatsCards
                  totalLeads={stats.total}
                  leadsNovosHoje={stats.novosHoje}
                  leadsFechados={stats.convertidos}
                />

                {/* Cards Secundários */}
                <StatsCards
                  totalLeads={stats.total}
                  leadsNovosHoje={stats.novosHoje}
                  leadsFechados={stats.convertidos}
                  leads={leadsFiltradosPorFiltros}
                  limites={limites}
                />

                {/* Seção de Leads Recentes */}
                <RecentLeadsSection
                  leads={leads}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onChat={handleChat}
                  onSendEmail={handleSendEmail}
                />
                
                {/* Barra de Filtros */}
                <FilterBar
                  origens={origens}
                  status={statusList}
                  onFilterChange={setFiltros}
                />

                {/* Tabela de Leads */}
                <LeadsTable
                  leads={leads}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onChat={handleChat}
                  onRefresh={handleAtualizar}
                  onExport={handleExport}
                  onImport={handleImport}
                  onToggleEmailMarketing={handleToggleEmailMarketing}
                  onSendEmail={handleSendEmail}
                  onNovoLead={handleNovoLead}
                  onCampaigns={() => setCurrentPage('campaigns')}
                  userPlan={user?.plan || 'free'}
                  planExpired={false}
                />
              </div>
            )}

            {currentPage === 'campaigns' && (
              <CampaignsPage 
                onNovoLead={handleNovoLead}
                onEmailMarketing={handleEmailMarketing}
                onMassMessage={handleEnvioMassa}
                leads={leads}
                userPlan={user?.subscription_plan || 'free'}
                user={user}
                onUserUpdate={onUserUpdate}
              />
            )}

            {currentPage === 'plan' && (
              <PlanPage user={user} onUpgrade={handleUpgrade} />
            )}

            {currentPage === 'integrations' && (
              <IntegrationsPage user={user} />
            )}

            {currentPage === 'security' && (
              <SecurityPage user={user} />
            )}

            {currentPage === 'account' && (
              <AccountSettingsPage user={user} onUpdateUser={onUserUpdate} />
            )}

            {currentPage === 'admin' && (
              <AdminPage />
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 mt-12 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <p className="text-center md:text-left">
                  © {new Date().getFullYear()} <span className="font-bold text-gray-900 dark:text-white">LeadsFlow</span> <span className="text-gray-700 dark:text-gray-300">SAAS</span>. Todos os direitos reservados.
                </p>
                <p className="text-center md:text-right">
                  Desenvolvido por <span className="text-blue-600 dark:text-blue-400 font-medium">PersonalCreativeLda</span>
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Modais */}
      <NovoLeadModal
        isOpen={modalNovoLead}
        onClose={() => setModalNovoLead(false)}
        onSave={handleAdicionarLead}
      />

      <EditarLeadModal
        isOpen={modalEditarLead}
        lead={leadSelecionado}
        onClose={() => {
          setModalEditarLead(false);
          setLeadSelecionado(null);
        }}
        onSave={handleEditarLead}
      />

      <ChatModal
        isOpen={modalChat}
        lead={leadSelecionado}
        onClose={() => {
          setModalChat(false);
          setLeadSelecionado(null);
        }}
        webhookUrl=""
      />

      <MassMessageModal
        isOpen={modalMassMessage}
        leads={leads}
        onClose={() => setModalMassMessage(false)}
        webhookUrl=""
        userPlan={user?.plan}
        onUpgrade={() => {
          setModalMassMessage(false);
          setModalUpgrade(true);
        }}
      />

      <UpgradeModal
        isOpen={modalUpgrade}
        onClose={() => setModalUpgrade(false)}
        currentPlan={user?.plan || 'free'}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <SendMessageModal
        isOpen={modalSendMessage}
        onClose={() => {
          setModalSendMessage(false);
          setSelectedLeadsForMessage([]);
        }}
        leadIds={selectedLeadsForMessage}
        leadNames={selectedLeadsForMessage.map(id => {
          const lead = leads.find(l => l.id === id);
          return lead?.nome || 'Lead sem nome';
        })}
        isMassMessage={selectedLeadsForMessage.length > 1}
        userPlan={user?.plan}
        onSuccess={() => {
          carregarLeads();
        }}
      />

      <ImportarLeadsModal
        isOpen={modalImportarLeads}
        onClose={() => setModalImportarLeads(false)}
        onSuccess={carregarLeads}
        userPlan={user?.plan || 'free'}
      />

      <EmailMarketingModalV2
        isOpen={modalEmailMarketing}
        onClose={() => setModalEmailMarketing(false)}
        leads={leads}
        onSendSuccess={() => {
          carregarLeads();
        }}
      />

      <EnviarEmailModal
        isOpen={modalEnviarEmail}
        onClose={() => {
          setModalEnviarEmail(false);
          setLeadSelecionado(null);
        }}
        leadNome={leadSelecionado?.nome || ''}
        leadEmail={leadSelecionado?.email || ''}
        onSend={handleSendEmailSubmit}
      />

      {/* Product Tour - Onboarding */}
      {showTour && (
        <ProductTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {/* Chat Flutuante */}
      <FloatingChat 
        chatWebhookUrl={localStorage.getItem('chat_webhook_url') || ''}
        chatType="n8n"
      />
    </div>
  );
}