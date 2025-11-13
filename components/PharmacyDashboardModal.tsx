import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrder } from '../hooks/useOrder';
import { useProducts } from '../hooks/useProducts';
import type { Order, Product } from '../types';
import { XIcon, ClipboardListIcon, ArchiveIcon, ChartBarIcon } from './Icons';

interface PharmacyDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DashboardTab = 'orders' | 'stock' | 'reports';

export const PharmacyDashboardModal: React.FC<PharmacyDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const { currentUser } = useAuth();
  const { allOrders, updateOrderStatus, isLoading: isOrdersLoading } = useOrder();
  const { products, updateStock, isLoading: isProductsLoading } = useProducts();
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});

  const pharmacyId = currentUser?.id;

  const pharmacyProducts = useMemo(() => {
    return products.filter(p => p.pharmacyId === pharmacyId);
  }, [products, pharmacyId]);

  const pharmacyOrders = useMemo(() => {
    if (!pharmacyId) return [];
    return allOrders
      .filter(order => order.items.some(item => item.product.pharmacyId === pharmacyId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allOrders, pharmacyId]);

  const handleStockInputChange = (productId: string, value: string) => {
    setStockInputs(prev => ({ ...prev, [productId]: value }));
  };

  const handleStockUpdate = (productId: string) => {
    const newStock = parseInt(stockInputs[productId], 10);
    if (!isNaN(newStock) && newStock >= 0) {
      updateStock(productId, newStock);
      setStockInputs(prev => ({ ...prev, [productId]: '' }));
    }
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR');

  const TabButton: React.FC<{ tab: DashboardTab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition ${
        activeTab === tab ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-4">
            {isOrdersLoading ? <p>Carregando pedidos...</p> : pharmacyOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">Pedido #{order.id.split('-')[1]}</p>
                    <p className="text-sm text-slate-500">{formatDate(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="font-semibold text-lg">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                     <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="p-1 border rounded-md text-sm"
                     >
                        <option value="Processando">Processando</option>
                        <option value="Aguardando Envio">Aguardando Envio</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
                     </select>
                  </div>
                </div>
                <ul className="mt-2 text-sm space-y-1">
                  {order.items.filter(i => i.product.pharmacyId === pharmacyId).map(item => (
                    <li key={item.product.id}>{item.quantity}x {item.product.name}</li>
                  ))}
                </ul>
              </div>
            ))}
             {pharmacyOrders.length === 0 && <p className="text-slate-500 text-center py-8">Nenhum pedido encontrado.</p>}
          </div>
        );
      case 'stock':
        return (
            <div className="space-y-3">
                {isProductsLoading ? <p>Carregando produtos...</p> : pharmacyProducts.map(product => (
                    <div key={product.id} className="bg-white p-3 rounded-lg border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded"/>
                            <div>
                                <p className="font-semibold text-slate-800">{product.name}</p>
                                <p className="text-sm text-slate-500">Estoque atual: <span className="font-bold">{product.stock}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={stockInputs[product.id] || ''}
                                onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                                placeholder="Novo valor"
                                className="w-28 p-2 border rounded-md text-sm"
                            />
                            <button 
                                onClick={() => handleStockUpdate(product.id)}
                                className="px-3 py-2 bg-teal-500 text-white rounded-md text-sm font-semibold hover:bg-teal-600"
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
      case 'reports':
        const totalRevenue = pharmacyOrders.reduce((acc, order) => {
            const orderRevenue = order.items
                .filter(item => item.product.pharmacyId === pharmacyId)
                .reduce((itemAcc, item) => itemAcc + (item.price * item.quantity), 0);
            return acc + orderRevenue;
        }, 0);

        return (
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Resumo de Vendas</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Receita Total</p>
                        <p className="text-3xl font-bold text-teal-600">R$ {totalRevenue.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Total de Pedidos</p>
                        <p className="text-3xl font-bold text-blue-600">{pharmacyOrders.length}</p>
                    </div>
                </div>
                <button disabled className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
                    Exportar Relatório (em breve)
                </button>
            </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] m-4 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-slate-800">Painel da Farmácia - {currentUser?.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-grow flex overflow-hidden">
            <nav className="w-64 bg-white border-r p-4">
                <div className="space-y-2">
                    <TabButton tab="orders" label="Pedidos Recebidos" icon={<ClipboardListIcon className="h-5 w-5"/>} />
                    <TabButton tab="stock" label="Controle de Estoque" icon={<ArchiveIcon className="h-5 w-5"/>} />
                    <TabButton tab="reports" label="Relatórios de Vendas" icon={<ChartBarIcon className="h-5 w-5"/>} />
                </div>
            </nav>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
      </div>
    </div>
  );
};