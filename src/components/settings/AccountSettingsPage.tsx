import { useState } from 'react';
import { Upload, User, Lock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

interface AccountSettingsPageProps {
  user: any;
  onUpdateUser: (updates: any) => void;
}

type TabType = 'avatar' | 'name' | 'password';

export default function AccountSettingsPage({ user, onUpdateUser }: AccountSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('avatar');
  const [loading, setLoading] = useState(false);
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Name state
  const [name, setName] = useState(user?.name || '');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) {
      toast.error('Selecione uma imagem');
      return;
    }

    setLoading(true);
    try {
      // Simulate upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onUpdateUser({ ...user, avatar: avatarPreview });
      toast.success('Avatar atualizado com sucesso!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error('Erro ao atualizar avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdateUser({ ...user, name });
      toast.success('Nome atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar nome');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'avatar' as TabType, label: 'Avatar', icon: Upload },
    { id: 'name' as TabType, label: 'Nome', icon: User },
    { id: 'password' as TabType, label: 'Senha', icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Configurações da Conta
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas informações pessoais e segurança
        </p>
      </div>

      {/* Tabs - Estilo minimalista do pricing */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {activeTab === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Alterar Avatar
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Atualize sua foto de perfil
              </p>
            </div>

            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name || 'User'} />
                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Escolher Arquivo
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            {avatarFile && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAvatar}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Avatar'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'name' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Alterar Nome
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Atualize seu nome de exibição
              </p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveName}
                  disabled={loading || name === user?.name}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Nome'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Alterar Senha
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Atualize sua senha de acesso
              </p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-sm">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="text-sm">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}