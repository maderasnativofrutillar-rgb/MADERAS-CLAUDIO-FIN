
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

// Ensure this page is dynamically rendered
export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
                <p className="text-sm uppercase tracking-wider">Síguenos en nuestras redes</p>
                <div className="flex items-center gap-6 text-lg">
                    <Link href="#" className="text-pink-400 font-bold hover:text-white transition-colors">INSTAGRAM</Link>
                    <Link href="#" className="text-cyan-400 font-bold hover:text-white transition-colors">TIKTOK</Link>
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
