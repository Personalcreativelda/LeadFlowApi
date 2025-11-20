import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, Zap } from 'lucide-react';
import AvatarPopover from './AvatarPopover';
import NotificationCenter from '../notifications/NotificationCenter';

interface RefactoredHeaderProps {
  user: any;
  isDark: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
  onNovoLead: () => void;
  onEmailMarketing: () => void;
  onMassMessage: () => void;
  onSettings: () => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onStartTour?: () => void;
}

export default function RefactoredHeader({
  user,
  isDark,
  currentPage,
  onNavigate,
  onToggleTheme,
  onNovoLead,
  onEmailMarketing,
  onMassMessage,
  onSettings,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
  onStartTour,
}: RefactoredHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfile = () => {
    onNavigate('account');
  };

  const handleChangePassword = () => {
    onNavigate('account');
    // You can add additional logic to switch to password tab if needed
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left Section: Hamburger (mobile only) + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger - APENAS NO MOBILE */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                LeadsFlow API
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Icons + Avatar */}
        <div className="flex items-center gap-2">
          {/* Notification Center */}
          <NotificationCenter onStartTour={onStartTour} />

          {/* Theme Toggle - Now visible on mobile */}
          <button
            id="theme-toggle"
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

          {/* Avatar Popover */}
          <div id="user-avatar">
            <AvatarPopover
              user={user}
              onProfile={handleProfile}
              onSettings={onSettings}
              onChangePassword={handleChangePassword}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}