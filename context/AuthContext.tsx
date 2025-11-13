import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { User } from '../types';

// For internal use, including password for authentication check
interface UserWithPassword extends User {
  password?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, cpf: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const initialUsers: UserWithPassword[] = [
  {
    id: 'pharma-1',
    name: 'Pharma Express',
    email: 'farmacia@pharma.com',
    cnpj: '12.345.678/0001-99',
    role: 'pharmacy',
    password: 'password123',
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserWithPassword[]>([]);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('pharma_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem('pharma_users', JSON.stringify(initialUsers));
      }
      
      const storedCurrentUser = localStorage.getItem('pharma_currentUser');
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate API call
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const { password: _, ...userToStore } = user;
          setCurrentUser(userToStore);
          localStorage.setItem('pharma_currentUser', JSON.stringify(userToStore));
          resolve();
        } else {
          reject(new Error('Credenciais inválidas.'));
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, cpf: string, password: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate API call
            if (users.some(u => u.email === email)) {
                return reject(new Error('Este e-mail já está em uso.'));
            }

            const newUser: UserWithPassword = {
                id: Date.now().toString(),
                name,
                email,
                cpf,
                role: 'customer',
                password,
            };

            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            localStorage.setItem('pharma_users', JSON.stringify(updatedUsers));
            
            const { password: _, ...userToStore } = newUser;
            setCurrentUser(userToStore);
            localStorage.setItem('pharma_currentUser', JSON.stringify(userToStore));
            
            resolve();
        }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pharma_currentUser');
  };
  
  const value = useMemo(() => ({
    currentUser,
    login,
    logout,
    register,
  }), [currentUser, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};