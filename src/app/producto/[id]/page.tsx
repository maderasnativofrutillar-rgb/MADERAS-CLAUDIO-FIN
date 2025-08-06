'use client';

import { useParams } from 'next/navigation';
import { products } from '@/lib/constants';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);

  // Exclude current product and limit to 4 related products
  const relatedProducts = products.filter(p => p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="container mx-auto text-center py-24">
        <h1 className="font-headline text-2xl">Producto no encontrado</h1>
        <p className="text-muted-foreground">No pudimos encontrar el producto que buscas.</p>
        <Button asChild className="mt-4">
          <Link href="/">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={product.dataAiHint}
          />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground text-lg">{product.description}</p>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <div className="flex items-center gap-4">
             <Button onClick={() => addToCart(product)} size="lg" className="group/button relative w-48 h-12 overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground text-base">
                <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover/button:-translate-y-full">Agregar al Carrito</span>
                <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover/button:translate-y-0">
                    <ShoppingCart className="h-6 w-6" />
                </span>
            </Button>
          </div>
        </div>
      </div>

       <div className="mt-24">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-8">También te podría interesar</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 mt-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </div>
    </div>
  );
}
