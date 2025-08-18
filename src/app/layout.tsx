
'use client'

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientProviders } from '@/components/providers';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteImages } from '@/lib/types';
import Script from 'next/script';
import { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Madera Nativo Sur Tienda',
//   description: 'Tienda de artesanías en maderas nativas.',
// };

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteImages, setSiteImages] = useState<SiteImages | null>(null);

  useEffect(() => {
      const fetchImages = async () => {
          const images = await getSiteImages();
          setSiteImages(images);

          // Set document title
          document.title = 'Madera Nativo Sur Tienda';

          // Set favicon
          if (images.favicon) {
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = images.favicon;
          }
      };
      fetchImages();
  }, []);
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Madera Nativo Sur Tienda</title>
        <meta name="description" content="Tienda de artesanías en maderas nativas." />
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-0E89C0B1ZJ"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-0E89C0B1ZJ');
          `}
        </Script>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader logo={siteImages?.logo} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
