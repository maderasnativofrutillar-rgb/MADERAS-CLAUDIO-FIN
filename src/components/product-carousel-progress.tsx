'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ProductCard } from './product-card';
import { Product } from '@/lib/types';

interface CarouselWithProgressProps {
    products: Product[];
}

export function CarouselWithProgress({ products }: CarouselWithProgressProps) {
  const [api, setApi] = React.useState<CarouselApi>();
 
  return (
    <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
            align: "start",
            loop: true,
        }}
    >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
              <div className="p-1">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center gap-4 mt-4">
            <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
            <CarouselNext className="relative -right-0 top-0 translate-y-0" />
        </div>
    </Carousel>
  );
}
