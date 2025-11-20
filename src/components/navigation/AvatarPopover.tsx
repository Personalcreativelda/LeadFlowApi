import { User, Settings, LogOut, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AvatarPopoverProps {
  user: any;
  onProfile: () => void;
  onSettings: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export default function AvatarPopover({
  user,
  onProfile,
  onSettings,
  onChangePassword,
  onLogout,
}: AvatarPopoverProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all focus:outline-none">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
            <AvatarFallback className="text-sm bg-blue-600 text-white">
              {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-2">
        <DropdownMenuItem 
          onClick={onProfile} 
          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <User className="w-4 h-4 mr-3" />
          <span className="text-sm">Ver Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onSettings} 
          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings className="w-4 h-4 mr-3" />
          <span className="text-sm">Configurações da Conta</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onChangePassword} 
          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Lock className="w-4 h-4 mr-3" />
          <span className="text-sm">Alterar Senha</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem 
          onClick={onLogout} 
          className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="text-sm">Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}