import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Nuestra pasión por la madera natural
          </h1>
          <div className="space-y-4 text-muted-foreground text-lg">
            <p>
              Somos una familia de Frutillar que decidió transformar un sueño en realidad: crear productos con alma, que hablen por sí solos.
            </p>
            <p>
              Fundamos Nativo Sur en 2022 con un propósito claro: unir nuestras profesiones —yo, ingeniero en prevención de riesgos, y mi esposa, profesora— y convertirlas en una tienda llena de creatividad y propósito.
            </p>
            <p>
              Trabajamos con maderas nativas de nuestra tierra, como el mañío, alerce y coihue, y también con maderas tradicionales como el pino, dando vida a cada diseño con mucha imaginación y pasión.
            </p>
             <p>
              Desde nuestro hogar, con esfuerzo y dedicación, fabricamos productos únicos que emocionan y perduran. Cada tabla que sale de nuestro taller lleva consigo una historia… ¿Cuál será la tuya?
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
