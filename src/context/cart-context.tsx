
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
  
  // The total is now a derived value, calculated on the fly. This is more robust.
  const cartTotal = cartItems.reduce((total, item) => {
    const { quantity } = item;
    let itemTotal = 0;

    // 1. Check for bundle pricing first. These are TOTAL prices for the bundle.
    if (quantity >= 3 && item.priceFor3 && item.priceFor3 > 0) {
      itemTotal = item.priceFor3;
    } else if (quantity === 2 && item.priceFor2 && item.priceFor2 > 0) {
      itemTotal = item.priceFor2;
    } else if (quantity === 1 && item.priceFor1 && item.priceFor1 > 0) {
      itemTotal = item.priceFor1;
    } else {
      // 2. If no bundle price applies, calculate from base price + offer
      const unitPrice = (item.offerPercentage && item.offerPercentage > 0)
        ? Math.round(item.price * (1 - item.offerPercentage / 100))
        : item.price;
      itemTotal = unitPrice * quantity;
    }

    return total + itemTotal;
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
