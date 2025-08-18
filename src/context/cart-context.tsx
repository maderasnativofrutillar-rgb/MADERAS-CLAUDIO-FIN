
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type CartItem, type Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, unitPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


// Helper function to get the correct price based on quantity and available offers
const getPriceForQuantity = (product: Product, quantity: number): number => {
    // Priority: Bundle prices first
    if (quantity >= 3 && product.priceFor3 && product.priceFor3 > 0) return Math.round(product.priceFor3 / 3);
    if (quantity === 2 && product.priceFor2 && product.priceFor2 > 0) return Math.round(product.priceFor2 / 2);
    if (quantity === 1 && product.priceFor1 && product.priceFor1 > 0) return product.priceFor1;

    // Then, percentage-based offer
    if (product.offerPercentage && product.offerPercentage > 0) {
        return Math.round(product.price * (1 - product.offerPercentage / 100));
    }
    
    // Finally, the base price
    return product.price;
};


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
  
  const addToCart = (product: Product, quantityToAdd = 1, unitPrice?: number) => {
    
    // If a specific unit price is provided (e.g., from a bundle deal), use it. Otherwise, calculate it.
    const price = unitPrice !== undefined ? Math.round(unitPrice) : getPriceForQuantity(product, quantityToAdd);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      let newItems;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        const newPrice = getPriceForQuantity(product, newQuantity); // Recalculate price for new total quantity
        newItems = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity, price: newPrice } : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: quantityToAdd, price }];
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
            // Recalculate the price based on the new quantity
            const newPrice = getPriceForQuantity(item, quantity);
            return { ...item, quantity: quantity, price: newPrice };
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
