'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
        return null;
    }
}

async function getRelatedProducts(currentProductId: string): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("id", "!=", currentProductId), limit(4));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}


export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
        setLoading(true);
        const productData = await getProduct(id);
        setProduct(productData);

        if (productData) {
            const relatedData = await getRelatedProducts(id);
            setRelatedProducts(relatedData);
        }
        setLoading(false);
    };

    fetchProductData();
  }, [id]);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  if (loading) {
      return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-12">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="flex flex-col justify-center space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-48" />
                </div>
            </div>
        </div>
      )
  }

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
            unoptimized
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
