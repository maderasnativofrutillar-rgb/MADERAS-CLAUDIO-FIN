
import { Suspense } from 'react';
import { TiendaPageContent } from '@/components/tienda-page-content';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function TiendaLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center mb-12">
        <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestra Tienda</h1>
        <p className="text-lg text-muted-foreground mt-2">Explora todos nuestros productos artesanales.</p>
      </div>

       <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-24 space-y-6">
             <h2 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filtros
            </h2>
            <Skeleton className="h-10 w-full" />
            <div>
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-52" />
          </div>
          
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                      <CardHeader>
                          <Skeleton className="h-48 w-full" />
                      </CardHeader>
                      <CardContent>
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2 mt-1" />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                           <Skeleton className="h-8 w-20" />
                           <Skeleton className="h-10 w-28" />
                      </CardFooter>
                  </Card>
              ))}
           </div>
        </main>
      </div>
    </div>
  );
}


export default function TiendaPage() {
  return (
    <Suspense fallback={<TiendaLoading />}>
      <TiendaPageContent />
    </Suspense>
  );
}
