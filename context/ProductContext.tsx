import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Product } from '../types';
import { mockProducts } from '../data/products';

interface ProductContextType {
  products: Product[];
  updateStock: (productId: string, newStock: number) => void;
  isLoading: boolean;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch this from an API.
    // Em desenvolvimento, ignoramos o localStorage para refletir sempre o conteúdo de mockProducts.
    const isDev = import.meta.env.DEV;

    if (isDev) {
      setProducts(mockProducts);
      setIsLoading(false);
      return;
    }

    try {
      const storedProducts = localStorage.getItem('pharma_products');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(mockProducts);
        localStorage.setItem('pharma_products', JSON.stringify(mockProducts));
      }
    } catch (error) {
      console.error('Failed to load products from localStorage', error);
      setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStock = useCallback((productId: string, newStock: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(p =>
        p.id === productId ? { ...p, stock: newStock } : p
      );
      localStorage.setItem('pharma_products', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
  }, []);

  const value = useMemo(() => ({
    products,
    updateStock,
    isLoading,
  }), [products, updateStock, isLoading]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};