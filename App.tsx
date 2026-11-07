import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './src/context/AppContext';
import { AppRoutes } from './src/routes/AppRoutes';

// Re-export common types for external consumer compatibility
export type { DivoomProduct, ProductGroup, CartItem } from './src/types';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
