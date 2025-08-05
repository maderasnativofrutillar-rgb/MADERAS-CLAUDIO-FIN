import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative w-full h-[calc(100vh-5rem)] text-white">
        <Image 
          src="https://placehold.co/1920x1080.png"
          alt="Taller de Madera Nativo Sur"
          fill
          className="object-cover"
          priority
          data-ai-hint="wood workshop"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container h-full px-4 md:px-6">
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
              Madera Nativo Sur
            </h1>
            <p className="mx-auto max-w-[700px] text-lg md:text-xl">
              Artesanía en maderas nativas. Calidad y tradición desde el sur de Chile.
            </p>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
              <Link href="/#products">Explorar Productos</Link>
            </Button>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl md:text-5xl">Nuestra Esencia</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                Somos artesanos apasionados por la nobleza de la madera nativa del sur de Chile. Cada pieza es única, tallada con dedicación para llevar un trozo de la naturaleza a tu hogar.
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/about">
                  Conoce más
                </Link>
              </Button>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Maderas nobles"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              data-ai-hint="noble woods"
            />
          </div>
        </div>
      </section>
    </main>
  );
}