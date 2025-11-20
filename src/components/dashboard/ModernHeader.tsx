import { useState } from 'react';
import { 
  Menu, X, Plus, Send, Settings as SettingsIcon, LogOut, 
  Moon, Sun, User, ChevronDown, Bell, MessageSquare, Mail,
  Home, BarChart3, Users, FileText, Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ModernHeaderProps {
  user: any;
  isDark: boolean;
  onToggleTheme: () => void;
  onNovoLead: () => void;
  onEmailMarketing: () => void;
  onMassMessage: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export default function ModernHeader({
  user,
  isDark,
  onToggleTheme,
  onNovoLead,
  onEmailMarketing,
  onMassMessage,
  onSettings,
  onLogout,
}: ModernHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Left Section: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  LeadsFlow API
                </h1>
              </div>
            </div>
          </div>

          {/* Right Section: Actions + Theme + Notifications + Avatar */}
          <div className="flex items-center gap-3">
            {/* Action Buttons - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                onClick={onNovoLead} 
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all hover:opacity-90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Campanhas
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuItem 
                    onClick={onMassMessage} 
                    className="px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MessageSquare className="w-4 h-4 mr-3 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-medium text-sm">WhatsApp</div>
                      <div className="text-xs text-gray-500">Criar campanhas via WhatsApp</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onEmailMarketing} 
                    className="px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Mail className="w-4 h-4 mr-3 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-sm">Email Marketing</div>
                      <div className="text-xs text-gray-500">Criar campanhas de email</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile: Only show Novo Lead button */}
            <div className="md:hidden">
              <Button 
                onClick={onNovoLead} 
                size="sm"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Lead
              </Button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-full ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-sm bg-blue-600 text-white">
                      {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuItem 
                  onClick={onSettings} 
                  className="px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
                >
                  <User className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium text-sm">Meu Perfil</div>
                    <div className="text-xs text-gray-500">Ver e editar perfil</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onSettings} 
                  className="px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium text-sm">Configurações</div>
                    <div className="text-xs text-gray-500">SMTP, integrações e mais</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem 
                  onClick={onLogout} 
                  className="px-4 py-3 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium text-sm">Sair</div>
                    <div className="text-xs opacity-75">Encerrar sessão</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                LeadsFlow API
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium transition-colors">
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
              <Users className="w-5 h-5" />
              Leads
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
              <BarChart3 className="w-5 h-5" />
              Relatórios
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
              <MessageSquare className="w-5 h-5" />
              Campanhas
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
              <FileText className="w-5 h-5" />
              Documentos
            </button>

            {/* Mobile: Show campaign buttons */}
            <div className="md:hidden pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <button 
                onClick={() => {
                  onNovoLead();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Lead
              </button>
              <button 
                onClick={() => {
                  onMassMessage();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                WhatsApp
              </button>
              <button 
                onClick={() => {
                  onEmailMarketing();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Marketing
              </button>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => {
                onSettings();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              Configurações
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel Overlay */}
      {isSettingsPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsSettingsPanelOpen(false)}
        />
      )}

      {/* Settings Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isSettingsPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configurações Rápidas
            </h2>
            <button
              onClick={() => setIsSettingsPanelOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Theme */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Aparência
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isDark) onToggleTheme();
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    !isDark
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Claro</div>
                </button>
                <button
                  onClick={() => {
                    if (!isDark) onToggleTheme();
                  }}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    isDark
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Escuro</div>
                </button>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Conta
              </h3>
              <button
                onClick={() => {
                  onSettings();
                  setIsSettingsPanelOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Gerenciar Conta
                  </div>
                  <div className="text-xs text-gray-500">
                    Perfil, senha e mais
                  </div>
                </div>
              </button>
            </div>

            {/* Integrations */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Integrações
              </h3>
              <button
                onClick={() => {
                  onSettings();
                  setIsSettingsPanelOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Configurações Gerais
                  </div>
                  <div className="text-xs text-gray-500">
                    SMTP, webhooks, APIs
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
