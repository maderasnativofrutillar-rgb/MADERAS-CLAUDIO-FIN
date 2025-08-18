
import Link from "next/link";
import { TreePine, Phone, Instagram } from "lucide-react";
import { categories } from "@/lib/constants";
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteImages } from '@/lib/types';
import Image from 'next/image';


function slugify(text: string) {
    if (typeof text !== 'string') return '';
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function getSiteImages(): Promise<SiteImages> {
    const docRef = doc(db, "siteConfig", "images");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as SiteImages;
    } else {
        return {
            hero: "",
            essence: "",
            about: "",
            portfolio: [],
            logo: "",
            favicon: "",
            paymentMethods: ""
        };
    }
}


export async function SiteFooter() {
  const siteImages = await getSiteImages();
  
  return (
    <>
      <footer className="border-t bg-secondary/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="space-y-4 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2">
                <TreePine className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">MADERAS NATIVO SUR</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Artesanía en madera que cuenta una historia. Desde Frutillar, Chile, al mundo.
              </p>
               <div className="flex items-center space-x-4 pt-2">
                  <a href="https://www.instagram.com/m_nativo_sur?igsh=MTJqMHpnbzV1ZW1lbQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Nativo Sur">
                    <Instagram className="h-6 w-6 text-muted-foreground transition-colors hover:text-pink-500" />
                  </a>
                  <a href="https://www.tiktok.com/@nativo_sur_2112" target="_blank" rel="noopener noreferrer" aria-label="TikTok de Nativo Sur">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground">
                        <path d="M21 7.5a1.9 1.9 0 0 1-2.3 1.2c-.4-.1-.8-.4-1-.7a5.3 5.3 0 0 0-3.1-4.1 4.9 4.9 0 0 0-5.1 1.6A5.4 5.4 0 0 0 7.8 12v5a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V7.5a1.4 1.4 0 0 1 1.2-1.2Z" />
                    </svg>
                  </a>
              </div>
               {siteImages.paymentMethods && (
                <div className="pt-4">
                  <Image src={siteImages.paymentMethods} alt="Métodos de pago" width={255} height={50} style={{ objectFit: 'contain' }} />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-primary">Inicio</Link></li>
                <li><Link href="/tienda" className="text-muted-foreground hover:text-primary">Tienda</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">Nosotros</Link></li>
                <li><Link href="/contacto" className="text-muted-foreground hover:text-primary">Contacto</Link></li>
                <li><Link href="/empresas" className="text-muted-foreground hover:text-primary">Empresas</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-headline font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 5).map(category => (
                    <li key={category}>
                        <Link href={`/tienda?categoria=${slugify(category)}`} className="text-muted-foreground hover:text-primary">
                            {category}
                        </Link>
                    </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/legal/terminos" className="text-muted-foreground hover:text-primary">Términos y Condiciones</Link></li>
                <li><Link href="/legal/privacidad" className="text-muted-foreground hover:text-primary">Política de Privacidad</Link></li>
                <li><Link href="/legal/reembolso" className="text-muted-foreground hover:text-primary">Política de Reembolso</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MADERAS NATIVO SUR. Todos los derechos reservados.</p>
          </div>
        </div>
        <Link
          href="https://wa.me/56959328956"
          target="_blank"
          className="fixed bottom-6 right-6 group"
          aria-label="Contáctanos por WhatsApp"
        >
          <div className="flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out w-14 h-14 hover:w-60">
            <Phone size={24} className="flex-shrink-0" />
            <span className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 font-bold group-hover:max-w-xs group-hover:ml-3">
              Chatea con Nosotros
            </span>
          </div>
        </Link>
      </footer>
      <div className="bg-background text-center py-2 px-4 text-xs text-muted-foreground">
        <p>Desarrollado por Fenrir - MORC - Fjavier.morc@gmail.com</p>
      </div>
    </>
  );
}
