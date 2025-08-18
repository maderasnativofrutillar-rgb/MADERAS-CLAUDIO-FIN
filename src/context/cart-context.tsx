
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (product: Product, quantityToAdd = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      let newItems;
      if (existingItem) {
        // If item exists, just update its quantity
        newItems = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      } else {
        // Otherwise, add the new item with all its pricing info
        newItems = [...prevItems, { ...product, quantity: quantityToAdd }];
      }
      return newItems;
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

    setCartItems((prevItems) => 
      prevItems.map((item) => {
        if (item.id === productId) {
            return { ...item, quantity: quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const cartTotal = cartItems.reduce((total, item) => {
    const { quantity } = item;
    
    // Check for bundle pricing first.
    const hasBundlePricing = (item.priceFor1 && item.priceFor1 > 0) || (item.priceFor2 && item.priceFor2 > 0) || (item.priceFor3 && item.priceFor3 > 0);

    if (hasBundlePricing) {
        // If bundle pricing exists, it takes precedence.
        let bundlePrice = 0;
        if (quantity >= 3 && item.priceFor3 && item.priceFor3 > 0) {
            bundlePrice = item.priceFor3 * Math.floor(quantity / 3);
            const remainder = quantity % 3;
            if (remainder === 2 && item.priceFor2 && item.priceFor2 > 0) {
              bundlePrice += item.priceFor2;
            } else if (remainder > 0 && item.priceFor1 && item.priceFor1 > 0) {
              bundlePrice += item.priceFor1 * remainder;
            } else if (remainder > 0) { // Fallback if priceFor1 is not set
               const unitPrice = (item.offerPercentage && item.offerPercentage > 0) ? item.price * (1 - item.offerPercentage / 100) : item.price;
               bundlePrice += unitPrice * remainder;
            }
        } else if (quantity === 2 && item.priceFor2 && item.priceFor2 > 0) {
            bundlePrice = item.priceFor2;
        } else if (quantity === 1 && item.priceFor1 && item.priceFor1 > 0) {
            bundlePrice = item.priceFor1;
        } else {
             const unitPrice = (item.offerPercentage && item.offerPercentage > 0) ? item.price * (1 - item.offerPercentage / 100) : item.price;
             bundlePrice = unitPrice * quantity;
        }
        return total + bundlePrice;

    } else {
        // Fallback to offer or base price if no bundle pricing is applicable
        const unitPrice = (item.offerPercentage && item.offerPercentage > 0)
            ? item.price * (1 - item.offerPercentage / 100)
            : item.price;
        return total + (unitPrice * quantity);
    }
  }, 0);


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
