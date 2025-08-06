'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const FREE_SHIPPING_THRESHOLD = 49000;

export function CartSheet() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, cartTotal, clearCart } = useCart();
  const { toast } = useToast();

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Carrito vaciado",
      description: "Todos los productos han sido eliminados del carrito.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  const amountForFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white"
            >
              {cartCount}
            </Badge>
          )}
          <span className="sr-only">Abrir carrito</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6 flex-row justify-between items-center">
          <SheetTitle>Carrito de Compras ({cartCount})</SheetTitle>
           {cartCount > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearCart}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Vaciar carrito</span>
            </Button>
          )}
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 p-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <SheetFooter className="p-6 pt-0 flex flex-col gap-4 bg-background">
                <Separator className="mb-4" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    {amountForFreeShipping > 0 ? (
                    <p>
                        Te faltan <span className="font-bold text-primary">{formatPrice(amountForFreeShipping)}</span> para el envío gratis.
                    </p>
                    ) : (
                    <p className="font-bold text-green-600">¡Felicidades, tienes envío gratis!</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/checkout">Proceder al Pago</Link>
                    </Button>
                    <SheetTrigger asChild>
                        <Button asChild size="lg" variant="outline" className="w-full">
                            <Link href="/tienda">Seguir Comprando</Link>
                        </Button>
                    </SheetTrigger>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Tu carrito está vacío</h3>
            <p className="text-muted-foreground">Agrega productos para comenzar a comprar.</p>
            <SheetTrigger asChild>
                <Button asChild>
                    <Link href="/tienda">Explorar Productos</Link>
                </Button>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
