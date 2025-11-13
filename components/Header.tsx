import React, { useState } from 'react';
import { SearchIcon, CartIcon, SparklesIcon, UserIcon, ClipboardListIcon } from './Icons';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { UserMenu } from './UserMenu';

interface HeaderProps {
    onSearch: (term: string) => void;
    onOpenAiModal: () => void;
    onOpenAuthModal: () => void;
    onOpenCart: () => void;
    onOpenOrderHistory: () => void;
    onOpenPharmacyDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenAiModal, onOpenAuthModal, onOpenCart, onOpenOrderHistory, onOpenPharmacyDashboard }) => {
    const { cartCount } = useCart();
    const { currentUser } = useAuth();
    const [localSearch, setLocalSearch] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localSearch);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                     <svg className="h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                    <span className="text-2xl font-bold text-slate-800">Pharma</span><span className="text-2xl font-bold text-teal-500">Market</span>
                </div>

                <div className="flex-1 max-w-xl mx-4">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Buscar medicamentos, cosméticos e mais..."
                            className="w-full py-2 pl-4 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                         <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500">
                             <SearchIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
                
                <div className="flex items-center space-x-4">
                    {currentUser?.role === 'pharmacy' ? (
                        <button onClick={onOpenPharmacyDashboard} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition duration-300">
                            <ClipboardListIcon className="h-5 w-5" />
                            <span className="font-medium">Painel da Farmácia</span>
                        </button>
                    ) : (
                        <>
                            <button onClick={onOpenAiModal} className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition duration-300">
                                <SparklesIcon className="h-5 w-5" />
                                <span className="font-medium">Busca Inteligente</span>
                            </button>
                            <button onClick={onOpenCart} className="relative cursor-pointer">
                                <CartIcon className="h-7 w-7 text-gray-600 hover:text-teal-500" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </>
                    )}
                    <div className="border-l h-8 border-slate-200"></div>
                    {currentUser ? (
                        <UserMenu onOpenOrderHistory={onOpenOrderHistory} />
                    ) : (
                        <button onClick={onOpenAuthModal} className="flex items-center space-x-2 text-slate-600 hover:text-teal-500">
                            <UserIcon className="h-7 w-7" />
                            <span className="font-medium hidden md:block">Login / Cadastrar</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};