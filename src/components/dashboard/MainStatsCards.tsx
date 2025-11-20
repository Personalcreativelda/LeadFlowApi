import { Database, TrendingUp, CheckCircle2, Target } from 'lucide-react';

interface MainStatsCardsProps {
  totalLeads: number;
  leadsNovosHoje: number;
  leadsFechados: number;
}

export default function MainStatsCards({ totalLeads, leadsNovosHoje, leadsFechados }: MainStatsCardsProps) {
  // Calcular taxa de conversão
  const taxaConversao = totalLeads > 0 ? ((leadsFechados / totalLeads) * 100).toFixed(1) : '0';

  // Calcular progresso para Total de Leads (baseado em uma meta estimada ou crescimento)
  // Assumindo meta de 100 leads ou mostrando percentual do total captado
  const metaLeads = 100;
  const progressTotalLeads = totalLeads > 0 ? Math.min((totalLeads / metaLeads) * 100, 100) : 0;
  
  // Calcular progresso para Leads Captados Hoje (baseado em meta diária)
  const metaDiaria = 10;
  const progressLeadsHoje = leadsNovosHoje > 0 ? Math.min((leadsNovosHoje / metaDiaria) * 100, 100) : 0;
  
  // Calcular progresso para Leads Convertidos (percentual do total)
  const progressConvertidos = totalLeads > 0 ? (leadsFechados / totalLeads) * 100 : 0;
  
  // Calcular badges de crescimento (simulado - em produção viria do backend comparando períodos)
  const badgeTotalLeads = totalLeads > 0 ? '+12%' : '0%';
  const badgeLeadsHoje = leadsNovosHoje > 0 ? '+8%' : '0%';
  const badgeConvertidos = leadsFechados > 0 ? '+15%' : '0%';
  const badgeTaxaConversao = parseFloat(taxaConversao) > 0 ? '+3%' : '0%';

  const stats = [
    {
      id: 'total-leads-card',
      value: totalLeads.toLocaleString(),
      label: 'Total de Leads',
      icon: Database,
      gradient: 'from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
      badge: badgeTotalLeads,
      progressColor: 'from-indigo-500 to-purple-600',
      progress: progressTotalLeads,
    },
    {
      id: 'leads-today-card',
      value: leadsNovosHoje.toLocaleString(),
      label: 'Leads Captados Hoje',
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      badge: badgeLeadsHoje,
      progressColor: 'from-pink-500 to-rose-500',
      progress: progressLeadsHoje,
    },
    {
      id: 'leads-converted-card',
      value: leadsFechados.toLocaleString(),
      label: 'Leads Convertidos',
      icon: CheckCircle2,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
      badge: badgeConvertidos,
      progressColor: 'from-cyan-500 to-blue-500',
      progress: progressConvertidos,
    },
    {
      id: 'conversion-rate-card',
      value: `${taxaConversao}%`,
      label: 'Taxa de Conversão',
      icon: Target,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      badge: badgeTaxaConversao,
      progressColor: 'from-green-500 to-emerald-500',
      progress: parseFloat(taxaConversao),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            id={stat.id}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            {/* Badge de percentagem no topo direito */}
            <div className="flex items-start justify-between mb-4">
              {/* Ícone com gradiente */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Badge verde */}
              <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
                {stat.badge}
              </span>
            </div>

            {/* Valor grande */}
            <div className="mb-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>

            {/* Label */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {stat.label}
            </p>

            {/* Barra de progresso colorida */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.progressColor} rounded-full transition-all duration-700`}
                style={{ width: `${Math.min(100, stat.progress)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}