import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import type { WebhookConfig } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WebhookConfig;
  onSave: (config: WebhookConfig) => void;
  userEmail: string;
}

export default function SettingsModal({ isOpen, onClose, currentConfig, onSave, userEmail }: SettingsModalProps) {
  const [config, setConfig] = useState<WebhookConfig>(currentConfig);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
      setSuccess(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleChange = (field: keyof WebhookConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try {
      // Salvar configurações específicas do usuário
      const todasConfigs = JSON.parse(localStorage.getItem('crm_todas_configuracoes') || '{}');
      todasConfigs[userEmail] = config;
      localStorage.setItem('crm_todas_configuracoes', JSON.stringify(todasConfigs));

      onSave(config);
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    }
  };

  const handleTest = () => {
    let configurados = 0;
    const total = 6;

    Object.values(config).forEach(value => {
      if (typeof value === 'string' && value.trim() !== '') {
        configurados++;
      }
    });

    if (configurados === 0) {
      alert('❌ Nenhum webhook configurado!\n\nConfigure pelo menos um webhook para começar a usar o sistema.');
    } else if (configurados < total) {
      alert(`⚠️ Configuração parcial!\n\n${configurados} de ${total} webhooks configurados.\n\nAlgumas funcionalidades podem não estar disponíveis.`);
    } else {
      alert('✅ Todos os webhooks configurados!\n\nO sistema está pronto para uso completo.');
    }
  };

  const getStatusBadge = (value?: string) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return (
        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
          ✓ Configurado
        </span>
      );
    }
    return (
      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">
        ⚠ Não configurado
        </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl text-gray-900">⚙️ Configurações do Sistema</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          
          {/* Alert Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              Configure as URLs dos webhooks do N8N e a instância Evolution API para integração completa do sistema.
            </div>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Configurações salvas com sucesso! ✓</span>
            </div>
          )}

          <form className="space-y-6">
            
            {/* Seção: Gestão de Leads */}
            <div>
              <h4 className="text-gray-900 mb-4">📡 Webhooks N8N - Gestão de Leads</h4>
              
              <div className="space-y-4">
                {/* Cadastrar */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    🆕 Webhook - Cadastrar Novo Lead
                    {getStatusBadge(config.cadastrar)}
                  </label>
                  <input
                    type="url"
                    value={config.cadastrar}
                    onChange={(e) => handleChange('cadastrar', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/novo-lead"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint POST para criar novos leads na planilha</p>
                </div>

                {/* Editar */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    ✏️ Webhook - Editar Lead
                    {getStatusBadge(config.editar)}
                  </label>
                  <input
                    type="url"
                    value={config.editar}
                    onChange={(e) => handleChange('editar', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/editar-lead"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint PUT para atualizar leads existentes</p>
                </div>

                {/* Deletar */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    🗑️ Webhook - Deletar Lead
                    {getStatusBadge(config.deletar)}
                  </label>
                  <input
                    type="url"
                    value={config.deletar}
                    onChange={(e) => handleChange('deletar', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/deletar-lead"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint DELETE para remover leads da planilha</p>
                </div>

                {/* Listar */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    📋 Webhook - Listar Todos os Leads
                    {getStatusBadge(config.listar)}
                  </label>
                  <input
                    type="url"
                    value={config.listar}
                    onChange={(e) => handleChange('listar', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/listar-leads"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint GET para carregar todos os leads da planilha</p>
                </div>
              </div>
            </div>

            {/* Seção: WhatsApp */}
            <div>
              <h4 className="text-gray-900 mb-4 pt-4 border-t border-gray-200">💬 Webhooks N8N - WhatsApp</h4>
              
              <div className="space-y-4">
                {/* Enviar Mensagem */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    💬 Webhook - Enviar Mensagem Individual
                    {getStatusBadge(config.enviarMsg)}
                  </label>
                  <input
                    type="url"
                    value={config.enviarMsg}
                    onChange={(e) => handleChange('enviarMsg', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/enviar-mensagem"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint POST para enviar mensagem individual via WhatsApp</p>
                </div>

                {/* Enviar em Massa */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    📤 Webhook - Enviar Mensagem em Massa
                    {getStatusBadge(config.enviarMassa)}
                  </label>
                  <input
                    type="url"
                    value={config.enviarMassa}
                    onChange={(e) => handleChange('enviarMassa', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://seu-n8n.com/webhook/enviar-massa"
                  />
                  <p className="mt-1 text-xs text-gray-500">Endpoint POST para enviar mensagens em massa via WhatsApp</p>
                </div>
              </div>

              {/* Info adicional */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>Como funciona:</strong> Os webhooks de WhatsApp são processados pelo N8N que se conecta com a Evolution API ou outra API de WhatsApp de sua preferência.
                </div>
              </div>
            </div>

            {/* Dica Final */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <strong>Dica:</strong> Configure primeiro os webhooks N8N e depois a Evolution API para ter todas as funcionalidades ativas.
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
          >
            🧪 Testar Webhooks
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            💾 Salvar Configurações
          </Button>
        </div>

      </div>
    </div>
  );
}
