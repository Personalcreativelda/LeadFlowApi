import { useState } from 'react';
import { 
  Home, Users, Send, Crown, Settings, Shield, User, 
  Moon, Sun, X, ChevronRight, UserCog
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMobile?: boolean;
  user: any;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'campaigns', label: 'Campanhas', icon: Send },
  { id: 'plan', label: 'Plano', icon: Crown },
  { id: 'integrations', label: 'Integrações', icon: Settings },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'account', label: 'Configurações da Conta', icon: User },
];

export default function NavigationSidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  isDark,
  onToggleTheme,
  isMobile = false,
  user,
}: NavigationSidebarProps) {
  // Check if user is admin
  const isAdmin = user?.isAdmin === true || user?.email === 'admin@leadflow.com';
  
  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay - APENAS NO MOBILE */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          transition-all duration-300 ease-in-out flex-shrink-0
          ${isMobile 
            ? 'fixed top-0 left-0 z-50 w-[70%] max-w-xs overflow-y-auto' 
            : 'md:fixed md:top-0 md:left-0 w-[260px] overflow-y-auto'
          }
          ${isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}
          ${!isOpen && !isMobile ? 'hidden md:block' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section - Topo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback className="text-xl bg-blue-600 text-white">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Saudação */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Olá,</p>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                </h3>
              </div>
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav id="sidebar-navigation" className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </li>
                );
              })}
              
              {/* Admin Button - Only visible for admins */}
              {isAdmin && (
                <>
                  <li className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleItemClick('admin')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        currentPage === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <UserCog className="w-5 h-5" />
                        <span className="text-sm font-medium">Admin</span>
                      </div>
                      {currentPage === 'admin' && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Theme Toggle - Rodapé */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  Tema {isDark ? 'Claro' : 'Escuro'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}