export interface User {
  id: string;
  name: string; // Can be customer name or pharmacy name
  email: string;
  cpf?: string; // For customers
  cnpj?: string; // For pharmacies
  role: 'customer' | 'pharmacy';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isGeneric: boolean;
  stock: number;
  composition: string;
  contraindications: string;
  leaflet: string;
  pharmacyId: string;
  pharmacyName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  isGeneric: boolean | null;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number; // Price at the time of purchase
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processando' | 'Aguardando Envio' | 'Enviado' | 'Entregue';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}