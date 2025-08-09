
import { Suspense } from 'react';
import { ProductForm } from '@/components/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ProductFormSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

export default function ProductFormPage() {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <Card className="max-w-4xl mx-auto">
                 <CardHeader>
                    {/* El título se manejará dentro del componente del formulario para reflejar si es "Crear" o "Editar" */}
                    <CardTitle className="font-headline">Gestión de Producto</CardTitle>
                    <CardDescription>Completa los detalles para añadir o actualizar un producto en tu tienda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<ProductFormSkeleton />}>
                        <ProductForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
