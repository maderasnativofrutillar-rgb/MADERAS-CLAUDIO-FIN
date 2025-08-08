
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, MouseEvent } from 'react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, ChevronsRight, Truck, Clock, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Product;
    } else {
        return null;
    }
}

async function getRelatedProducts(currentProductId: string): Promise<Product[]> {
    const productsRef = collection(db, "products");
    // A simple query to get other products. For a real app, this could be based on category.
    const q = query(productsRef, where("id", "!=", currentProductId), limit(4));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
       const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Product;
    });
}


export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePosition({ x, y });
  };


  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
        setLoading(true);
        setQuantity(1); // Reset quantity on product change
        const productData = await getProduct(id);
        setProduct(productData);
        if (productData) {
            setSelectedImage(productData.image);
            const relatedData = await getRelatedProducts(id);
            setRelatedProducts(relatedData);
        }
        setLoading(false);
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  if (loading) {
      return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <div className="grid grid-cols-5 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-lg" />)}
                  </div>
                </div>
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
          <Link href="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  const galleryImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const hasOffer = product.offerPercentage && product.offerPercentage > 0;
  const discountedPrice = hasOffer ? product.price * (1 - product.offerPercentage! / 100) : product.price;
  const hasWholesale = product.wholesalePrice3 || product.wholesalePrice6 || product.wholesalePrice9;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div 
            className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg mb-4 cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            >
            <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
                {hasOffer && (
                    <Badge className='bg-green-600 text-white shadow-lg text-sm py-1 px-3'>
                        OFERTA {product.offerPercentage}%
                    </Badge>
                )}
                 {product.customTag && (
                    <Badge className='bg-sky-500 text-white shadow-lg text-sm py-1 px-3'>
                        {product.customTag}
                    </Badge>
                )}
            </div>
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 ease-in-out"
              style={{
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                transform: isZooming ? 'scale(2)' : 'scale(1)',
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={product.dataAiHint}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
                {galleryImages.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(img)} className={`relative aspect-square w-full overflow-hidden rounded-md border-2 transition-colors ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                        <Image
                            src={img}
                            alt={`Vista previa ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                        />
                    </button>
                ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          
          <div className="flex items-baseline gap-4">
            <p className={`text-3xl font-bold ${hasOffer ? 'text-green-600' : 'text-primary'}`}>{formatPrice(discountedPrice)}</p>
            {hasOffer && (
                 <p className="text-xl font-medium text-muted-foreground line-through">{formatPrice(product.price)}</p>
            )}
          </div>

          <div className='space-y-4'>
            <FormLabel>Cantidad</FormLabel>
            <div className="flex items-center border rounded-md w-fit">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button onClick={handleAddToCart} size="lg" className="group/button relative h-12 overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground text-base">
            <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300">
                <ShoppingCart className="h-6 w-6 mr-2" /> Añadir al Carrito
            </span>
          </Button>

          {hasWholesale && (
            <Alert>
                <ChevronsRight className="h-4 w-4" />
                <AlertTitle className='font-headline'>¡Disponible por mayor!</AlertTitle>
                <AlertDescription>
                    Este producto tiene un precio especial por compras por volumen. Los descuentos se aplican en el carrito.
                </AlertDescription>
            </Alert>
          )}

           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Descripción</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-base whitespace-pre-wrap">{product.description}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Información de Envío</AccordionTrigger>
                <AccordionContent className='space-y-4'>
                    <div className="flex items-start gap-4">
                        <Truck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className='font-semibold'>Envíos a todo Chile</h4>
                            <p className="text-muted-foreground">Realizamos envíos a todo el territorio nacional a través de empresas de transporte externas.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className='font-semibold'>Tiempos de Entrega</h4>
                            <p className="text-muted-foreground">El tiempo de entrega puede variar dependiendo de la zona de envío y la disponibilidad de la empresa de delivery. Recibirás un número de seguimiento para monitorear tu pedido.</p>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
