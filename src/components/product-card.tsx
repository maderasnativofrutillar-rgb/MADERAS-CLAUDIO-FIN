'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={product.dataAiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="font-headline text-lg">{product.name}</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <CardDescription className="text-lg font-bold text-orange-500">{formatPrice(product.price)}</CardDescription>
        <Button onClick={() => addToCart(product)} size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Añadir al carrito</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
