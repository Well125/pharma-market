import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProductList } from './components/ProductList';
import { Footer } from './components/Footer';
import { AiFinderModal } from './components/AiFinderModal';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { PharmacyDashboardModal } from './components/PharmacyDashboardModal';
import { ChatWidget } from './components/ChatWidget';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import type { Product, FilterState } from './types';
import { useCart } from './hooks/useCart';
import { useOrder } from './hooks/useOrder';
import { useProducts } from './hooks/useProducts';

function AppContent() {
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100],
    isGeneric: null,
  });
  
  // Modal and Sidebar States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isPharmacyDashboardOpen, setIsPharmacyDashboardOpen] = useState(false);

  const { addOrder } = useOrder();
  const { cartItems, totalPrice, clearCart } = useCart();

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  useEffect(() => {
    let tempProducts = [...products];
    if (searchTerm) {
      tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filters.categories.length > 0) {
      tempProducts = tempProducts.filter(p => filters.categories.includes(p.category));
    }
    tempProducts = tempProducts.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    if (filters.isGeneric !== null) {
      tempProducts = tempProducts.filter(p => p.isGeneric === filters.isGeneric);
    }
    setFilteredProducts(tempProducts);
  }, [searchTerm, filters, products]);

  const handleAiSearch = (suggestedSearchTerm: string) => {
    setSearchTerm(suggestedSearchTerm);
    setIsAiModalOpen(false);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = async () => {
    await addOrder(cartItems, totalPrice);
    clearCart();
    // The success step inside CheckoutModal will handle closing.
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      <Header 
        onSearch={setSearchTerm} 
        onOpenAiModal={() => setIsAiModalOpen(true)} 
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenPharmacyDashboard={() => setIsPharmacyDashboardOpen(true)}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <Sidebar 
              categories={categories}
              filters={filters}
              onFilterChange={setFilters}
            />
          </aside>
          <section className="lg:col-span-3">
            <ProductList products={filteredProducts} onProductSelect={setSelectedProduct} />
          </section>
        </div>
      </main>
      <Footer />
      <AiFinderModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onSearch={handleAiSearch} products={products} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProductDetailModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleOpenCheckout} onOpenAuthModal={() => setIsAuthModalOpen(true)} />
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} onSuccess={handleCheckoutSuccess} />
      <OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setIsOrderHistoryOpen(false)} />
      <PharmacyDashboardModal isOpen={isPharmacyDashboardOpen} onClose={() => setIsPharmacyDashboardOpen(false)} />
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;