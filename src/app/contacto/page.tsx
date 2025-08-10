'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AtSign, MapPin, Phone } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    // This is a simplified submission handler.
    // In a real app, you'd likely fetch a server endpoint.
    // For Netlify, the form attributes handle everything.
    console.log('Contact form data:', data);
    toast({
      title: 'Mensaje Enviado',
      description: 'Gracias por contactarnos. Te responderemos a la brevedad.',
    });
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Contacto</h1>
        <p className="text-lg text-muted-foreground mt-2">¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-16">
        <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Envíanos un Mensaje</h2>
            <p className="text-muted-foreground mb-6">Completa el formulario y te responderemos a la brevedad.</p>
            <Form {...form}>
              <form 
                name="contact"
                method="POST"
                data-netlify="true"
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                {/* Hidden input for Netlify */}
                <input type="hidden" name="form-name" value="contact" />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Escribe tu consulta aquí..." rows={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full">
                  Enviar Mensaje
                </Button>
              </form>
            </Form>
        </div>
        <div className="space-y-8">
            <div>
                <h2 className="font-headline text-2xl font-bold mb-4">Información de Contacto</h2>
                <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <AtSign className="w-5 h-5 text-primary" />
                        <span>morenosasesorias@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="w-5 h-5 text-primary" />
                        <span>+56 9 1234 5678</span>
                    </div>
                     <div className="flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <p className="font-semibold text-foreground">Ubicación</p>
                            <p>Visítanos en nuestra tienda online para explorar artículos de madera natural del sur de Chile, como roble y rauli.</p>
                            <p className="mt-2 font-medium">Dirección - Sin atención presencial:</p>
                            <p>Diego Portales 860, Puerto Montt, Región De Los Lagos, Chile</p>
                            <p className="mt-2 font-medium">Horario:</p>
                            <p>Lunes a Viernes</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="font-headline text-2xl font-bold mb-4">Encuéntranos</h2>
                <div className="aspect-video w-full">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3006.118485210217!2d-72.94314738843976!3d-41.47898517116773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96183aadd843138b%3A0x194e43b67554972d!2sDiego%20Portales%20860%2C%20Puerto%20Montt%2C%20Los%20Lagos!5e0!3m2!1ses!2scl!4v1700000000000!5m2!1ses!2scl"
                        width="100%" 
                        height="100%" 
                        style={{border:0}}
                        allowFullScreen={false}
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
