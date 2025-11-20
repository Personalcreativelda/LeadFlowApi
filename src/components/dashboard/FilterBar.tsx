import { Search } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  origens: string[];
  status: string[];
  onFilterChange: (filters: { origem: string; status: string; busca: string }) => void;
}

export default function FilterBar({ origens, status, onFilterChange }: FilterBarProps) {
  const [origem, setOrigem] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busca, setBusca] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({ origem, status: statusFilter, busca });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        
        {/* Select Origem - Apenas Desktop */}
        <select
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          className="hidden md:block border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Origem: Todas</option>
          {origens.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        {/* Select Status - Apenas Desktop */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="hidden md:block border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Status: Todos</option>
          {status.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Input de Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="🔍 Buscar leads..."
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Botão Aplicar */}
        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          Aplicar Filtros
        </button>
        
      </div>
    </div>
  );
}