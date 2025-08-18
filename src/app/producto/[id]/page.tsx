
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, MouseEvent, Suspense } from 'react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, ChevronsRight, Truck, Clock, Minus, Plus, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { CarouselWithProgress } from '@/components/product-carousel-progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

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
    const q = query(productsRef, limit(8)); 
    const querySnapshot = await getDocs(q);
    const allProducts = querySnapshot.docs.map(doc => {
       const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Product;
    });

    return allProducts
        .filter(p => p.id !== currentProductId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);
}

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProductData = async () => {
        setLoading(true);
        setSelectedQuantity(1); 
        const productData = await getProduct(id);
        if (productData) {
            setProduct(productData);
            setSelectedImage(productData.image);
            const relatedData = await getRelatedProducts(id);
            setRelatedProducts(relatedData);
        } else {
            setProduct(null);
        }
        setLoading(false);
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const quantity = selectedQuantity;
      let finalUnitPrice;
      
      // Determine the unit price based on the selected quantity bundle
      if (quantity === 3 && product.priceFor3 && product.priceFor3 > 0) {
          finalUnitPrice = product.priceFor3 / 3;
      } else if (quantity === 2 && product.priceFor2 && product.priceFor2 > 0) {
          finalUnitPrice = product.priceFor2 / 2;
      } else if (quantity === 1 && product.priceFor1 && product.priceFor1 > 0) {
          finalUnitPrice = product.priceFor1;
      } else {
        // Fallback to offer or base price
        finalUnitPrice = product.offerPercentage && product.offerPercentage > 0 
          ? product.price * (1 - product.offerPercentage/100) 
          : product.price;
      }
      
      addToCart(product, quantity, finalUnitPrice);
    }
  };

  const handleBuyNow = () => {
      if (product) {
          handleAddToCart();
          router.push('/checkout');
      }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  const galleryImages = product ? [product.image, ...(product.images || [])].filter(Boolean) as string[] : [];

  const handlePrevImage = () => {
      if (!selectedImage) return;
      const currentIndex = galleryImages.indexOf(selectedImage);
      const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      setSelectedImage(galleryImages[prevIndex]);
  };
  
  const handleNextImage = () => {
      if (!selectedImage) return;
      const currentIndex = galleryImages.indexOf(selectedImage);
      const nextIndex = (currentIndex + 1) % galleryImages.length;
      setSelectedImage(galleryImages[nextIndex]);
  };
  
  if (loading) {
      return <ProductDetailSkeleton />;
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

  const hasOffer = product.offerPercentage && product.offerPercentage > 0;
  const basePrice = product.price;
  const offerPrice = hasOffer ? basePrice * (1 - product.offerPercentage / 100) : basePrice;
  
  const hasBundlePrices = (product.priceFor1 && product.priceFor1 > 0) || (product.priceFor2 && product.priceFor2 > 0) || (product.priceFor3 && product.priceFor3 > 0);
  const hasSpecifications = product.width || product.length || product.thickness || product.woodType || product.madeIn || product.curing;

  const getPriceDescription = (quantity: number) => {
    if (!hasBundlePrices) return '';

    const unitPriceWithOffer = offerPrice;
    let bundleTotal: number | null = null;
    let originalTotal = unitPriceWithOffer * quantity;

    if (quantity === 1 && product.priceFor1) bundleTotal = product.priceFor1;
    if (quantity === 2 && product.priceFor2) bundleTotal = product.priceFor2;
    if (quantity === 3 && product.priceFor3) bundleTotal = product.priceFor3;
    

    if (bundleTotal && bundleTotal < originalTotal) {
        const savings = originalTotal - bundleTotal;
        const percentage = Math.round((savings / originalTotal) * 100);
        return `Ahorras un ${percentage}% extra`;
    }
    return 'Precio normal';
  }


  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] lg:gap-12 gap-8">
        
        {galleryImages.length > 1 && (
            <div className="flex lg:flex-col gap-2 order-first lg:order-none">
                {galleryImages.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(img)} className={`relative aspect-square w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                        <Image
                            src={img}
                            alt={`Vista previa ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}
            </div>
        )}

        <div 
          className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
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
              className="object-contain transition-opacity duration-300 ease-in-out md:group-hover:opacity-0"
              sizes="(max-width: 768px) 100vw, 50vw"
              data-ai-hint={product.dataAiHint}
            />
            <div 
                className={`hidden md:block absolute inset-0 pointer-events-none bg-no-repeat bg-contain transition-opacity duration-300 ${isZooming ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    backgroundImage: `url(${selectedImage || product.image})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%',
                }}
            />
            {galleryImages.length > 1 && (
                <>
                    <Button onClick={handlePrevImage} variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft />
                    </Button>
                     <Button onClick={handleNextImage} variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight />
                    </Button>
                </>
            )}
        </div>

        <div className="flex flex-col space-y-4">
          <h1 className="font-headline text-2xl md:text-3xl font-bold">{product.name}</h1>
          
          {product.summary && (
              <p className="text-muted-foreground text-base">{product.summary}</p>
          )}

          {hasBundlePrices ? (
             <RadioGroup defaultValue="1" onValueChange={(value) => setSelectedQuantity(parseInt(value))} className="space-y-2">
                {product.priceFor1 && product.priceFor1 > 0 && (
                    <Label htmlFor='q1' className={cn('flex items-center justify-between p-4 border rounded-lg cursor-pointer', {'border-primary ring-2 ring-primary': selectedQuantity === 1})}>
                        <div className="flex items-center gap-4">
                            <RadioGroupItem value="1" id="q1" />
                            <div>
                                <p className="font-bold">1 Unidad</p>
                                <p className="text-sm text-muted-foreground">{getPriceDescription(1)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(product.priceFor1)}</p>
                            {hasOffer && <p className="text-sm text-muted-foreground line-through">{formatPrice(basePrice)}</p>}
                        </div>
                    </Label>
                )}
                 {product.priceFor2 && product.priceFor2 > 0 && (
                    <Label htmlFor='q2' className={cn('relative flex items-center justify-between p-4 border rounded-lg cursor-pointer', {'border-primary ring-2 ring-primary': selectedQuantity === 2})}>
                         <Badge className="absolute -top-3 right-4 bg-foreground text-background">Más vendido</Badge>
                        <div className="flex items-center gap-4">
                            <RadioGroupItem value="2" id="q2" />
                            <div>
                                <p className="font-bold">2 Unidades</p>
                                <p className="text-sm text-muted-foreground">{getPriceDescription(2)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg">{formatPrice(product.priceFor2)}</p>
                             <p className="text-sm text-muted-foreground line-through">{formatPrice(offerPrice * 2)}</p>
                        </div>
                    </Label>
                )}
                {product.priceFor3 && product.priceFor3 > 0 && (
                    <Label htmlFor='q3' className={cn('flex items-center justify-between p-4 border rounded-lg cursor-pointer', {'border-primary ring-2 ring-primary': selectedQuantity === 3})}>
                        <div className="flex items-center gap-4">
                            <RadioGroupItem value="3" id="q3" />
                            <div>
                                <p className="font-bold">3 Unidades</p>
                                <p className="text-sm text-muted-foreground">{getPriceDescription(3)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg">{formatPrice(product.priceFor3)}</p>
                             <p className="text-sm text-muted-foreground line-through">{formatPrice(offerPrice * 3)}</p>
                        </div>
                    </Label>
                )}
             </RadioGroup>
          ) : (
            <div className="flex items-baseline gap-4">
                <p className={`text-2xl font-bold ${hasOffer ? 'text-green-600' : 'text-primary'}`}>{formatPrice(offerPrice)}</p>
                {hasOffer && <p className="text-lg font-medium text-muted-foreground line-through">{formatPrice(basePrice)}</p>}
            </div>
          )}
          
          <div className="grid sm:grid-cols-2 gap-3 pt-4">
            <Button onClick={handleAddToCart} size="lg" variant="outline" className="text-base">
                <ShoppingCart className="h-5 w-5 mr-2" /> Añadir al Carrito
            </Button>
             <Button onClick={handleBuyNow} size="lg" className="text-base">
                Comprar Ahora
            </Button>
          </div>
          

           <Accordion type="single" collapsible className="w-full pt-4" defaultValue='description'>
              <AccordionItem value="description">
                <AccordionTrigger>Descripción</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-base whitespace-pre-wrap">{product.description}</p>
                </AccordionContent>
              </AccordionItem>
              {hasSpecifications && (
                  <AccordionItem value="specifications">
                      <AccordionTrigger>Especificaciones</AccordionTrigger>
                      <AccordionContent>
                          <ul className="space-y-2 text-muted-foreground">
                              {product.length && product.width && product.thickness && (
                                  <li className='flex items-center gap-2'><Ruler size={16} className='text-primary' /> Dimensiones: {product.length}cm x {product.width}cm x {product.thickness}cm</li>
                              )}
                              {product.woodType && <li className='flex items-center gap-2'><Ruler size={16} className='text-primary' /> Madera: {product.woodType}</li>}
                              {product.madeIn && <li className='flex items-center gap-2'><Ruler size={16} className='text-primary' /> Hecho en: {product.madeIn}</li>}
                              {product.curing && <li className='flex items-center gap-2'><Ruler size={16} className='text-primary' /> Curado con: {product.curing}</li>}
                          </ul>
                      </AccordionContent>
                  </AccordionItem>
              )}
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

      {relatedProducts.length > 0 && (
        <div className="mt-24">
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-8">También te podría interesar</h2>
            <div className="mt-8">
                <CarouselWithProgress products={relatedProducts} />
            </div>
        </div>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-[1fr_2fr] lg:grid-cols-[auto_1fr_1fr] gap-8">
             {/* Thumbnails */}
            <div className="hidden lg:flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-20 rounded-md" />)}
            </div>
            {/* Main Image */}
            <Skeleton className="aspect-square w-full rounded-lg" />
            {/* Details */}
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

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent />
    </Suspense>
  )
}
