import { Edit, Trash2, MessageCircle, RefreshCw, Download, Upload, Mail, CheckSquare, Search, Plus, Megaphone, Square } from 'lucide-react';
import { useState } from 'react';
import type { Lead } from '../../types';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onChat: (index: number) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleEmailMarketing?: (index: number) => void;
  onSendEmail?: (index: number) => void;
  onNovoLead?: () => void;
  onCampaigns?: () => void;
  onDeleteMultiple?: (indices: number[]) => void;
  userPlan?: 'free' | 'business' | 'enterprise';
  planExpired?: boolean;
  loading?: boolean;
}

export default function LeadsTable({ 
  leads, 
  onEdit, 
  onDelete, 
  onChat,
  onRefresh,
  onExport,
  onImport,
  onToggleEmailMarketing,
  onSendEmail,
  onNovoLead,
  onCampaigns,
  onDeleteMultiple,
  userPlan,
  planExpired,
  loading
}: LeadsTableProps) {
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const LEADS_POR_PAGINA = 10;

  // Filtrar leads pela busca
  const leadsFiltrados = leads.filter((lead) => {
    if (!busca) return true;
    
    const buscaLower = busca.toLowerCase();
    return (
      lead.nome?.toLowerCase().includes(buscaLower) ||
      lead.telefone?.includes(busca) ||
      lead.email?.toLowerCase().includes(buscaLower) ||
      lead.interesse?.toLowerCase().includes(buscaLower) ||
      lead.origem?.toLowerCase().includes(buscaLower) ||
      lead.status?.toLowerCase().includes(buscaLower)
    );
  });

  // Calcular paginação
  const totalPaginas = Math.ceil(leadsFiltrados.length / LEADS_POR_PAGINA);
  const indexInicio = (paginaAtual - 1) * LEADS_POR_PAGINA;
  const indexFim = indexInicio + LEADS_POR_PAGINA;
  const leadsExibidos = leadsFiltrados.slice(indexInicio, indexFim);

  // Resetar página ao filtrar
  const handleBuscaChange = (valor: string) => {
    setBusca(valor);
    setPaginaAtual(1);
  };

  // Funções de seleção múltipla
  const toggleSelectLead = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leadsFiltrados.length) {
      setSelectedLeads(new Set());
    } else {
      const allIndices = leadsFiltrados.map((_, idx) => {
        return leads.findIndex(l => l.id === leadsFiltrados[idx].id);
      });
      setSelectedLeads(new Set(allIndices));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.size === 0) return;
    
    if (!confirm(`Tem certeza que deseja deletar ${selectedLeads.size} lead(s) selecionado(s)?`)) {
      return;
    }
    
    if (onDeleteMultiple) {
      onDeleteMultiple(Array.from(selectedLeads));
      setSelectedLeads(new Set());
    }
  };

  const allSelected = leadsFiltrados.length > 0 && selectedLeads.size === leadsFiltrados.length;

  // Funções de navegação
  const irParaPagina = (pagina: number) => {
    setPaginaAtual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  // Gerar botões de paginação
  const gerarBotoesPaginacao = () => {
    const botoes: (number | string)[] = [];
    const maxBotoes = 5;
    
    if (totalPaginas <= maxBotoes) {
      for (let i = 1; i <= totalPaginas; i++) {
        botoes.push(i);
      }
    } else {
      if (paginaAtual <= 3) {
        botoes.push(1, 2, 3, 4, '...', totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        botoes.push(1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
      } else {
        botoes.push(1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas);
      }
    }
    
    return botoes;
  };

  // Formatar data
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    
    const statusStyles: Record<string, string> = {
      novo: 'bg-blue-100 text-blue-700',
      qualificado: 'bg-blue-100 text-blue-600',
      'em negociacao': 'bg-amber-100 text-amber-700',
      'em_negociacao': 'bg-amber-100 text-amber-700',
      aguardando: 'bg-amber-100 text-amber-700',
      'aguardando_resposta': 'bg-amber-100 text-amber-700',
      fechado: 'bg-green-100 text-green-700',
      convertido: 'bg-green-100 text-green-700',
      perdido: 'bg-red-100 text-red-700',
    };

    let className = 'bg-indigo-100 text-indigo-700';
    
    for (const [key, value] of Object.entries(statusStyles)) {
      if (s.includes(key)) {
        className = value;
        break;
      }
    }

    return (
      <span className={`inline-block px-3 py-1 rounded-md text-xs ${className}`}>
        {status}
      </span>
    );
  };

  // Verificar se pode importar - HABILITADO PARA TODOS OS PLANOS
  const canImport = true; // Todos os planos podem importar, o limite é controlado na importação
  const isExpired = planExpired === true;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      
      {/* Header da Tabela - Desktop e Mobile com layouts diferentes */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        
        {/* Layout Mobile */}
        <div className="block md:hidden space-y-3">
          {/* Título */}
          <h3 className="text-gray-900 dark:text-white">Tabela de Leads</h3>
          
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => handleBuscaChange(e.target.value)}
              placeholder="Buscar leads..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
          </div>
          
          {/* Botões de Ação - Mobile (apenas ícones) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {onNovoLead && (
              <button
                onClick={onNovoLead}
                className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                title="Adicionar Leads"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Atualizar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors shadow-sm"
                title="Exportar"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            
            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors shadow-sm"
                title="Importar"
              >
                <Upload className="w-5 h-5" />
              </button>
            )}
            
            {onCampaigns && (
              <button
                onClick={onCampaigns}
                className="flex items-center justify-center min-w-[40px] h-10 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                title="Campanhas"
              >
                <Megaphone className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Layout Desktop */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-4 mb-3">
            <h3 className="text-gray-900 dark:text-white">Tabela de Leads</h3>
            
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => handleBuscaChange(e.target.value)}
                placeholder="Buscar leads..."
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          
          {/* Botões de Ação - Desktop (com texto) */}
          <div className="flex flex-wrap gap-2">
            {onNovoLead && (
              <button
                onClick={onNovoLead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Leads</span>
              </button>
            )}
            
            {selectedLeads.size > 0 && onDeleteMultiple && (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Deletar Selecionados ({selectedLeads.size})</span>
              </button>
            )}
            
            {selectedLeads.size > 0 && (
              <button
                onClick={() => setSelectedLeads(new Set())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors shadow-sm"
              >
                <Square className="w-4 h-4" />
                <span>Limpar Seleção</span>
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            )}
            
            {onImport && (
              <button
                onClick={onImport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </button>
            )}
            
            {onCampaigns && (
              <button
                onClick={onCampaigns}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Megaphone className="w-4 h-4" />
                <span>Campanhas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wrapper da Tabela */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-white dark:bg-gray-800">
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="px-4 py-4 text-left" style={{ width: '50px' }}>
                <button
                  onClick={toggleSelectAll}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Data
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Telefone
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Interesse
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Origem
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400" style={{ width: '140px' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {leadsExibidos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Nenhum lead encontrado. Adicione seu primeiro lead!
                </td>
              </tr>
            ) : (
              leadsExibidos.map((lead, displayIndex) => {
                const leadIndex = leads.findIndex(l => l.id === lead.id);
                const isSelected = selectedLeads.has(leadIndex);
                
                return (
                <tr
                  key={displayIndex}
                  className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : lead.marcado_email 
                      ? 'bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onMouseEnter={() => setHoveredRow(displayIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleSelectLead(leadIndex)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title={isSelected ? 'Desmarcar' : 'Selecionar'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(lead.data)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      {lead.nome || '-'}
                      {lead.marcado_email && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {lead.telefone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {lead.interesse || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {lead.origem || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* Botão de enviar email individual (aparece no hover se tiver email) */}
                      {lead.email && hoveredRow === displayIndex && onSendEmail && (
                        <button
                          onClick={() => onSendEmail(leadIndex)}
                          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                          title="Enviar Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {/* Botão de marcar para email marketing em massa */}
                      {lead.email && hoveredRow === displayIndex && onToggleEmailMarketing && (
                        <button
                          onClick={() => onToggleEmailMarketing(leadIndex)}
                          className={`p-2 border rounded-lg transition-all ${
                            lead.marcado_email
                              ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                          title={lead.marcado_email ? 'Remover da lista de envio em massa' : 'Marcar para envio em massa'}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onChat(leadIndex)}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(leadIndex)}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(leadIndex)}
                        className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Barra de Paginação */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        {/* Contador de resultados */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {leadsFiltrados.length > 0 ? indexInicio + 1 : 0} a {Math.min(indexFim, leadsFiltrados.length)} de {leadsFiltrados.length} resultados
        </div>
        
        {/* Botões de Paginação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => irParaPagina(paginaAtual - 1)}
            className={`px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-gray-700 dark:text-gray-300 ${
              paginaAtual === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>
          
          <div className="flex gap-1">
            {gerarBotoesPaginacao().map((botao, idx) => (
              <button
                key={`${botao}-${idx}`}
                onClick={() => typeof botao === 'number' && irParaPagina(botao)}
                className={`min-w-[36px] px-3 py-1.5 text-sm rounded-lg transition-all ${
                  botao === paginaAtual 
                    ? 'bg-blue-600 text-white' 
                    : typeof botao === 'number'
                    ? 'border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 cursor-default'
                }`}
                disabled={typeof botao !== 'number'}
              >
                {botao}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => irParaPagina(paginaAtual + 1)}
            className={`px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all text-gray-700 dark:text-gray-300 ${
              paginaAtual === totalPaginas || totalPaginas === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
          >
            Próximo
          </button>
        </div>
      </div>
      
    </div>
  );
}