'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { products } from '@/lib/constants';
import React, { useState, useMemo } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MiniProductCard } from '@/components/mini-product-card';

const regions = {
  "sur-extremo": { name: "Zona Sur Extrema (Aysén, Magallanes)", price: 10000 },
  "norte-extremo": { name: "Zona Norte Extrema (Arica, Tarapacá, Antofagasta)", price: 10000 },
  "resto": { name: "Resto del país", price: 5600 },
};

const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  address: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  country: z.string().min(2, 'El país es requerido'),
  region: z.string({ required_error: 'Debes seleccionar una región para el envío.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [shippingCost, setShippingCost] = useState(0);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      country: 'Chile',
    },
  });

  const handleRegionChange = (regionKey: string) => {
    const cost = regions[regionKey as keyof typeof regions]?.price ?? 0;
    setShippingCost(cost);
  };
  
  const finalTotal = cartTotal + shippingCost;

  const suggestedProducts = useMemo(() => {
    const cartItemIds = new Set(cartItems.map(item => item.id));
    return products.filter(p => !cartItemIds.has(p.id)).sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  const onSubmit = (data: CheckoutFormValues) => {
    console.log('Form data:', data, 'Shipping Cost:', shippingCost);
    toast({
        title: 'Procesando Pago...',
        description: 'Serás redirigido en un momento.',
    });

    setTimeout(() => {
        clearCart();
        toast({
            title: '¡Pago Exitoso!',
            description: 'Gracias por tu compra. Hemos recibido tu pedido.',
        });
        router.push('/');
    }, 2000);
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Información de Contacto y Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="juan.perez@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Av. Siempre Viva 123" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input placeholder="Frutillar" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                   <FormField control={form.control} name="region" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Región de Envío</FormLabel>
                       <Controller
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                handleRegionChange(value);
                            }} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una región" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(regions).map(([key, {name}]) => (
                                        <SelectItem key={key} value={key}>{name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         )}
                        />
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={cartItems.length === 0 || shippingCost === 0}>
                    Pagar con Flow {formatPrice(finalTotal)}
                </Button>
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
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px"/>
                        </div>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <Separator />
                   <div className="flex justify-between text-muted-foreground">
                    <p>Subtotal</p>
                    <p>{formatPrice(cartTotal)}</p>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <p>Envío</p>
                    <p>{shippingCost > 0 ? formatPrice(shippingCost) : 'Selecciona una región'}</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>{formatPrice(finalTotal)}</p>
                  </div>
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
