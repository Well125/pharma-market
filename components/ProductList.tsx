
import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-8 rounded-lg shadow-sm">
        <svg className="h-16 w-16 text-slate-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-3.375-3.375" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-700">Nenhum produto encontrado</h3>
        <p className="text-slate-500 mt-2">Tente ajustar seus filtros ou termo de busca.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onProductSelect={onProductSelect} />
      ))}
    </div>
  );
};