import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Box, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const portfolioImages = [
  { src: "https://placehold.co/600x400.png", alt: "Logo de empresa grabado en tabla", dataAiHint: "engraved logo board" },
  { src: "https://placehold.co/600x400.png", alt: "Set de regalos corporativos en madera", dataAiHint: "corporate gift set" },
  { src: "https://placehold.co/600x400.png", alt: "Tabla de picoteo personalizada", dataAiHint: "custom cheese board" },
  { src: "https://placehold.co/600x400.png", alt: "Reconocimiento de madera con grabado láser", dataAiHint: "laser award wood" },
  { src: "https://placehold.co/600x400.png", alt: "Cajas de madera con marca de empresa", dataAiHint: "branded wooden boxes" },
];


export default function EmpresasPage() {
  return (
    <>
      <section className="relative w-full py-20 md:py-32 bg-primary/5 text-center">
        <div className="container px-4 md:px-6">
            <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Regalos Personalizados para Empresas
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                Soluciones únicas para empresas que buscan regalos con significado y valor emocional. Contáctanos hoy.
            </p>
            <Button asChild size="lg">
                <Link href="/contacto">Contáctanos ¡Te ayudo!</Link>
            </Button>
        </div>
      </section>

       <section className="w-full py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <h2 className="text-center font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-12">
            Nuestro Portafolio
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {portfolioImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-300 hover:scale-105"
                                data-ai-hint={image.dataAiHint}
                            />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12" />
          </Carousel>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                    Fortalece tu Marca con Regalos Únicos
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4">
                    En Nativo Sur, creamos soluciones personalizadas para empresas, ofreciendo regalos únicos que transmiten emociones y fortalecen la identidad corporativa. Cada pieza es un reflejo de tu mensaje.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Briefcase className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-xl">Regalos Corporativos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Sorprende a tus clientes y colaboradores con regalos de madera nativa que reflejan calidad y autenticidad.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Award className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-xl">Reconocimientos Laborales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Diseñamos reconocimientos personalizados para trabajadores y clientes, utilizando CNC y grabado láser para garantizar precisión.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Box className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-xl">Productos a Medida</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Desarrollamos productos especiales según tus necesidades, desde tablas personalizadas hasta artículos de merchandising.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </section>
      
      <section className="py-12 md:py-24 bg-secondary/30 text-center">
        <div className="container px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6">
                ¿Listo para crear algo único?
            </h2>
            <Button asChild size="lg">
                <Link href="/contacto">Hablemos de tu Proyecto ¡Te ayudo!</Link>
            </Button>
        </div>
      </section>
    </>
  );
}
