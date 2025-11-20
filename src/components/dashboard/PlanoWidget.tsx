import { Users, MessageSquare, Mail, Crown } from 'lucide-react';

interface PlanoWidgetProps {
  limites: {
    leads: number;
    mensagens: number;
    envios: number;
    usados: {
      leads: number;
      mensagens: number;
      envios: number;
    };
  };
  diasRestantes: number | null;
  onUpgrade: () => void;
  userPlan?: string;
  isTrial?: boolean;
}

export default function PlanoWidget({ limites, diasRestantes, onUpgrade, userPlan = 'free', isTrial = false }: PlanoWidgetProps) {
  // Calcular percentuais
  const percLeads = limites.leads > 0 ? (limites.usados.leads / limites.leads) * 100 : 0;
  const percMensagens = limites.mensagens > 0 ? (limites.usados.mensagens / limites.mensagens) * 100 : 0;
  const percEnvios = limites.envios > 0 ? (limites.usados.envios / limites.envios) * 100 : 0;

  // Determinar cor da barra baseado no percentual
  const getBarColor = (perc: number) => {
    if (perc >= 90) return 'bg-red-500';
    if (perc >= 75) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const limitCards = [
    {
      title: 'Limite de Leads',
      usado: limites.usados.leads,
      total: limites.leads,
      percentual: percLeads,
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      barColor: getBarColor(percLeads),
    },
    {
      title: 'Limite de Mensagens',
      usado: limites.usados.mensagens,
      total: limites.mensagens,
      percentual: percMensagens,
      icon: MessageSquare,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      barColor: getBarColor(percMensagens),
    },
    {
      title: 'Limite de Emails',
      usado: limites.usados.envios,
      total: limites.envios,
      percentual: percEnvios,
      icon: Mail,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      barColor: getBarColor(percEnvios),
    },
  ];

  return (
    <div id="plan-limits-card" className="space-y-6">
      {/* Header com título e botão */}
      <div id="dashboard-welcome" className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Limites do Plano
        </h3>
        <button
          onClick={onUpgrade}
          data-upgrade-btn
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg font-semibold text-sm"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade de Plano</span>
        </button>
      </div>

      {/* Grid de Cards com Barras Horizontais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {limitCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Ícone circular */}
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 ${card.iconColor}`} />
                </div>
              </div>

              {/* Título */}
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                {card.title}
              </h4>

              {/* Valores */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.usado.toLocaleString()}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">/</span>
                  <span className="text-xl text-gray-600 dark:text-gray-400">
                    {card.total === -1 ? '∞' : card.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Barra de progresso horizontal */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${card.barColor} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(card.percentual, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}