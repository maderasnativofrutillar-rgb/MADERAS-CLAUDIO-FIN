import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientProviders } from '@/components/providers';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteImages } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Madera Nativo Sur Tienda',
  description: 'Tienda de artesanías en maderas nativas.',
};

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
            favicon: ""
        };
    }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteImages = await getSiteImages();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>{siteImages.favicon && <link rel="icon" href={siteImages.favicon} sizes="any" />}</head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader logo={siteImages.logo} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
