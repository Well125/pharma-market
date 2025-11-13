import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleIcon, XIcon, PaperAirplaneIcon } from './Icons';
import { getPharmacistResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setIsLoading(true);
            getPharmacistResponse("Olá", [])
                .then(response => {
                    setMessages([{ id: 'initial', text: response, sender: 'bot' }]);
                })
                .catch(err => {
                    setMessages([{ id: 'initial-error', text: "Desculpe, não consigo me conectar agora. Tente mais tarde.", sender: 'bot' }]);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            text: trimmedInput,
            sender: 'user',
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const botResponseText = await getPharmacistResponse(trimmedInput, messages);
            const newBotMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
            };
            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform duration-300 hover:scale-110"
                    aria-label="Toggle chat"
                >
                    {isOpen ? <XIcon className="h-8 w-8" /> : <ChatBubbleIcon className="h-8 w-8" />}
                </button>
            </div>
            {isOpen && (
                 <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out origin-bottom-right scale-95 opacity-0 animate-fade-in-scale">
                    {/* Header */}
                    <div className="flex items-center p-4 border-b bg-slate-50 rounded-t-xl">
                        <div className="relative">
                            <img className="w-10 h-10 rounded-full" src="https://picsum.photos/seed/pharmacist/100/100" alt="Pharmacist" />
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                        </div>
                        <div className="ml-3">
                            <p className="text-md font-semibold text-slate-800">FarmaBot</p>
                            <p className="text-xs text-slate-500">Farmacêutico Virtual</p>
                        </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-100">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.sender === 'user' ? 'bg-teal-500 text-white' : 'bg-white text-slate-700'}`}>
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2 rounded-2xl bg-white text-slate-700">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-white rounded-b-xl">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder="Digite sua pergunta..."
                                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !inputValue.trim()} className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-slate-300">
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                 <style>{`
                    @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                    }
                `}</style>
                </div>
            )}
        </>
    );
};