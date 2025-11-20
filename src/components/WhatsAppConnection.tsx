import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { QrCode, CheckCircle, Loader2, XCircle, RefreshCw, Smartphone } from 'lucide-react';

interface WhatsAppStatus {
  status: 'disconnected' | 'pending' | 'connecting' | 'connected';
  connected: boolean;
  instanceName?: string;
  profileName?: string;
  profilePictureUrl?: string;
  apikey?: string;
}

export function WhatsAppConnection() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'disconnected',
    connected: false,
  });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Start polling when QR modal is open OR when status is pending/connecting
    if (showQrModal || status.status === 'pending' || status.status === 'connecting') {
      console.log('[WhatsApp Polling] Starting aggressive polling - Modal open:', showQrModal, 'Status:', status.status);
      
      // Poll every 2 seconds for faster detection
      interval = setInterval(() => {
        console.log('[WhatsApp Polling] Polling status check...');
        checkStatus();
      }, 2000);
    }

    return () => {
      if (interval) {
        console.log('[WhatsApp Polling] Stopping polling');
        clearInterval(interval);
      }
    };
  }, [showQrModal, status.status]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('leadflow_access_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('leadflow_access_token');
      if (!token) {
        console.log('WhatsApp: No token available, skipping status check');
        return;
      }

      console.log('[WhatsApp Status Check] Starting status check...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/status`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.error('[WhatsApp Status Check] Failed to check WhatsApp status - Response not OK:', response.status);
        // Don't set error state, just return - instance may not exist yet
        return;
      }

      const data = await response.json();
      console.log('[WhatsApp Status Check] Status check response:', data);
      
      // DEBUG: Log the exact response structure
      console.log('[WhatsApp Status Check] DEBUG - Response breakdown:');
      console.log('  - data.connected:', data.connected);
      console.log('  - data.status:', data.status);
      console.log('  - data.instanceState:', data.instanceState);
      console.log('  - data.instanceName:', data.instanceName);
      
      // Check if just became connected (was not connected before)
      const wasNotConnected = !status.connected;
      const isNowConnected = data.connected;
      const isConnecting = data.status === 'connecting' || data.instanceState === 'connecting';
      
      console.log(`[WhatsApp Status Check] Status transition - Was: ${status.status}, Now: ${data.status}, Connected: ${isNowConnected}, Connecting: ${isConnecting}`);
      
      // Update status with proper mapping
      setStatus({
        status: data.status || (data.connected ? 'connected' : 'disconnected'),
        connected: data.connected || false,
        instanceName: data.instanceName,
        profileName: data.profileName,
        profilePictureUrl: data.profilePictureUrl,
        apikey: data.apikey,
      });

      // Salvar apikey no localStorage se disponível
      if (data.apikey) {
        localStorage.setItem('evolution_api_key', data.apikey);
      }

      // Show connecting feedback
      if (isConnecting && !isNowConnected && showQrModal) {
        console.log('[WhatsApp Status Check] Connecting detected - showing feedback');
        toast.info('Conectando WhatsApp...', {
          description: 'QR Code escaneado! Aguarde a confirmação.',
          duration: 2000,
        });
      }

      // If just connected, close modal and show success
      if (isNowConnected && wasNotConnected) {
        console.log('[WhatsApp Status Check] ✅ WhatsApp CONNECTED! Closing modal and showing success...');
        
        if (showQrModal) {
          setShowQrModal(false);
        }
        
        setQrCode(null);
        setError(null);
        
        toast.success('WhatsApp conectado com sucesso! 🎉', {
          description: 'Agora você pode enviar mensagens para seus leads.',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('[WhatsApp Status Check] Check status error:', err);
      // Don't set error state for status check failures
    }
  };

  const connectWhatsApp = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[WhatsApp Connect] Initiating connection...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/connect`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();
      console.log('[WhatsApp Connect] Connect response:', data);

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        console.error('Connect error details:', data);
        throw new Error(errorMsg || 'Failed to connect WhatsApp');
      }

      // Check if QR code is returned directly
      if (data.qrCode) {
        console.log('[WhatsApp Connect] QR Code received, showing modal');
        setQrCode(data.qrCode);
        setShowQrModal(true);
        setStatus({ status: 'pending', connected: false });
        
        // Start checking status immediately after showing QR
        setTimeout(() => {
          console.log('[WhatsApp Connect] Starting initial status check after QR code display');
          checkStatus();
        }, 1000);
      } else if (data.status === 'connected' || data.connected) {
        console.log('[WhatsApp Connect] Already connected');
        setStatus({ status: 'connected', connected: true });
        setError(null);
        toast.success('WhatsApp já está conectado!');
      } else {
        // Fallback: Get QR code separately
        console.log('[WhatsApp Connect] No QR code in response, fetching separately');
        await getQrCode();
        setShowQrModal(true);
        setStatus({ status: 'pending', connected: false });
      }
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Erro ao conectar WhatsApp');
      toast.error('Erro ao conectar WhatsApp', {
        description: err.message || 'Tente novamente em alguns instantes.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getQrCode = async () => {
    setPolling(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/qrcode`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get QR code');
      }

      if (data.base64) {
        setQrCode(data.base64);
      } else if (data.qrcode) {
        setQrCode(data.qrcode);
      }
    } catch (err: any) {
      console.error('Get QR code error:', err);
      setError(err.message || 'Erro ao obter QR code');
    } finally {
      setPolling(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/whatsapp/disconnect`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect WhatsApp');
      }

      setStatus({
        status: 'disconnected',
        connected: false,
      });
      
      toast.success('WhatsApp desconectado com sucesso');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      setError(err.message || 'Erro ao desconectar WhatsApp');
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Smartphone className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">WhatsApp</h3>
              <div className="flex items-center gap-2 mb-2">
                {status.connected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Conectado</span>
                  </>
                ) : status.status === 'connecting' ? (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-blue-600">Conectando...</span>
                  </>
                ) : status.status === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                    <span className="text-yellow-600">Aguardando QR Code...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Desconectado</span>
                  </>
                )}
              </div>
              {status.profileName && (
                <p className="text-sm text-muted-foreground">
                  Conta: {status.profileName}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {status.connected
                  ? 'Seu WhatsApp está conectado e pronto para enviar mensagens.'
                  : status.status === 'connecting'
                  ? 'QR Code escaneado! Finalizando conexão...'
                  : status.status === 'pending'
                  ? 'Escaneie o QR Code para conectar.'
                  : 'Conecte seu WhatsApp para enviar mensagens aos seus leads.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status.connected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnectWhatsApp}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Desconectar'
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={connectWhatsApp}
                disabled={loading || status.status === 'connecting'}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkStatus}
              disabled={polling}
            >
              <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Conectar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo com seu WhatsApp para conectar sua conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Toque em Mais opções (⋮) &gt; Aparelhos conectados</li>
              <li>Toque em "Conectar um aparelho"</li>
              <li>Aponte seu celular para esta tela para escanear o código</li>
            </ol>

            {qrCode ? (
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-64 h-64"
                />
                {status.status === 'connecting' ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando... Aguarde!</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mt-4">
                    Aguardando escaneamento...
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-gray-50 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Gerando QR Code...</p>
              </div>
            )}

            <Alert>
              <AlertDescription className="text-xs">
                O QR Code expira após alguns minutos. Se não conseguir conectar,
                feche esta janela e tente novamente.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}