import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Sobre Madera Nativo Sur
          </h1>
          <div className="space-y-4 text-muted-foreground text-lg">
            <p>
              Madera Nativo Sur nació de la pasión por la carpintería y el profundo respeto por la naturaleza y los bosques del sur de Chile. Somos un taller familiar dedicado a transformar maderas nativas nobles en piezas únicas y duraderas que llevan consigo la esencia de su origen.
            </p>
            <p>
              Nuestra misión es rescatar las técnicas artesanales de trabajo en madera, combinándolas con un diseño contemporáneo y funcional. Cada producto que sale de nuestro taller es el resultado de horas de dedicación, cuidado en los detalles y un compromiso inquebrantable con la calidad.
            </p>
            <p>
              Trabajamos de manera sostenible, utilizando madera proveniente de bosques manejados de forma responsable y planes de reforestación. Creemos que la belleza de la madera nativa debe ser preservada para las futuras generaciones, y nuestro trabajo es un homenaje a esa convicción.
            </p>
          </div>
        </div>
        <div className="relative min-h-[300px] md:min-h-full">
            <Image
                src="https://placehold.co/800x1000.png"
                alt="Artesano trabajando madera"
                fill
                className="rounded-lg object-cover shadow-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint="craftsman wood"
            />
        </div>
      </div>
    </div>
  );
}
