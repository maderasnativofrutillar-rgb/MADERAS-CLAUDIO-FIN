'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

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
    <Card className={cn("flex flex-col group/card", className)}>
        <Link href={`/producto/${product.id}`} className='flex flex-col flex-grow'>
            <CardHeader>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={product.dataAiHint}
                />
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <CardTitle className="font-headline text-lg group-hover/card:text-primary">{product.name}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            </CardContent>
        </Link>
      <CardFooter className="flex justify-between items-center">
        <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
        <Button onClick={() => addToCart(product)} className="group/button relative w-28 h-10 overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground">
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover/button:-translate-y-full">Agregar</span>
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover/button:translate-y-0">
                <ShoppingCart className="h-5 w-5" />
            </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
