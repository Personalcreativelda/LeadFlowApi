import { useState } from 'react';
import { Plus, MessageSquare, Mail, Users, X, Zap } from 'lucide-react';

interface QuickActionsProps {
  onNovoLead: () => void;
  onMassMessage: () => void;
  onEmailMarketing: () => void;
}

export default function QuickActions({ onNovoLead, onMassMessage, onEmailMarketing }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'Novo Lead',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      onClick: () => {
        onNovoLead();
        setIsOpen(false);
      },
    },
    {
      label: 'Campanhas WhatsApp',
      icon: MessageSquare,
      gradient: 'from-green-500 to-emerald-500',
      onClick: () => {
        onMassMessage();
        setIsOpen(false);
      },
    },
    {
      label: 'Email Marketing',
      icon: Mail,
      gradient: 'from-purple-500 to-pink-500',
      onClick: () => {
        onEmailMarketing();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Action Buttons */}
      <div 
        className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`group bg-gradient-to-r ${action.gradient} text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[200px] hover:scale-105`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-semibold">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <Zap className="w-7 h-7" />
        )}
      </button>
    </div>
  );
}
