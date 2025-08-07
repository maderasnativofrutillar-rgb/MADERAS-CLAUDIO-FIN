'use client';

import { type ReactNode } from 'react';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from './ui/toaster';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  );
}
