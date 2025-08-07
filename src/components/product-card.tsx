
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { type Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { useState, useRef } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(product.image);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];

  const startImageRotation = () => {
    if (allImages.length <= 1) return;
    
    let currentIndex = 0;
    intervalRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % allImages.length;
      setCurrentImage(allImages[currentIndex]);
    }, 800); // Cambia de imagen cada 800ms
  };

  const stopImageRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImage(product.image); // Vuelve a la imagen principal
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  const hasOffer = product.offerPercentage && product.offerPercentage > 0;
  const discountedPrice = hasOffer ? product.price * (1 - product.offerPercentage! / 100) : product.price;

  return (
    <Card 
      className={cn("flex flex-col group/card overflow-hidden", className)}
      onMouseEnter={startImageRotation}
      onMouseLeave={stopImageRotation}
    >
        <Link href={`/producto/${product.id}`} className='flex flex-col flex-grow'>
            <CardHeader>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary/30">
                    <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-2">
                        {hasOffer && (
                            <Badge className='bg-green-600 text-white hover:bg-green-700'>
                                OFERTA {product.offerPercentage}%
                            </Badge>
                        )}
                        {product.customTag && (
                            <Badge className='bg-sky-500 text-white hover:bg-sky-600'>
                                {product.customTag}
                            </Badge>
                        )}
                    </div>
                    <Image
                        src={currentImage}
                        alt={product.name}
                        fill
                        className="object-contain transition-all duration-300"
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
        <div className='flex flex-col items-start'>
            {hasOffer && (
                <p className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
            <p className={`text-lg font-bold ${hasOffer ? 'text-green-600' : 'text-primary'}`}>{formatPrice(discountedPrice)}</p>
        </div>
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
