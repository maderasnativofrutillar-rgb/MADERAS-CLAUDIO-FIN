
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
import { Progress } from "@/components/ui/progress"
import { ProductCard } from './product-card';
import { Product } from '@/lib/types';

interface CarouselWithProgressProps {
    products: Product[];
}

export function CarouselWithProgress({ products }: CarouselWithProgressProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
 
  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])


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
              <div className="p-1 h-full">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex items-center justify-center gap-4 mt-8">
            <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
            <div className="flex-1 max-w-xs flex items-center gap-2">
                <Progress value={(current / count) * 100} className="flex-1" />
                <span className="text-sm font-medium text-muted-foreground">{current} / {count}</span>
            </div>
            <CarouselNext className="relative -right-0 top-0 translate-y-0" />
        </div>
    </Carousel>
  );
}
