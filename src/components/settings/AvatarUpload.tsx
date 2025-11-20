import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import { Upload, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui/button';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, userName, onAvatarUpdate }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  // Update preview when currentAvatar changes (e.g., after login)
  useEffect(() => {
    console.log('[AvatarUpload] currentAvatar changed:', currentAvatar ? 'exists' : 'null');
    setPreview(currentAvatar || null);
  }, [currentAvatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 2MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('avatar', file);

      const accessToken = localStorage.getItem('leadflow_access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4be966ab/users/avatar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Avatar upload failed:', errorData);
        const errorMessage = errorData.error || 'Failed to upload avatar';
        toast.error(`Erro ao enviar foto: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success || !data.avatarUrl) {
        console.error('Avatar upload - Invalid response:', data);
        throw new Error('Invalid server response');
      }
      
      onAvatarUpdate(data.avatarUrl);
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      // Only show a generic error if we haven't already shown a specific one
      if (!error.message?.includes('Erro ao enviar foto')) {
        toast.error('Erro ao enviar foto de perfil');
      }
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={preview || undefined} alt={userName} />
        <AvatarFallback className="text-2xl">
          {getInitials() || <User className="h-12 w-12" />}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Alterar Foto'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          JPG, PNG ou GIF. Máximo 2MB.
        </p>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}