'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface MiniProductCardProps {
  product: Product;
  className?: string;
}

export function MiniProductCard({ product, className }: MiniProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <Card className={cn("flex flex-col group/card overflow-hidden", className)}>
        <Link href={`/producto/${product.id}`} className='flex flex-col flex-grow'>
            <CardHeader className="p-0">
                <div className="relative aspect-square w-full overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                    sizes="150px"
                    data-ai-hint={product.dataAiHint}
                    unoptimized
                />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-3">
                <h3 className="font-headline text-sm group-hover/card:text-primary truncate">{product.name}</h3>
                <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
            </CardContent>
        </Link>
      <CardFooter className="p-0">
        <Button onClick={() => addToCart(product)} variant="secondary" className="w-full rounded-none rounded-b-lg">
            <Plus className="h-4 w-4 mr-1" />
            Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}
