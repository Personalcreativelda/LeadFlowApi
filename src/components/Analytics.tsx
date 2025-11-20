import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    label: 'Taxa de Conversão',
    value: '32.5%',
    change: '+12.3%',
    positive: true,
  },
  {
    icon: Users,
    label: 'Leads Ativos',
    value: '1,847',
    change: '+245',
    positive: true,
  },
  {
    icon: Target,
    label: 'Meta do Mês',
    value: '87%',
    change: '+5%',
    positive: true,
  },
  {
    icon: DollarSign,
    label: 'Receita Prevista',
    value: 'R$ 142K',
    change: '+18.2%',
    positive: true,
  },
];

const leadsBySource = [
  { source: 'Website', count: 524, percentage: 35, color: 'bg-blue-500' },
  { source: 'Instagram', count: 412, percentage: 28, color: 'bg-purple-500' },
  { source: 'Facebook', count: 338, percentage: 22, color: 'bg-indigo-500' },
  { source: 'LinkedIn', count: 225, percentage: 15, color: 'bg-cyan-500' },
];

const leadsByStatus = [
  { status: 'Novos', count: 423, color: 'bg-yellow-400' },
  { status: 'Qualificados', count: 387, color: 'bg-blue-500' },
  { status: 'Em Negociação', count: 245, color: 'bg-purple-500' },
  { status: 'Convertidos', count: 156, color: 'bg-green-500' },
  { status: 'Perdidos', count: 89, color: 'bg-gray-400' },
];

export default function Analytics() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Analytics & Insights</span>
            </div>

            <h2 className="text-gray-900 mb-4">
              Decisões baseadas em dados reais
            </h2>

            <p className="text-gray-600 mb-8">
              Acompanhe o desempenho das suas campanhas em tempo real. Identifique
              oportunidades e otimize sua estratégia com insights acionáveis.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-gray-900">{stat.value}</p>
                      <span
                        className={`text-xs ${
                          stat.positive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Atualização em tempo real</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Exportação de relatórios</span>
              </div>
            </div>
          </div>

          {/* Right Content - Charts */}
          <div className="space-y-6">
            {/* Leads by Source */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-gray-900 mb-6">Leads por Origem</h3>
              <div className="space-y-4">
                {leadsBySource.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.source}</span>
                      <span className="text-sm text-gray-900">{item.count}</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads by Status */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-gray-900 mb-6">Status dos Leads</h3>
              <div className="space-y-3">
                {leadsByStatus.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`} />
                      <span className="text-sm text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
