
import React, { useState } from 'react';
import { Modal } from './Modal';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types';
import { PlusIcon, CheckCircleIcon } from './Icons';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type InfoTab = 'description' | 'composition' | 'contraindications';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<InfoTab>('description');

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  const TabButton: React.FC<{tab: InfoTab, label: string}> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-4 font-medium text-sm rounded-t-lg focus:outline-none ${
        activeTab === tab
          ? 'bg-white border-b-0 border-slate-200 text-teal-600'
          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Produto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Column */}
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
        </div>

        {/* Details Column */}
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-slate-800">{product.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm bg-slate-200 text-slate-700 px-2 py-1 rounded-full">{product.category}</span>
            {product.isGeneric && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">GENÉRICO</span>}
          </div>
          
          <div className="flex items-center text-green-600 mt-4">
             <CheckCircleIcon className="h-5 w-5 mr-1" />
             <span className="text-sm font-medium">Em estoque ({product.stock} unidades)</span>
          </div>

          <div className="my-6">
            <span className="text-4xl font-extrabold text-teal-600">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center bg-teal-500 text-white rounded-lg py-3 px-4 font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
      
      {/* Information Tabs */}
      <div className="mt-8">
        <div className="border-b border-slate-200 flex space-x-2 bg-slate-50 rounded-t-lg p-1">
          <TabButton tab="description" label="Descrição" />
          <TabButton tab="composition" label="Composição" />
          <TabButton tab="contraindications" label="Contraindicações" />
        </div>
        <div className="p-4 bg-white border border-t-0 border-slate-200 rounded-b-lg">
            {activeTab === 'description' && <p className="text-slate-600">{product.leaflet}</p>}
            {activeTab === 'composition' && <p className="text-slate-600">{product.composition}</p>}
            {activeTab === 'contraindications' && <p className="text-slate-600">{product.contraindications}</p>}
        </div>
      </div>
    </Modal>
  );
};