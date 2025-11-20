import { Users as UsersIcon, Target, CheckCircle2, TrendingUp, XCircle } from 'lucide-react';

interface StatsCardsProps {
  totalLeads: number;
  leadsNovosHoje: number;
  leadsFechados: number;
  leads?: Array<{
    id: string;
    status?: string;
    [key: string]: any;
  }>;
  limites?: {
    leads: number;
    mensagens: number;
    envios: number;
    usados: {
      leads: number;
      mensagens: number;
      envios: number;
      whatsappMessages?: number;
      emailMessages?: number;
      massWhatsappMessages?: number;
      massEmailMessages?: number;
    };
  };
}

export default function StatsCards({ totalLeads, leadsNovosHoje, leadsFechados, leads = [], limites }: StatsCardsProps) {
  // Contar leads por status real
  const leadsNovos = leads.filter(lead => {
    const status = lead.status?.toLowerCase().replace(/_/g, ' ');
    return status === 'novo' || status === 'new';
  }).length;
  
  const leadsEmNegociacao = leads.filter(lead => {
    const status = lead.status?.toLowerCase().replace(/_/g, ' ');
    return status === 'em negociacao' || 
           status === 'negociacao' ||
           status === 'in negotiation' ||
           status === 'negotiation';
  }).length;
  
  const leadsQualificados = leads.filter(lead => {
    const status = lead.status?.toLowerCase().replace(/_/g, ' ');
    return status === 'qualificado' ||
           status === 'qualified' ||
           status === 'aguardando resposta' ||
           status === 'waiting';
  }).length;
  
  const leadsPerdidos = leads.filter(lead => {
    const status = lead.status?.toLowerCase().replace(/_/g, ' ');
    return status === 'perdido' ||
           status === 'lost' ||
           status === 'descartado' ||
           status === 'rejeitado' ||
           status === 'rejected';
  }).length;

  const stats = [
    {
      title: 'Leads Novos',
      value: leadsNovos.toLocaleString(),
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Em Negociação',
      value: leadsEmNegociacao.toLocaleString(),
      icon: Target,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Qualificados',
      value: leadsQualificados.toLocaleString(),
      icon: CheckCircle2,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Leads Perdidos',
      value: leadsPerdidos.toLocaleString(),
      icon: XCircle,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}