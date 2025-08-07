
import Image from "next/image";
import { HighlightedText } from "@/components/highlighted-text";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteImages } from "@/lib/types";


async function getSiteImages(): Promise<SiteImages> {
    const docRef = doc(db, "siteConfig", "images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as SiteImages;
    } else {
        return {
            hero: "https://placehold.co/1920x1080.png",
            essence: "https://placehold.co/600x400.png",
            about: "https://placehold.co/800x1000.png",
            portfolio: Array(5).fill("https://placehold.co/600x400.png"),
        };
    }
}

export default async function AboutPage() {
  const siteImages = await getSiteImages();
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-in-up">
            Nuestra pasión por la madera natural
          </h1>
          <div className="space-y-4 text-muted-foreground text-lg">
            <p className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Somos una familia de Frutillar que decidió transformar un sueño en realidad: crear productos con alma, que hablen por sí solos.
            </p>
            <p className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <HighlightedText>Fundamos Nativo Sur en 2022</HighlightedText> con un propósito claro: unir nuestras profesiones —yo, ingeniero en prevención de riesgos, y mi esposa, profesora— y convertirlas en una tienda llena de creatividad y propósito.
            </p>
            <p className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Trabajamos con maderas nativas de nuestra tierra, como el <HighlightedText>mañío, alerce y coihue</HighlightedText>, y también con maderas tradicionales como el pino, dando vida a cada diseño con mucha imaginación y pasión.
            </p>
             <p className="animate-fade-in-up font-medium text-foreground/90" style={{ animationDelay: '0.8s' }}>
              Desde nuestro hogar, con esfuerzo y dedicación, fabricamos productos únicos que emocionan y perduran. <HighlightedText>Cada tabla que sale de nuestro taller lleva consigo una historia… ¿Cuál será la tuya?</HighlightedText>
            </p>
          </div>
        </div>
        <div className="relative min-h-[300px] md:min-h-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Image
                src={siteImages.about}
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
