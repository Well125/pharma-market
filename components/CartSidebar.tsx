import React from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { XIcon, TrashIcon, PlusIcon } from './Icons';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onOpenAuthModal: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout, onOpenAuthModal }) => {
  const { cartItems, cartCount, totalPrice, updateItemQuantity, removeFromCart } = useCart();
  const { currentUser } = useAuth();

  const handleCheckout = () => {
    if (!currentUser) {
      onOpenAuthModal();
    } else {
      onCheckout();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-2xl font-bold text-slate-800">Seu Carrinho ({cartCount})</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-5">
            {cartItems.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">
                <CartIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="font-semibold">Seu carrinho está vazio.</p>
                <p className="text-sm">Adicione produtos para começar.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map(item => (
                  <li key={item.product.id} className="flex items-start space-x-4">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-700">{item.product.name}</h3>
                      <p className="text-sm text-slate-500">R$ {item.product.price.toFixed(2).replace('.', ',')}</p>
                      <div className="flex items-center mt-2">
                        <button onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)} className="p-1 border rounded-l-md hover:bg-slate-100">-</button>
                        <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                        <button onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)} className="p-1 border rounded-r-md hover:bg-slate-100">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-slate-800">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                       <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 mt-2 text-sm font-medium">Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-slate-700">Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center bg-teal-500 text-white rounded-lg py-3 px-4 font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Finalizar Compra
              </button>
               {!currentUser && <p className="text-center text-xs text-slate-500 mt-2">Você precisará fazer login para continuar.</p>}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// Dummy CartIcon for empty state
const CartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);