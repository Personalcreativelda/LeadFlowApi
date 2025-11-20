import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: '#dashboard-welcome',
    title: '👋 Bem-vindo ao LeadsFlow!',
    description: 'Vamos fazer um tour rápido pela plataforma. Você pode pular a qualquer momento.',
    position: 'bottom',
  },
  {
    target: '#plan-limits-card',
    title: '📊 Limites do seu Plano',
    description: 'Aqui você acompanha o uso de leads, mensagens WhatsApp e envios em massa do seu plano atual.',
    position: 'bottom',
  },
  {
    target: '#total-leads-card',
    title: '📈 Total de Leads',
    description: 'Visualize o número total de leads cadastrados no sistema.',
    position: 'right',
  },
  {
    target: '#leads-today-card',
    title: '🎯 Leads Captados Hoje',
    description: 'Acompanhe quantos leads novos chegaram hoje.',
    position: 'right',
  },
  {
    target: '#leads-converted-card',
    title: '✅ Leads Convertidos',
    description: 'Veja quantos leads foram convertidos em clientes.',
    position: 'right',
  },
  {
    target: '#conversion-rate-card',
    title: '📊 Taxa de Conversão',
    description: 'Monitore a eficiência das suas conversões em tempo real.',
    position: 'right',
  },
  {
    target: '#sidebar-navigation',
    title: '🧭 Menu de Navegação',
    description: 'Acesse todas as funcionalidades: Dashboard, Leads, Campanhas, Plano, Integrações, Segurança e Configurações.',
    position: 'right',
  },
  {
    target: '#notification-button',
    title: '🔔 Central de Notificações',
    description: 'Receba atualizações importantes e alertas sobre suas campanhas.',
    position: 'left',
  },
  {
    target: '#theme-toggle',
    title: '🌓 Alternar Tema',
    description: 'Alterne entre modo claro e escuro conforme sua preferência.',
    position: 'left',
  },
  {
    target: '#user-avatar',
    title: '👤 Perfil e Configurações',
    description: 'Acesse suas configurações, personalize seu perfil e gerencie sua conta.',
    position: 'left',
  },
  {
    target: '#dashboard-welcome',
    title: '🎉 Tour Concluído!',
    description: 'Agora você está pronto para começar a gerenciar seus leads. Boa sorte!',
    position: 'bottom',
  },
];

export default function ProductTour({ onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      updateTargetElement();
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    updateTargetElement();
    
    // Update position on resize
    const handleResize = () => updateTargetElement();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStep]);

  const updateTargetElement = () => {
    const element = document.querySelector(currentTourStep.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const position = currentTourStep.position || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 180;
          left = rect.left + rect.width / 2 - 200;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - 200;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 100;
          left = rect.left - 420;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 100;
          left = rect.right + 20;
          break;
      }
      
      // Keep tooltip within viewport
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      if (top < 10) top = 10;
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipHeight - 10;
      }
      
      setTooltipPosition({ top, left });
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  if (!targetElement) return null;

  const targetRect = targetElement.getBoundingClientRect();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] pointer-events-none ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
      />
      
      {/* Spotlight (cut-out effect) */}
      <div 
        className={`fixed z-[9999] pointer-events-none transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          top: `${targetRect.top - 8}px`,
          left: `${targetRect.left - 8}px`,
          width: `${targetRect.width + 16}px`,
          height: `${targetRect.height + 16}px`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.5)',
          borderRadius: '12px',
        }}
      />

      {/* Tooltip */}
      <div
        className={`fixed z-[10000] transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: '400px',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Etapa {currentStep + 1} de {tourSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold">{currentTourStep.title}</h3>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
              {currentTourStep.description}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentStep + 1}/{tourSteps.length}
              </span>

              {currentStep === tourSteps.length - 1 ? (
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Finalizar
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center gap-1"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
