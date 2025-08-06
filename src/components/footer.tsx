import Link from "next/link";
import { TreePine, Facebook, Instagram, Twitter, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <TreePine className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline text-lg">Nativo Sur</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Artesanía en madera que cuenta una historia. Desde Frutillar, Chile, al mundo.
            </p>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">Inicio</Link></li>
              <li><Link href="/#products" className="text-muted-foreground hover:text-primary">Tienda</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Nosotros</Link></li>
              <li><Link href="/contacto" className="text-muted-foreground hover:text-primary">Contacto</Link></li>
              <li><Link href="/empresas" className="text-muted-foreground hover:text-primary">Empresas</Link></li>
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
          <div>
            <h4 className="font-headline font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter size={20} /></Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MADERAS NATIVO SUR. Todos los derechos reservados.</p>
        </div>
      </div>
      <Link
        href="https://wa.me/56912345678"
        target="_blank"
        className="fixed bottom-6 right-6 group"
        aria-label="Contáctanos por WhatsApp"
      >
        <div className="flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out w-14 h-14 group-hover:w-64 group-hover:px-4">
          <Phone size={24} className="flex-shrink-0" />
          <span className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out max-w-0 font-bold group-hover:max-w-xs group-hover:ml-3">
            Escríbenos para ayudarte
          </span>
        </div>
      </Link>
    </footer>
  );
}
