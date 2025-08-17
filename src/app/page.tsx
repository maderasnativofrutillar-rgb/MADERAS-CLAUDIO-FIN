
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query, doc, getDoc } from "firebase/firestore";
import { Product, SiteImages } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { TypewriterEffect } from "@/components/typewriter-effect";
import { CarouselWithProgress } from "@/components/product-carousel-progress";

async function getFeaturedProducts(): Promise<Product[]> {
  const productsCollection = collection(db, "products");
  const q = query(productsCollection, orderBy("createdAt", "desc"), limit(8));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to a serializable format (ISO string)
      createdAt: data.createdAt?.toDate().toISOString(),
    } as Product;
  });
}

async function getSiteImages(): Promise<SiteImages> {
    const docRef = doc(db, "siteConfig", "images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as SiteImages;
    } else {
        // Return default placeholders if document doesn't exist
        return {
            hero: "https://placehold.co/1920x1080.png",
            essence: "https://placehold.co/600x400.png",
            about: "https://placehold.co/800x1000.png",
            portfolio: Array(5).fill("https://placehold.co/600x400.png"),
            logo: "",
            favicon: ""
        };
    }
}


export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const siteImages = await getSiteImages();

  return (
    <main className="flex-1">
      <section className="relative w-full h-screen text-white bg-foreground/20">
        {siteImages.hero && (
            <Image
            src={siteImages.hero}
            alt="Taller de Madera Nativo Sur"
            fill
            className="object-cover animate-image-in"
            priority
            data-ai-hint="wood workshop"
            />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container h-full px-4 md:px-6">
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
            <p className="font-light tracking-widest uppercase text-sm md:text-base">El estilo del sur directo a tu hogar</p>
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none uppercase">
              ¿TIENES UNA IDEA?
            </h1>
            <TypewriterEffect
              strings={[
                'Nosotros la hacemos realidad',
                '¡Diseños únicos para ti!',
              ]}
            />
            <div className="flex flex-col sm:flex-row gap-4">
               <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/#products">Productos</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contacto">Contáctanos</Link>
              </Button>
            </div>
            <div className="absolute bottom-10 flex flex-col items-center gap-2">
                <p className="text-sm uppercase tracking-wider">Síguenos en nuestras redes para que estés actualizado de todas las novedades</p>
                <div className="flex items-center gap-4">
                    <Link href="#" className="text-white hover:text-primary"><Instagram size={24} /></Link>
                    <Link href="#" className="text-white hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.52.02c1.31-.02 2.61.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.65 4.24 1.71v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-1.06-.64-1.9-1.54-2.46-2.65-1.1-2.26-1.1-5.18-.01-7.44.83-1.7 2.1-3.05 3.73-3.92 1.43-.78 3.04-1.17 4.65-1.16.02 2.84-.01 5.68.01 8.52-.01 1.05-.45 2.09-.96 3.02-.75 1.4-2.14 2.37-3.64 2.45-1.1.06-2.16-.3-3.04-1.01-.8-.61-1.28-1.5-1.57-2.51-.43-1.48-.43-3.15.01-4.63.48-1.63 1.55-3.03 3-3.95s3.23-1.43 4.95-1.42c.03 1.55.02 3.1.01 4.64.01 1.49-.49 2.94-1.43 4.02-1.03 1.19-2.58 1.84-4.14 1.79-1.09-.03-2.16-.48-2.93-1.25-.69-.7-1.14-1.58-1.28-2.56-.25-1.74.28-3.5.95-5.02.63-1.44 1.6-2.68 2.87-3.58.91-.65 1.95-1.09 3.03-1.32.95-.21 1.92-.3 2.89-.31.03-1.5.02-2.99.01-4.49z"/></svg>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </section>
      <section id="products" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Nuestros Productos</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubre nuestra selección de productos hechos a mano con las mejores maderas nativas.
              </p>
            </div>
          </div>
          <div className="mt-12">
             <CarouselWithProgress products={featuredProducts} />
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Nuestra Esencia</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Somos artesanos apasionados por la nobleza de la madera nativa del sur de Chile. Cada pieza es única, tallada con dedicación para llevar un trozo de la naturaleza a tu hogar.
              </p>
              <Button asChild>
                <Link href="/about">
                  Conoce más
                </Link>
              </Button>
            </div>
            {siteImages.essence && (
                <Image
                src={siteImages.essence}
                alt="Maderas nobles"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                data-ai-hint="noble woods"
                />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
