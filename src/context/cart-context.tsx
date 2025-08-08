
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type CartItem, type Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  getPriceForQuantity: (product: Product, quantity: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  useEffect(() => {
    // Recalculate prices on cart changes in case wholesale prices should apply
    const updatedCart = cartItems.map(item => {
        const price = getPriceForQuantity(item, item.quantity);
        return { ...item, price };
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }, [cartItems]);

  const getPriceForQuantity = (product: Product, quantity: number) => {
    // 1. Check for wholesale prices first
    if (quantity >= 9 && product.wholesalePrice9 && product.wholesalePrice9 > 0) {
        return product.wholesalePrice9;
    }
    if (quantity >= 6 && product.wholesalePrice6 && product.wholesalePrice6 > 0) {
        return product.wholesalePrice6;
    }
    if (quantity >= 3 && product.wholesalePrice3 && product.wholesalePrice3 > 0) {
        return product.wholesalePrice3;
    }
    
    // 2. Check for percentage offer
    if (product.offerPercentage && product.offerPercentage > 0) {
        return product.price * (1 - product.offerPercentage / 100);
    }
    
    // 3. Return base price
    return product.price;
  }

  const addToCart = (product: Product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        const newPrice = getPriceForQuantity(product, newQuantity);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity, price: newPrice } : item
        );
      } else {
        const price = getPriceForQuantity(product, quantityToAdd);
        return [...prevItems, { ...product, quantity: quantityToAdd, price }];
      }
    });
     toast({
       title: "Producto añadido",
       description: `${product.name} ha sido añadido al carrito.`,
     })
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find((item) => item.id === productId);
    if (itemToRemove) {
      toast({
        title: "Producto eliminado",
        description: `${itemToRemove.name} ha sido eliminado del carrito.`,
        variant: "destructive",
      });
    }
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
           const newPrice = getPriceForQuantity(item, quantity);
           return { ...item, quantity, price: newPrice };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        getPriceForQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
