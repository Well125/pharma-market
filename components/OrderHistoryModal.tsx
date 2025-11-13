import React from 'react';
import { Modal } from './Modal';
import { useOrder } from '../hooks/useOrder';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { orders, isLoading } = useOrder();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meus Pedidos">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {isLoading && <p>Carregando pedidos...</p>}
        {!isLoading && orders.length === 0 && (
          <p className="text-slate-500 text-center py-8">Você ainda não fez nenhum pedido.</p>
        )}
        {!isLoading && orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                <div>
                    <p className="font-bold text-slate-800">Pedido #{order.id.split('-')[1]}</p>
                    <p className="text-sm text-slate-500">Realizado em: {formatDate(order.date)}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'Entregue' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {order.status}
                </span>
            </div>
            <ul className="space-y-1 text-sm mb-2">
              {order.items.map(item => (
                <li key={item.product.id} className="flex justify-between">
                  <span className="text-slate-600">{item.quantity}x {item.product.name}</span>
                  <span className="text-slate-700">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end font-bold text-md text-slate-800 border-t pt-2 mt-2">
              <span>Total: R$ {order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};