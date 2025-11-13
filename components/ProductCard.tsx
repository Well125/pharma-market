
import React from 'react';
import type { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { PlusIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onProductSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductSelect }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
      onClick={() => onProductSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onProductSelect(product)}
    >
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        {product.isGeneric && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
            GENÉRICO
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-slate-800 truncate">{product.name}</h3>
        <p className="text-sm text-slate-500 mt-1 flex-grow">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-teal-600">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-teal-500 text-white rounded-full p-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};