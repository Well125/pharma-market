
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Pharma Marketplace. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Este é um projeto de demonstração. Consulte sempre um profissional de saúde.</p>
      </div>
    </footer>
  );
};
