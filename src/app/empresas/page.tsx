
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { SiteImages } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const defaultPortfolioImages = [
  { src: "https://placehold.co/600x400.png", alt: "Logo de empresa grabado en tabla", dataAiHint: "engraved logo board" },
  { src: "https://placehold.co/600x400.png", alt: "Set de regalos corporativos en madera", dataAiHint: "corporate gift set" },
  { src: "https://placehold.co/600x400.png", alt: "Tabla de picoteo personalizada", dataAiHint: "custom cheese board" },
  { src: "https://placehold.co/600x400.png", alt: "Reconocimiento de madera con grabado láser", dataAiHint: "laser award wood" },
  { src: "https://placehold.co/600x400.png", alt: "Cajas de madera con marca de empresa", dataAiHint: "branded wooden boxes" },
];

async function getSiteImages(): Promise<SiteImages> {
    const docRef = doc(db, "siteConfig", "images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().portfolio?.length) {
        return docSnap.data() as SiteImages;
    } else {
        return {
            hero: "https://placehold.co/1920x1080.png",
            essence: "https://placehold.co/600x400.png",
            about: "https://placehold.co/800x1000.png",
            portfolio: defaultPortfolioImages.map(p => p.src),
            logo: "",
            favicon: "",
        };
    }
}

// Although this is a server component, we are making it async to fetch data
// but the functionality to open the dialog requires client-side interaction.
// We'll manage state in the client component below.
export default function EmpresasPageWrapper() {
  const [siteImages, setSiteImages] = useState<SiteImages | null>(null);

  useState(() => {
    getSiteImages().then(setSiteImages);
  });

  if (!siteImages) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  const portfolioImages = siteImages.portfolio.map((src, index) => ({
    src: src,
    alt: defaultPortfolioImages[index]?.alt || "Imagen de portafolio",
    dataAiHint: defaultPortfolioImages[index]?.dataAiHint || "corporate gift"
  }));

  return <EmpresasPageClient portfolioImages={portfolioImages} />;
}


function EmpresasPageClient({ portfolioImages }: { portfolioImages: {src: string, alt: string, dataAiHint: string}[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openDialog = (index: number) => {
    setSelectedImageIndex(index);
    setDialogOpen(true);
  };

  return (
    <>
      <section className="relative w-full py-20 md:py-32 bg-primary/5 text-center">
        <div className="container px-4 md:px-6">
            <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 animate-fade-in-up">
                Regalos Personalizados para Empresas
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Soluciones únicas para empresas que buscan regalos con significado y valor emocional. Contáctanos hoy.
            </p>
            <Button asChild size="lg" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/contacto">Contáctanos ¡Te ayudo!</Link>
            </Button>
        </div>
      </section>

       <section className="w-full py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <h2 className="text-center font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-12 animate-fade-in-up">
            Nuestro Portafolio
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto animate-fade-in"
          >
            <CarouselContent>
              {portfolioImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="overflow-hidden group cursor-pointer" onClick={() => openDialog(index)}>
                      <CardContent className="p-0">
                        <div className="aspect-video relative">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl w-full p-2 bg-transparent border-none shadow-none">
           <Carousel
            opts={{
              startIndex: selectedImageIndex,
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {portfolioImages.map((image, index) => (
                <CarouselItem key={index}>
                    <div className="relative aspect-video w-full">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-contain"
                        />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white bg-black/50 hover:bg-black/80 hover:text-white border-white/50" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white bg-black/50 hover:bg-black/80 hover:text-white border-white/50" />
          </Carousel>
        </DialogContent>
      </Dialog>


      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6 animate-fade-in-up">
                    Fortalece tu Marca con Regalos Únicos
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    En Nativo Sur, creamos soluciones personalizadas para empresas, ofreciendo regalos únicos que transmiten emociones y fortalecen la identidad corporativa. Cada pieza es un reflejo de tu mensaje.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Briefcase className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-xl">Regalos Corporativos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Sorprende a tus clientes y colaboradores con regalos de madera nativa que reflejan calidad y autenticidad.</p>
                        </CardContent>
                    </Card>
                     <Card className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Award className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-xl">Reconocimientos Laborales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Diseñamos reconocimientos personalizados para trabajadores y clientes, utilizando CNC y grabado láser para garantizar precisión.</p>
                        </CardContent>
                    </Card>
                     <Card className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
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
      
      <section className="py-12 md:py-16 bg-secondary/30 text-center">
        <div className="container px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl mb-6 animate-fade-in-up">
                ¿Listo para crear algo único?
            </h2>
            <Button asChild size="lg" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Link href="/contacto">Hablemos de tu Proyecto ¡Te ayudo!</Link>
            </Button>
        </div>
      </section>
    </>
  );
}
