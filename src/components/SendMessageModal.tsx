import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, Wifi, WifiOff, AlertCircle, Rocket, Crown, Info } from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
  leadNames: string[];
  isMassMessage: boolean;
  onSuccess?: () => void;
  userPlan?: 'free' | 'business' | 'enterprise';
}

export function SendMessageModal({
  isOpen,
  onClose,
  leadIds,
  leadNames,
  isMassMessage,
  onSuccess,
  userPlan,
}: SendMessageModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [useN8NWebhook, setUseN8NWebhook] = useState(false);
  
  // Check if user is Enterprise
  const isEnterprise = userPlan === 'enterprise';

  // Check connection when modal opens
  useEffect(() => {
    if (isOpen) {
      checkWhatsAppConnection();
    }
  }, [isOpen]);

  const checkWhatsAppConnection = async () => {
    setCheckingConnection(true);
    try {
      const token = localStorage.getItem('leadflow_access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      console.log('WhatsApp connection check response:', data);
      
      // Check if connected based on the response
      if (data.success && data.connected === true) {
        setConnectionStatus('connected');
        setError(null);
      } else {
        setConnectionStatus('disconnected');
        
        // Provide specific error message based on status
        if (data.status === 'disconnected' || data.status === 'no connection') {
          setError('WhatsApp não conectado. Vá em Configurações > Integrações para escanear o QR Code e conectar sua conta WhatsApp.');
        } else if (data.status === 'pending') {
          setError('WhatsApp em processo de conexão. Aguarde alguns segundos e tente novamente.');
        } else {
          setError('WhatsApp não está conectado. Vá em Configurações > Integrações para conectar.');
        }
      }
    } catch (err: any) {
      console.error('Error checking WhatsApp connection:', err);
      setConnectionStatus('disconnected');
      setError('Erro ao verificar conexão do WhatsApp. Verifique se você já conectou sua conta WhatsApp nas Configurações.');
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Por favor, digite uma mensagem');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      if (isMassMessage && useN8NWebhook) {
        // Send via N8N Webhook (Enterprise only)
        await handleN8NWebhookSend();
      } else if (isMassMessage) {
        // Mass message - use correct endpoint
        const response = await apiRequest('/whatsapp/send-mass', 'POST', {
          leadIds,
          message: message.trim(),
        });

        if (response.success) {
          setSuccess(true);
          setSummary(response.summary);
          toast.success(
            `Mensagem enviada para ${response.summary.successful} de ${response.summary.total} leads!`
          );
          
          // Wait 2 seconds before closing
          setTimeout(() => {
            handleClose();
            if (onSuccess) onSuccess();
          }, 2000);
        } else {
          throw new Error(response.error || 'Erro ao enviar mensagens');
        }
      } else {
        // Individual message - need to get lead data first
        const lead = await apiRequest(`/leads/${leadIds[0]}`, 'GET');
        
        console.log('[SendMessageModal] Lead data:', lead);
        
        // Check for both Portuguese and English field names
        const phone = lead.telefone || lead.phone;
        
        if (!lead || !phone) {
          throw new Error('Lead não encontrado ou sem telefone cadastrado');
        }

        const response = await apiRequest('/whatsapp/send', 'POST', {
          phone: phone,
          message: message.trim(),
          leadId: leadIds[0],
        });

        if (response.success) {
          setSuccess(true);
          toast.success('Mensagem enviada com sucesso!');
          
          // Wait 1 second before closing
          setTimeout(() => {
            handleClose();
            if (onSuccess) onSuccess();
          }, 1000);
        } else {
          throw new Error(response.error || 'Erro ao enviar mensagem');
        }
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      const errorMessage = err.message || err.error || 'Erro ao enviar mensagem';
      setError(errorMessage);
      
      // Show specific error for WhatsApp not connected
      if (errorMessage.includes('WhatsApp not connected') || errorMessage.includes('WhatsApp não conectado')) {
        setError('WhatsApp não conectado! Vá em Configurações > Integrações para conectar seu WhatsApp escaneando o QR Code.');
        toast.error('WhatsApp não conectado! Configure nas Integrações.');
      } else if (errorMessage.includes('limit reached') || errorMessage.includes('limit')) {
        setError('Limite de mensagens atingido! Faça upgrade do seu plano.');
        toast.error('Limite de mensagens atingido! Faça upgrade do seu plano.');
      } else if (errorMessage.includes('não está registrado no WhatsApp') || errorMessage.includes('not registered')) {
        toast.error('Este número não está registrado no WhatsApp. Verifique o telefone do lead.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSending(false);
    }
  };
  
  const handleN8NWebhookSend = async () => {
    // Get webhook URL from localStorage
    const webhookUrl = localStorage.getItem('n8n_mass_webhook_url');
    
    if (!webhookUrl) {
      throw new Error('Configure o webhook N8N nas Configurações > Integrações primeiro!');
    }

    console.log('[N8N Webhook] Sending to:', webhookUrl);
    console.log('[N8N Webhook] Lead IDs:', leadIds);

    // Get token for fetching leads
    const token = localStorage.getItem('leadflow_access_token');
    
    // Get all leads data with phones
    const leadsData = [];
    for (const leadId of leadIds) {
      try {
        const leadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/leads/${leadId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (leadResponse.ok) {
          const lead = await leadResponse.json();
          if (lead.telefone || lead.phone) {
            leadsData.push({
              id: lead.id,
              name: lead.nome || lead.name,
              phone: lead.telefone || lead.phone,
              email: lead.email,
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching lead ${leadId}:`, err);
      }
    }

    if (leadsData.length === 0) {
      throw new Error('Nenhum lead com telefone válido encontrado');
    }

    // Send to N8N webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leads: leadsData,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        source: 'LeadsFlow CRM',
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Erro ao enviar para N8N: ${webhookResponse.statusText}`);
    }

    const result = await webhookResponse.json();
    
    setSuccess(true);
    setSummary({
      total: leadsData.length,
      successful: result.sent || leadsData.length,
      failed: result.failed || 0,
    });
    
    toast.success(
      `Envio em massa via N8N iniciado! ${leadsData.length} mensagens serão processadas.`
    );
    
    // Wait 2 seconds before closing
    setTimeout(() => {
      handleClose();
      if (onSuccess) onSuccess();
    }, 2000);
  };

  const handleClose = () => {
    setMessage('');
    setError(null);
    setSuccess(false);
    setSummary(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {isMassMessage ? 'Enviar Mensagem em Massa' : 'Enviar Mensagem'}
          </DialogTitle>
          <DialogDescription>
            {isMassMessage
              ? `Enviar mensagem para ${leadIds.length} lead${leadIds.length > 1 ? 's' : ''}`
              : `Enviar mensagem para ${leadNames[0]}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* WhatsApp Connection Status */}
          <div className="rounded-lg border bg-gray-50 dark:bg-gray-800 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">✅ WhatsApp Conectado</span>
                  </>
                ) : connectionStatus === 'disconnected' ? (
                  <>
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 dark:text-red-400">❌ WhatsApp Desconectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">⏳ Verificando...</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkWhatsAppConnection}
                disabled={checkingConnection}
              >
                {checkingConnection ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Conexão'
                )}
              </Button>
            </div>
            {connectionStatus === 'disconnected' && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                  <strong>⚠️ Atenção:</strong> Seu WhatsApp não está conectado!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Como conectar:</strong>
                </p>
                <ol className="text-xs text-amber-700 dark:text-amber-300 ml-4 mt-1 space-y-1">
                  <li>1. Clique no ícone de <strong>Configurações</strong> (⚙️) no topo do Dashboard</li>
                  <li>2. Vá até a aba <strong>Integrações</strong></li>
                  <li>3. Clique em <strong>"Conectar WhatsApp"</strong></li>
                  <li>4. Escaneie o <strong>QR Code</strong> com seu WhatsApp</li>
                </ol>
              </div>
            )}
          </div>

          {/* N8N Webhook Toggle (Enterprise Only) */}
          {isMassMessage && isEnterprise && (
            <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <Rocket className="h-4 w-4 text-purple-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-purple-900 dark:text-purple-100 mb-1 flex items-center gap-2">
                      <strong>🚀 Envio via Webhook N8N</strong>
                      <Crown className="w-4 h-4 text-amber-500" />
                    </p>
                    <p className="text-xs text-purple-800 dark:text-purple-200">
                      Ative para enviar dados para seu workflow N8N automatizar o envio via Evolution API
                    </p>
                  </div>
                  <Switch
                    checked={useN8NWebhook}
                    onCheckedChange={setUseN8NWebhook}
                    disabled={sending || success}
                  />
                </div>
                {useN8NWebhook && (
                  <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                    <p className="text-xs text-blue-900 dark:text-blue-100 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <strong>Como funciona:</strong>
                    </p>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 ml-4 mt-1 space-y-1">
                      <li>• Dados dos leads serão enviados para seu webhook N8N</li>
                      <li>• Seu workflow N8N processa e envia via Evolution API</li>
                      <li>• Usa a instância WhatsApp conectada via QR Code</li>
                      <li>• Configure o webhook em Configurações → Integrações</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Recipients preview */}
          {isMassMessage && leadNames.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm mb-2">Destinatários:</p>
              <div className="text-sm text-muted-foreground max-h-24 overflow-y-auto">
                {leadNames.slice(0, 5).map((name, index) => (
                  <div key={index}>• {name}</div>
                ))}
                {leadNames.length > 5 && (
                  <div className="text-xs mt-1">
                    + {leadNames.length - 5} mais...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={sending || success}
            />
            <p className="text-xs text-muted-foreground">
              {message.length} caracteres
            </p>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>{error}</p>
                  {error.includes('não está registrado no WhatsApp') && (
                    <p className="text-xs mt-2">
                      💡 Dica: Verifique se o número do lead está correto e possui WhatsApp ativo.
                      Vá em "Editar Lead" para corrigir o telefone.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                {isMassMessage && summary ? (
                  <div>
                    <p className="font-medium mb-1">Mensagens enviadas!</p>
                    <p className="text-sm">
                      ✓ {summary.successful || summary.sent || 0} enviadas com sucesso
                      {(summary.failed > 0) && (
                        <> • ✗ {summary.failed} falharam</>
                      )}
                    </p>
                  </div>
                ) : (
                  'Mensagem enviada com sucesso!'
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning about delays */}
          {isMassMessage && leadIds.length > 10 && !sending && !success && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                O envio em massa pode demorar alguns minutos. As mensagens são enviadas
                com intervalo de 1-2 segundos entre cada uma para evitar bloqueio.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || success || !message.trim() || connectionStatus !== 'connected'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Enviado!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {isMassMessage && `(${leadIds.length})`}
                </>
              )}
            </Button>
          </div>
          
          {/* Helper text when WhatsApp not connected */}
          {connectionStatus === 'disconnected' && (
            <p className="text-xs text-center text-muted-foreground">
              💡 O botão de envio será habilitado após conectar o WhatsApp
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}