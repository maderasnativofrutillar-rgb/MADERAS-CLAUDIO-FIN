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
import { Progress } from '@/components/ui/progress';
import { ProductCard } from './product-card';
import { Product } from '@/lib/types';

interface CarouselWithProgressProps {
    products: Product[];
}

export function CarouselWithProgress({ products }: CarouselWithProgressProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const updateProgress = () => {
        const scrollProgress = api.scrollProgress();
        const newProgress = Math.round(scrollProgress * 100);
        setProgress(newProgress);
    }
    
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
      updateProgress();
    });

    api.on('scroll', () => {
      updateProgress();
    });
    
    // Initial progress
    updateProgress();

  }, [api]);

  return (
    <div>
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
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
        <Progress value={progress} className="w-1/4 mx-auto" />
        <p>
            Producto {current} de {count}
        </p>
      </div>
    </div>
  );
}
