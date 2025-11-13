
import React, { useState, useCallback } from 'react';
import { Modal } from './Modal';
import { SparklesIcon } from './Icons';
import { getAIRecommendations } from '../services/geminiService';
import type { Product } from '../types';

interface AiFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  products: Product[];
}

export const AiFinderModal: React.FC<AiFinderModalProps> = ({ isOpen, onClose, onSearch, products }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await getAIRecommendations(prompt, products);
      setSuggestions(result);
    } catch (err) {
      setError('Desculpe, não foi possível obter sugestões. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, products]);

  const handleSuggestionClick = (suggestion: string) => {
    onSearch(suggestion);
  };
  
  const handleClose = () => {
      setPrompt('');
      setSuggestions([]);
      setError(null);
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Busca Inteligente com IA">
      <div className="space-y-4">
        <p className="text-slate-600">
          Descreva seus sintomas ou o que você precisa, e nossa IA encontrará os produtos certos para você.
        </p>
        <p className="text-sm text-slate-500">
          Ex: "Estou com dor de cabeça e nariz entupido"
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite aqui..."
          className="w-full h-24 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          disabled={isLoading}
        />
        <button
          onClick={handleGetSuggestions}
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analisando...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Obter Sugestões
            </>
          )}
        </button>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        {suggestions.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-slate-700 mb-2">Sugestões para você:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium hover:bg-teal-200 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
