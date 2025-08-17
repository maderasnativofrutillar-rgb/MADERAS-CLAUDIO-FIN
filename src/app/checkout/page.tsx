

'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MiniProductCard } from '@/components/mini-product-card';
import { Trash2, Loader2, Info, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Product, SiteImages } from '@/lib/types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createFlowOrder } from '@/actions/flow-actions';
import { shippingZones, chileanRegions } from '@/lib/constants';

const FREE_SHIPPING_THRESHOLD = 49000;

// RUT validation function
const validateRut = (rut: string) => {
  if (!rut) return false;
  // Clean RUT (remove dots and convert K to lowercase)
  const cleanRut = rut.replace(/\./g, '').toLowerCase();

  if (!/^[0-9]+-[0-9k]{1}$/.test(cleanRut)) return false;
  
  const [body, dv] = cleanRut.split('-');
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const calculatedDv = 11 - (sum % 11);
  const dvChar = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'k' : String(calculatedDv);
  
  return dvChar === dv;
};


const checkoutSchema = z.object({
  firstName: z.string().min(2, 'El nombre es requerido'),
  lastName: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  rut: z.string().refine(validateRut, { message: 'El RUT ingresado no es válido.' }),
  phone: z.string().min(9, 'El celular debe tener 9 dígitos').max(9, 'El celular debe tener 9 dígitos'),
  region: z.string({ required_error: 'La región es requerida.' }),
  commune: z.string({ required_error: 'La comuna es requerida.' }),
  street: z.string().min(3, 'La calle es requerida.'),
  number: z.string().min(1, 'El número es requerido.'),
  apartment: z.string().optional(),
  orderNotes: z.string().optional(),
  acceptTerms: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones." }),
  }),
  newsletter: z.boolean().default(false).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [shippingZone, setShippingZone] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableCommunes, setAvailableCommunes] = useState<string[]>([]);
  const [paymentMethodsImage, setPaymentMethodsImage] = useState<string>("");
  
  const isFreeShipping = useMemo(() => cartTotal >= FREE_SHIPPING_THRESHOLD, [cartTotal]);

  useEffect(() => {
    if (isFreeShipping) {
      setShippingCost(0);
      setShippingZone('free');
    } else {
      const cost = shippingZones[shippingZone as keyof typeof shippingZones]?.price ?? 0;
      setShippingCost(cost);
    }
  }, [isFreeShipping, shippingZone]);


  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch Products
      const productsQuery = await getDocs(collection(db, "products"));
      const productsData = productsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setAllProducts(productsData);

      // Fetch Site Images (for payment methods)
      const imagesDocRef = doc(db, "siteConfig", "images");
      const imagesDocSnap = await getDoc(imagesDocRef);
      if (imagesDocSnap.exists()) {
          const imagesData = imagesDocSnap.data() as SiteImages;
          setPaymentMethodsImage(imagesData.paymentMethods || "");
      }
    };
    fetchInitialData();
  }, []);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur', // Trigger validation on blur
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      rut: '',
      phone: '',
      region: undefined,
      commune: undefined,
      street: '',
      number: '',
      apartment: '',
      orderNotes: '',
      acceptTerms: false,
      newsletter: false,
    },
  });

  const selectedRegion = form.watch('region');
  const acceptTerms = form.watch('acceptTerms');

  useEffect(() => {
    if (selectedRegion) {
        const regionData = chileanRegions.find(r => r.name === selectedRegion);
        setAvailableCommunes(regionData ? regionData.communes : []);
        // Reset commune field when region changes
        form.setValue('commune', '', { shouldValidate: true });
    } else {
        setAvailableCommunes([]);
         form.setValue('commune', '', { shouldValidate: true });
    }
  }, [selectedRegion, form]);

  const handleShippingZoneChange = (zoneKey: string) => {
    setShippingZone(zoneKey);
  };
  
  const finalTotal = cartTotal + shippingCost;

  const suggestedProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    const cartItemIds = new Set(cartItems.map(item => item.id));
    return allProducts.filter(p => !cartItemIds.has(p.id)).sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [cartItems, allProducts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!isFreeShipping && shippingCost === 0) {
        toast({ title: 'Falta información', description: 'Por favor, selecciona una zona de envío.', variant: 'destructive'});
        return;
    }

    setIsProcessing(true);
    toast({
        title: 'Preparando tu pago...',
        description: 'Serás redirigido a Flow para completar la compra.',
    });
    
    try {
        const paymentData = {
            amount: finalTotal,
            email: data.email,
            commerceOrder: `NATIVO-SUR-${Date.now()}`
        };

        const result = await createFlowOrder(paymentData);

        if ('url' in result && result.url && result.token) {
            window.location.href = `${result.url}?token=${result.token}`;
        } else {
            throw new Error(result.message || 'Error desconocido al crear la orden de pago.');
        }

    } catch (error) {
        console.error("Payment error:", error);
        const errorMessage = error instanceof Error ? error.message : 'No se pudo conectar con la pasarela de pago.';
        toast({
            title: 'Error en el Pago',
            description: errorMessage,
            variant: 'destructive'
        });
        setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !form.formState.isSubmitSuccessful) {
    return (
      <div className="container mx-auto text-center py-24">
        <h1 className="font-headline text-2xl">Tu carrito está vacío.</h1>
        <p className="text-muted-foreground">Añade productos para poder proceder al pago.</p>
        <Button onClick={() => router.push('/tienda')} className="mt-4">Volver a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Finalizar Compra
        </h1>
         <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">¡Estás a solo un paso de llevar la magia del sur a tu hogar! Gracias por elegirnos.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">1. Información de Contacto y Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form id="checkout-form" className="space-y-8">
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="juan.perez@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="rut" render={({ field }) => (
                      <FormItem><FormLabel>RUT</FormLabel><FormControl><Input placeholder="12.345.678-9" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <div className="flex items-center">
                              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-sm h-10">+56</span>
                              <FormControl>
                                  <Input type="tel" placeholder="9 1234 5678" {...field} className="rounded-l-none" />
                              </FormControl>
                          </div>
                          <FormMessage />
                      </FormItem>
                  )} />
                </div>
                
                <Separator />

                <div>
                    <h3 className="font-headline text-lg font-semibold mb-4">2. Dirección de Envío</h3>
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                             <FormField control={form.control} name="region" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Región</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una región" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {chileanRegions.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="commune" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comuna</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedRegion}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una comuna" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {availableCommunes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem className="sm:col-span-2"><FormLabel>Calle</FormLabel><FormControl><Input placeholder="Av. Siempre Viva" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="number" render={({ field }) => (
                                <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="apartment" render={({ field }) => (
                            <FormItem><FormLabel>Departamento / Casa (Opcional)</FormLabel><FormControl><Input placeholder="Casa 2, Depto. 101..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="orderNotes" render={({ field }) => (
                            <FormItem><FormLabel>Notas del Pedido (Opcional)</FormLabel><FormControl><Textarea placeholder="Ej: Dejar en conserjería, llamar antes de llegar..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="font-headline">Resumen de tu Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" unoptimized/>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{item.name}</p>
                                <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                    <span className="w-4 text-center font-medium text-sm">{item.quantity}</span>
                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                                </div>
                            </div>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="h-8 w-8 flex-shrink-0">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                  ))}
                  <Separator />
                   <div className="flex justify-between text-muted-foreground">
                    <p>Subtotal</p>
                    <p>{formatPrice(cartTotal)}</p>
                  </div>
                
                   <div className="flex justify-between text-muted-foreground">
                    <p>Envío</p>
                    <p>{isFreeShipping ? <span className="font-bold text-green-600">GRATIS</span> : (shippingCost > 0 ? formatPrice(shippingCost) : 'Selecciona una zona')}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>{formatPrice(finalTotal)}</p>
                  </div>

                  <Card className="mt-4">
                    <CardHeader className="p-4">
                        <CardTitle className="text-base font-headline">3. Costo de Envío</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {isFreeShipping ? (
                            <Alert className="border-green-300 bg-green-50 text-green-800">
                                <Info className="h-4 w-4 !text-green-600" />
                                <AlertTitle>¡Felicitaciones!</AlertTitle>
                                <AlertDescription>Tu compra califica para envío gratuito.</AlertDescription>
                            </Alert>
                        ) : (
                             <Select onValueChange={handleShippingZoneChange} disabled={isFreeShipping}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu zona de envío" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(shippingZones).map(([key, {name, price}]) => (
                                        <SelectItem key={key} value={key}>{name} ({formatPrice(price)})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </CardContent>
                  </Card>
                  
                  <div className="mt-6 space-y-4">
                    <p className="text-xs text-muted-foreground">Tus datos personales se utilizarán para procesar tu pedido, mejorar tu experiencia en esta web y otros propósitos descritos en nuestra <Link href="/legal/privacidad" className="underline" target="_blank">política de privacidad</Link>.</p>
                    <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>He leído y estoy de acuerdo con los <Link href="/legal/terminos" className="underline" target="_blank">términos y condiciones</Link> de la web *</FormLabel>
                            <FormMessage />
                        </div>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="newsletter" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Quiero recibir noticias de productos, descuentos y lanzamientos.</FormLabel>
                        </div>
                      </FormItem>
                    )} />
                  </div>

                  <div className="mt-6">
                    {paymentMethodsImage && (
                        <Image src={paymentMethodsImage} alt="Métodos de pago" width={300} height={100} className="mx-auto" data-ai-hint="payment methods" />
                    )}
                  </div>

                   <Button form="checkout-form" type="submit" size="lg" className="w-full text-base mt-6" disabled={isProcessing || !acceptTerms}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <CreditCard className="mr-2 h-5 w-5" />
                    )}
                    {isProcessing ? 'Procesando...' : `Pagar de forma segura ${formatPrice(finalTotal)}`}
                </Button>
                </div>
              </CardContent>
            </Card>

            <div>
                <h2 className="font-headline text-xl text-center font-bold mb-4">Que no se te olvide acompañar tu compra de...</h2>
                <Carousel
                    opts={{ align: "start", loop: true, }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2">
                    {suggestedProducts.map((product) => (
                        <CarouselItem key={product.id} className="pl-2 basis-1/2 md:basis-1/3">
                            <MiniProductCard product={product} />
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8" />
                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8" />
                </Carousel>
            </div>
        </div>

      </div>
    </div>
  );
}

    