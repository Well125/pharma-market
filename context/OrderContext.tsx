import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Order, CartItem, OrderItem, Product } from '../types';

interface OrderContextType {
  orders: Order[];
  allOrders: Order[];
  addOrder: (cartItems: CartItem[], total: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => Promise<void>;
  isLoading: boolean;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('pharma_orders');
      if (storedOrders) {
        setAllOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error("Failed to parse orders from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      setUserOrders(allOrders.filter(order => order.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setUserOrders([]);
    }
  }, [currentUser, allOrders]);

  const addOrder = useCallback(async (cartItems: CartItem[], total: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!currentUser) {
        return reject(new Error("User not logged in"));
      }
      setTimeout(() => { // Simulate API call
        const newOrder: Order = {
          id: `ORD-${Date.now()}`,
          userId: currentUser.id,
          date: new Date().toISOString(),
          items: cartItems.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total,
          status: 'Processando',
        };

        const updatedOrders = [...allOrders, newOrder];
        setAllOrders(updatedOrders);
        localStorage.setItem('pharma_orders', JSON.stringify(updatedOrders));
        resolve();
      }, 1000); // Simulate network latency
    });
  }, [currentUser, allOrders]);
  
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedOrders = allOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setAllOrders(updatedOrders);
        localStorage.setItem('pharma_orders', JSON.stringify(updatedOrders));
        resolve();
      }, 500); // Simulate network latency
    });
  }, [allOrders]);

  const value = useMemo(() => ({
    orders: userOrders,
    allOrders,
    addOrder,
    updateOrderStatus,
    isLoading,
  }), [userOrders, allOrders, addOrder, updateOrderStatus, isLoading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};