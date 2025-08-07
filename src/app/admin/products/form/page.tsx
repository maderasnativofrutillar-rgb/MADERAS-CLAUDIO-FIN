
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Product;
    } else {
        console.error("No such document!");
        return null;
    }
}

export default function ProductFormPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (productId) {
            setLoading(true);
            getProduct(productId)
                .then(productData => {
                    if (productData) {
                        setProduct(productData);
                    } else {
                        setError('Producto no encontrado.');
                    }
                })
                .catch(err => {
                    console.error("Error fetching product:", err);
                    setError('Error al cargar el producto.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false); // Not editing, so no need to load
        }
    }, [productId]);

    const isLoading = !!productId && loading;
    const isCreating = !productId;

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">{isCreating ? 'Añadir Nuevo Producto' : 'Editar Producto'}</CardTitle>
                    <CardDescription>{isCreating ? 'Completa los detalles para añadir un nuevo producto a tu tienda.' : 'Actualiza los detalles del producto.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-10 w-1/2" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : error ? (
                         <div className="text-center py-12 text-destructive">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <ProductForm product={product} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
