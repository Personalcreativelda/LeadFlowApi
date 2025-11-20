import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import type { Lead } from '../../types';

interface NovoLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id'>) => Promise<boolean>;
}

export default function NovoLeadModal({ isOpen, onClose, onSave }: NovoLeadModalProps) {
  const [formData, setFormData] = useState<Lead>({
    nome: '',
    email: '',
    telefone: '',
    interesse: '',
    origem: '',
    status: 'novo',
    agente_atual: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar telefone em tempo real
    if (name === 'telefone') {
      validatePhone(value);
    }
  };

  const validatePhone = (phone: string) => {
    // Remover espaços e caracteres especiais para validação
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanPhone) {
      setPhoneError('');
      return false;
    }

    // Verificar se tem pelo menos 10 dígitos (mínimo razoável com código do país)
    if (cleanPhone.length < 10) {
      setPhoneError('Telefone muito curto. Inclua o código do país.');
      return false;
    }

    // Verificar se começa com + ou se tem apenas números
    if (!cleanPhone.match(/^[+]?\d+$/)) {
      setPhoneError('Use apenas números e opcionalmente + no início');
      return false;
    }

    // Verificar se NÃO começa com código de país comum
    // Se começa com 0, provavelmente é número local sem código do país
    if (cleanPhone.startsWith('0')) {
      setPhoneError('⚠️ Adicione o código do país (ex: 258 para Moçambique)');
      return false;
    }

    // Se tem menos de 11 dígitos e não começa com +, provavelmente falta código do país
    if (cleanPhone.length < 11 && !cleanPhone.startsWith('+')) {
      setPhoneError('⚠️ Adicione o código do país (ex: 258 para Moçambique)');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar telefone antes de enviar
    if (!validatePhone(formData.telefone)) {
      setPhoneError('⚠️ Telefone deve incluir código do país (ex: 258840000000 ou +258840000000)');
      return;
    }
    
    setLoading(true);
    setSuccess(false);

    try {
      const leadComData = {
        ...formData,
        data: new Date().toISOString().split('T')[0], // Save only date part (YYYY-MM-DD)
      };

      console.log('[NovoLeadModal] Submitting lead data:', leadComData);
      const resultado = await onSave(leadComData);
      console.log('[NovoLeadModal] Save result:', resultado);

      if (resultado) {
        setSuccess(true);
        
        // Fechar modal após 1.5s
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        console.error('[NovoLeadModal] Save returned false');
      }
    } catch (error) {
      console.error('[NovoLeadModal] Erro ao salvar lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      interesse: '',
      origem: '',
      status: 'novo',
      agente_atual: '',
      observacoes: '',
    });
    setSuccess(false);
    setPhoneError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl text-gray-900 dark:text-white">➕ Adicionar Novo Lead</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Lead adicionado com sucesso! ✓</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nome e Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="joao@email.com"
                />
              </div>
            </div>

            {/* Telefone e Interesse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    phoneError 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="258840000000 ou +258840000000"
                />
                {phoneError ? (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{phoneError}</span>
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    📱 Obrigatório incluir código do país (ex: 258 para Moçambique)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Interesse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="interesse"
                  value={formData.interesse}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Máquina de corte a laser"
                />
              </div>
            </div>

            {/* Origem e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Origem <span className="text-red-500">*</span>
                </label>
                <select
                  name="origem"
                  value={formData.origem}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione...</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="site">Site</option>
                  <option value="indicacao">Indicação</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="novo">Novo</option>
                  <option value="qualificado">Qualificado</option>
                  <option value="em_negociacao">Em Negociação</option>
                  <option value="aguardando_resposta">Aguardando Resposta</option>
                  <option value="convertido">Convertido</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>
            </div>

            {/* Agente Responsável */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Agente Responsável
              </label>
              <input
                type="text"
                name="agente_atual"
                value={formData.agente_atual}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Maria Silva"
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Adicione notas sobre este lead..."
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end sticky bottom-0 bg-white dark:bg-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>💾 Salvar Lead</>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}