import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import type { Lead } from '../../types';
import FilterBar from './FilterBar';
import { useMemo } from 'react';

interface ChartsSectionProps {
  leads: Lead[];
  origens?: string[];
  status?: string[];
  onFilterChange?: (filtros: { origem: string; status: string; busca: string }) => void;
}

export default function ChartsSection({ leads, origens = [], status = [], onFilterChange }: ChartsSectionProps) {
  // Extrair origens e status únicos caso não sejam passados
  const origensDisponiveis = useMemo(() => {
    if (origens.length > 0) return origens;
    return Array.from(new Set(leads.map((l) => l.origem).filter(Boolean)));
  }, [leads, origens]);

  const statusDisponiveis = useMemo(() => {
    if (status.length > 0) return status;
    return Array.from(new Set(leads.map((l) => l.status).filter(Boolean)));
  }, [leads, status]);

  // Processar dados para gráfico de origem
  const origemData = leads.reduce((acc: Record<string, number>, lead) => {
    if (lead.origem) {
      acc[lead.origem] = (acc[lead.origem] || 0) + 1;
    }
    return acc;
  }, {});

  // Mapeamento de nomes de origem para exibição mais clara
  const origemLabels: Record<string, string> = {
    'whatsapp': 'WhatsApp',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'site': 'Site',
    'indicacao': 'Indicação',
    'google': 'Google',
    'linkedin': 'LinkedIn',
    'email': 'Email',
    'telefone': 'Telefone',
    'outros': 'Outros',
  };

  const origemChartData = Object.entries(origemData)
    .map(([name, value]) => ({
      name: origemLabels[name.toLowerCase()] || name,
      value,
      fullName: origemLabels[name.toLowerCase()] || name,
    }))
    .sort((a, b) => b.value - a.value);

  // Processar dados para gráfico de status
  const statusData = leads.reduce((acc: Record<string, number>, lead) => {
    if (lead.status) {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
    }
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  // Dados para evolução de leads (últimos 7 dias)
  const getDaysData = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      const leadsCount = leads.filter(lead => lead.data === dateStr).length;
      
      data.push({
        name: dayName,
        leads: leadsCount,
        date: dateStr,
      });
    }
    
    return data;
  };

  const evolutionData = getDaysData();

  // Dados simulados para engajamento em campanhas
  const engajamentoData = [
    { name: 'Entregues', value: 5234, color: '#10b981' },
    { name: 'Abertas', value: 4123, color: '#3b82f6' },
    { name: 'Respostas', value: 2045, color: '#a855f7' },
    { name: 'Cliques', value: 892, color: '#f59e0b' },
  ];

  // Cores para os gráficos
  const barColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = leads.length;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {data.payload.fullName || data.payload.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} lead{data.value !== 1 ? 's' : ''} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const LineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {payload[0].value} leads
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      {onFilterChange && (
        <FilterBar
          origens={origensDisponiveis}
          status={statusDisponiveis}
          onFilterChange={onFilterChange}
        />
      )}
      
      {/* Primeira linha - 2 gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Origem */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Leads por Origem
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total: {leads.length}
              </span>
            </div>
          </div>
          
          {origemChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={origemChartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorOrigem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOrigem)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium">Nenhum lead cadastrado</p>
              </div>
            </div>
          )}
        </div>

        {/* Evolução de Leads (Linha) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolução de Leads
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
                7 dias
              </button>
              <button className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                30 dias
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#e5e7eb"
                className="dark:stroke-gray-700"
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#e5e7eb"
                className="dark:stroke-gray-700"
                allowDecimals={false}
              />
              <Tooltip content={<LineTooltip />} />
              <Area 
                type="monotone" 
                dataKey="leads" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorLeads)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segunda linha - 2 gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status dos Leads (Pizza) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status dos Leads
            </h3>
          </div>
          
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, white)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '20px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <p className="font-medium">Nenhum status definido</p>
              </div>
            </div>
          )}
        </div>

        {/* Engajamento em Campanhas (Barras horizontais) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Engajamento em Campanhas
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={engajamentoData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
              <XAxis 
                type="number"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#e5e7eb"
                className="dark:stroke-gray-700"
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                stroke="#e5e7eb"
                className="dark:stroke-gray-700"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, white)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]}
              >
                {engajamentoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}