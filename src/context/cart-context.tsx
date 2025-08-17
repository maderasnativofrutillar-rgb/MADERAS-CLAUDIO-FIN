
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
    // This effect ensures the cart is always persisted to localStorage on any change.
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getPriceForQuantity = (product: Product, quantity: number) => {
    // 1. Check for bundle prices first
    if (quantity >= 3 && product.priceFor3 && product.priceFor3 > 0) {
        return product.priceFor3 / 3; // Price per item in bundle
    }
    if (quantity >= 2 && product.priceFor2 && product.priceFor2 > 0) {
        return product.priceFor2 / 2; // Price per item in bundle
    }
     if (quantity >= 1 && product.priceFor1 && product.priceFor1 > 0) {
        return product.priceFor1;
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
      
      let newItems;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        newItems = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: quantityToAdd }];
      }

      // After updating quantities, recalculate prices for all items
      return newItems.map(item => ({
        ...item,
        price: getPriceForQuantity(item, item.quantity)
      }));
    });

     toast({
       title: "Producto añadido",
       description: `${quantityToAdd} x ${product.name} ha(n) sido añadido(s) al carrito.`,
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
    setCartItems((prevItems) => {
        const newItems = prevItems.map((item) => {
            if (item.id === productId) {
               return { ...item, quantity };
            }
            return item;
        });

        // After updating quantities, recalculate prices for all items
        return newItems.map(item => ({
            ...item,
            price: getPriceForQuantity(item, item.quantity)
        }));
    });
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
