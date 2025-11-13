import React, { useState } from 'react';
import { Modal } from './Modal';
import { useCart } from '../hooks/useCart';
import { CreditCardIcon, BarcodeIcon, CheckCircleIcon } from './Icons';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CheckoutStep = 'payment' | 'details' | 'success';
type PaymentMethod = 'card' | 'pix' | 'boleto';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClose = () => {
    // Reset state before closing
    setTimeout(() => {
        setStep('payment');
        setPaymentMethod('card');
        setIsProcessing(false);
    }, 300); // allow for closing animation
    onClose();
  }

  const handlePayment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsProcessing(true);
    await onSuccess(); // This is passed from App.tsx, which calls addOrder
    setIsProcessing(false);
    setStep('success');
  }
  
  const PaymentMethodButton: React.FC<{method: PaymentMethod, label: string, icon: React.ReactNode}> = ({ method, label, icon }) => (
    <button
      onClick={() => setPaymentMethod(method)}
      className={`flex-1 p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${
        paymentMethod === method ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500' : 'bg-white hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  )

  const renderContent = () => {
    switch (step) {
      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4"/>
            <h3 className="text-2xl font-bold text-slate-800">Pedido Realizado!</h3>
            <p className="text-slate-600 mt-2">Obrigado pela sua compra. Você pode acompanhar seu pedido na seção "Meus Pedidos".</p>
            <button onClick={handleClose} className="mt-6 w-full bg-teal-500 text-white rounded-lg py-3 font-semibold hover:bg-teal-600">
              Fechar
            </button>
          </div>
        );
      case 'details':
        if (paymentMethod === 'card') {
          return (
             <form onSubmit={handlePayment} className="space-y-4">
               <h4 className="font-semibold text-lg text-slate-700">Detalhes do Cartão</h4>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Número do Cartão</label>
                  <input type="text" required placeholder="0000 0000 0000 0000" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Nome no Cartão</label>
                  <input type="text" required placeholder="Como aparece no cartão" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
               </div>
               <div className="flex gap-4">
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700">Validade (MM/AA)</label>
                      <input type="text" required placeholder="MM/AA" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                  </div>
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700">CVV</label>
                      <input type="text" required placeholder="123" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                  </div>
               </div>
               <button type="submit" disabled={isProcessing} className="w-full mt-4 bg-teal-500 text-white rounded-lg py-3 font-semibold hover:bg-teal-600 disabled:bg-slate-400">
                {isProcessing ? 'Processando...' : `Pagar R$ ${totalPrice.toFixed(2).replace('.', ',')}`}
              </button>
               <button onClick={() => setStep('payment')} className="w-full text-center text-sm text-slate-600 hover:text-teal-600 mt-2">
                Voltar
              </button>
            </form>
          );
        }
        // For Pix and Boleto
        return (
          <div className="text-center space-y-4">
            <h4 className="font-semibold text-lg text-slate-700">
              {paymentMethod === 'pix' ? 'Pagamento com Pix' : 'Pagamento com Boleto'}
            </h4>
            <p className="text-slate-600">
              {paymentMethod === 'pix' 
                ? 'Um QR Code para pagamento será gerado. (Simulação)' 
                : 'O boleto será gerado para pagamento. (Simulação)'}
            </p>
            <div className="p-4 bg-slate-100 rounded-lg font-mono text-center text-2xl font-bold">
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </div>
            <button onClick={() => handlePayment()} disabled={isProcessing} className="w-full mt-4 bg-teal-500 text-white rounded-lg py-3 font-semibold hover:bg-teal-600 disabled:bg-slate-400">
              {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
            <button onClick={() => setStep('payment')} className="w-full text-center text-sm text-slate-600 hover:text-teal-600 mt-2">
              Voltar
            </button>
          </div>
        );
      default: // 'payment' step
        return (
          <div className="space-y-6">
            <h4 className="font-semibold text-lg text-slate-700">Escolha a forma de pagamento</h4>
            <div className="flex gap-4">
               <PaymentMethodButton method="card" label="Cartão de Crédito" icon={<CreditCardIcon className="h-8 w-8 text-teal-600"/>} />
               <PaymentMethodButton method="pix" label="Pix" icon={<p className="text-2xl font-bold text-teal-600">PIX</p>} />
               <PaymentMethodButton method="boleto" label="Boleto" icon={<BarcodeIcon className="h-8 w-8 text-teal-600"/>} />
            </div>
            <button onClick={() => setStep('details')} className="w-full mt-6 bg-teal-500 text-white rounded-lg py-3 font-semibold hover:bg-teal-600">
              Continuar
            </button>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Finalizar Compra">
       <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
          <h4 className="font-semibold text-lg border-b pb-2 mb-3 text-slate-700">Resumo do Pedido</h4>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {cartItems.map(item => (
              <li key={item.product.id} className="flex justify-between">
                <span className="text-slate-600 truncate pr-2">{item.quantity}x {item.product.name}</span>
                <span className="text-slate-800 font-medium">R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-3">
            <span>Total</span>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        {/* Main Content */}
        <div className="md:col-span-3">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};