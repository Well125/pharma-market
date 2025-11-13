
import React from 'react';
import type { FilterState } from '../types';

interface SidebarProps {
  categories: string[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ categories, filters, onFilterChange }) => {
  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value, 10)] });
  };
  
  const handleGenericChange = (isGeneric: boolean | null) => {
    onFilterChange({ ...filters, isGeneric });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 sticky top-24">
      <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Filtros</h3>
      
      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">Categorias</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <span className="text-slate-600">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">Preço</h4>
        <div className="space-y-2">
           <input
            type="range"
            min="0"
            max="100"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-slate-600">Até R$ {filters.priceRange[1].toFixed(2)}</div>
        </div>
      </div>

      {/* Generic/Brand Filter */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3">Tipo</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="generic"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              checked={filters.isGeneric === null}
              onChange={() => handleGenericChange(null)}
            />
            <span className="text-slate-600">Todos</span>
          </label>
           <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="generic"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              checked={filters.isGeneric === true}
              onChange={() => handleGenericChange(true)}
            />
            <span className="text-slate-600">Genérico</span>
          </label>
           <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="generic"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              checked={filters.isGeneric === false}
              onChange={() => handleGenericChange(false)}
            />
            <span className="text-slate-600">De Marca</span>
          </label>
        </div>
      </div>
    </div>
  );
};
