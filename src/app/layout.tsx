import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Madera Nativo Sur Tienda',
  description: 'Tienda de artesanías en maderas nativas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
