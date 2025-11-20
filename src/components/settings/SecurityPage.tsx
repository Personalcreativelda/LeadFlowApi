import { useState } from 'react';
import { Shield, Key, Smartphone, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface SecurityPageProps {
  user: any;
}

export default function SecurityPage({ user }: SecurityPageProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const sessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'São Paulo, Brasil',
      lastActive: '2 minutos atrás',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'São Paulo, Brasil',
      lastActive: '2 horas atrás',
      current: false,
    },
  ];

  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    toast.success('Autenticação de dois fatores ativada!');
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    toast.success('Autenticação de dois fatores desativada!');
  };

  const handleRevokeSession = (sessionId: string) => {
    toast.success('Sessão encerrada com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Segurança
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie a segurança da sua conta
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Autenticação de Dois Fatores
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Adicione uma camada extra de segurança à sua conta
              </p>
              <div className="flex items-center gap-2">
                {twoFactorEnabled ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Ativado</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">Desativado</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
            variant={twoFactorEnabled ? 'outline' : 'default'}
            className={twoFactorEnabled ? '' : 'bg-green-600 hover:bg-green-700 text-white'}
          >
            {twoFactorEnabled ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Chaves de API
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie suas chaves de acesso à API
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Chave Principal
            </span>
            <span className="text-xs text-gray-500">Criada em 15 nov 2024</span>
          </div>
          <code className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            lf_sk_xxxxxxxxxxxxxxxxxxxxxxxx
          </code>
        </div>

        <Button variant="outline" className="w-full">
          Gerar Nova Chave
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Sessões Ativas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dispositivos conectados à sua conta
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.device}
                  </span>
                  {session.current && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                      Atual
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {session.location} • {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <Button
                  onClick={() => handleRevokeSession(session.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Encerrar
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}