import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function EmpresasPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Soluciones en Madera para tu Empresa
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            En Madera Nativo Sur, ofrecemos productos de alta calidad y diseño único para el sector corporativo y HORECA (Hoteles, Restaurantes y Cafeterías). Desde tablas de presentación personalizadas hasta regalos corporativos con identidad local.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Trabajamos con maderas nobles del sur de Chile para crear piezas que reflejen la calidez, calidad y compromiso con la sustentabilidad de tu marca. Contáctanos para desarrollar un proyecto a la medida de tus necesidades.
          </p>
          <Button asChild size="lg">
            <Link href="/contacto">Cotiza con Nosotros</Link>
          </Button>
        </div>
        <div className="relative min-h-[400px]">
           <Image
                src="https://placehold.co/800x600.png"
                alt="Regalos corporativos de madera"
                fill
                className="rounded-lg object-cover shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint="corporate gifts wood"
            />
        </div>
      </div>
    </div>
  );
}
